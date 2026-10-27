---

title: Redis HyperLogLog：12 KB 的基数账本
tags:
  - Redis
categories: [Database, Redis]
abbrlink: 8bd3804a
date: 2026-10-21
series: [Redis]

---

## 一、基数统计的三条路线：精度、空间与可枚举性

基数（cardinality）指一个集合中**不重复元素的个数**。每日 UV、活跃设备数、搜索词去重数、独立 IP 数，报的都是这个量。它和「集合里有哪些元素」是两件事：业务只要那个数字，却常常顺手把元素也存了下来。

精确做法的成本很直白：要判断一个元素是否出现过，就必须记住所有出现过的元素。

| 路线 | 存储单元 | 1 亿基数的空间量级 | 能否枚举元素 | 能否删除 | 误差 |
|---|---|---|---|---|---|
| Set | 每个元素一条记录 | 数 GB | 能 | 能 | 0 |
| Bitmap | 每个可能值 1 bit | 取决于取值域，1 亿位 = 12.5 MB | 能（按位反查） | 能（清位） | 0 |
| HyperLogLog | 固定 16384 个 6 bit 计数器 | 12304 字节 | 不能 | 不能 | 约 0.81% |

Bitmap 看着已经很省，但它要求取值域可枚举、可映射到一个连续的下标区间。用户 ID 是 16 位随机数字时，位图退化成几 TB 的稀疏数组，这条路直接断掉。HyperLogLog 把「记住元素」换成「记住元素哈希的统计特征」，用可控的相对误差换掉与基数无关的常数空间。

**本质一句话：HyperLogLog 不记录元素，只记录哈希值在每一位上留下的一次伯努利试验结果，用这些结果反推试验总次数。**

## 二、一次哈希，两段用途

哈希在这里的作用不是查找，而是**把任意输入压成一个近似均匀随机的 64 位整数**。元素的语义被抹掉，只剩下均匀性这一种可被数学处理的资源。

这个 64 位整数被切成两段，各管一件事：

<div align="center">
<svg viewBox="0 0 680 250" width="100%" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
<text x="40" y="24" font-size="14" font-weight="600" fill="#1f2328">64 位哈希的两段分工</text>
<rect x="40" y="40" width="468" height="54" rx="6" fill="#ddf4ff" stroke="#0969da" stroke-width="1.5"/>
<rect x="508" y="40" width="132" height="54" rx="6" fill="#dafbe1" stroke="#1a7f37" stroke-width="1.5"/>
<text x="274" y="64" font-size="13" fill="#1f2328" text-anchor="middle">高位 50 位</text>
<text x="274" y="82" font-size="12" fill="#57606a" text-anchor="middle">从低位往高位数，第一个 1 在第几位</text>
<text x="574" y="64" font-size="13" fill="#1f2328" text-anchor="middle">低 14 位</text>
<text x="574" y="82" font-size="12" fill="#57606a" text-anchor="middle">桶索引 0 ~ 16383</text>
<text x="40" y="118" font-size="12" fill="#57606a">位 63</text>
<text x="628" y="118" font-size="12" fill="#57606a" text-anchor="end">位 0</text>
<line x1="40" y1="106" x2="40" y2="112" stroke="#8c959f" stroke-width="1"/>
<line x1="640" y1="106" x2="640" y2="112" stroke="#8c959f" stroke-width="1"/>
<rect x="40" y="136" width="600" height="40" rx="6" fill="#f6f8fa" stroke="#d0d7de"/>
<text x="52" y="161" font-size="13" fill="#1f2328" font-family="Consolas,Menlo,monospace">… 0 1 1 0 1 0 1 0 1 1 0 1 1 1 0 1 1 1</text>
<text x="640" y="196" font-size="12.5" fill="#1f2328" text-anchor="end">低 14 位 = 0b10101101110111 = 11127 → 落在 11127 号桶</text>
<text x="640" y="218" font-size="12.5" fill="#1f2328" text-anchor="end">高位首个 1 之前有 2 个 0 → 本次试验计数为 3</text>
<text x="40" y="240" font-size="12" fill="#57606a">两段互不重叠，选桶结果不携带任何计数信息</text>
</svg>
</div>

两段之所以能各管一件事，靠的是「每一位独立同分布」这条性质。均匀 64 位整数中，某一位为 1 的概率是 1/2，连续 k 位都为 0 的概率是 2⁻ᵏ，与这串位出现在哪一段无关。选桶用的是低 14 位，计数用的是剩下 50 位，两个随机变量相互独立。

这条性质决定了计数的分布：把「从边界开始数，第一个 1 出现在第 k 位」看作一次伯努利试验，那么计数 ≥ k 的概率是 2⁻ᵏ。一次试验的期望值约为 2，但会出现很长的游程。**在 n 次独立试验里，最长游程约等于 log₂n**，这正是能反推 n 的依据。

Redis 的实际代码数的是低位一侧的连续零（`__builtin_ctzll`），统计上与数前导零完全等价，只是指令更快：

```python
def pat_len(h):
    idx = h & (M - 1)                 # 低 14 位选桶
    w = (h >> 14) | (1 << 50)         # 高位，打一个哨兵位防止死循环
    return idx, (w & -w).bit_length() # 尾零个数 + 1
```

## 三、寄存器只保存最大值

每个桶里放一个 6 bit 的计数器，记录**落在这个桶的所有元素里出现过的最大计数值**。写入是取 max，不是累加，也不保存任何顺序：

```python
def add(self, elem):
    i, c = pat_len(h64(elem))
    if c > self.reg[i]:
        self.reg[i] = c
        return 1        # 内部状态被更新
    return 0            # 状态不变
```

取 max 是这套结构成立的支点。基数是集合属性，与写入次数、写入顺序无关；取 max 恰好也满足「去掉重复、忽略顺序」。同一条数据写 10 万次，寄存器只在第一次变化：

```text
首次 PFADD 返回 1，之后 10 万次累计返回 1 的次数 0
当前基数估计 1
```

反推的直觉很朴素：m 个桶一共接了 n 个元素，平均每桶 n/m 个。每桶最大值约等于 log₂(n/m)。把它解出来就是 n ≈ m·2^R，其中 R 是寄存器值的某种平均。

<div align="center">
<svg viewBox="0 0 680 220" width="100%" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
<text x="40" y="24" font-size="14" font-weight="600" fill="#1f2328">寄存器数组与估计链路</text>
<g font-size="14" fill="#1f2328" text-anchor="middle">
<rect x="40" y="44" width="56" height="46" rx="5" fill="#fff8c5" stroke="#9a6700"/><text x="68" y="73">2</text>
<rect x="106" y="44" width="56" height="46" rx="5" fill="#f6f8fa" stroke="#d0d7de"/><text x="134" y="73">1</text>
<rect x="172" y="44" width="56" height="46" rx="5" fill="#fff8c5" stroke="#9a6700"/><text x="200" y="73">4</text>
<rect x="238" y="44" width="56" height="46" rx="5" fill="#f6f8fa" stroke="#d0d7de"/><text x="266" y="73">1</text>
<rect x="304" y="44" width="56" height="46" rx="5" fill="#fff8c5" stroke="#9a6700"/><text x="332" y="73">2</text>
<rect x="370" y="44" width="56" height="46" rx="5" fill="#f6f8fa" stroke="#d0d7de"/><text x="398" y="73">1</text>
<rect x="436" y="44" width="56" height="46" rx="5" fill="#f6f8fa" stroke="#d0d7de"/><text x="464" y="73">1</text>
<rect x="502" y="44" width="56" height="46" rx="5" fill="#fff8c5" stroke="#9a6700"/><text x="530" y="73">3</text>
<rect x="568" y="44" width="56" height="46" rx="5" fill="#ffffff" stroke="#d0d7de" stroke-dasharray="3 3"/><text x="596" y="73" fill="#57606a">…</text>
</g>
<text x="40" y="112" font-size="12" fill="#57606a">每个桶 6 bit，共 16384 个桶，合计 12288 字节 + 16 字节头部</text>
<path d="M440 130 L440 148 L520 148" stroke="#8c959f" stroke-width="1.5" fill="none" marker-end="url(#a1)"/>
<defs><marker id="a1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#8c959f"/></marker></defs>
<rect x="528" y="126" width="112" height="46" rx="6" fill="#ddf4ff" stroke="#0969da"/>
<text x="584" y="146" font-size="12.5" fill="#1f2328" text-anchor="middle">直方图 C[j]</text>
<text x="584" y="163" font-size="11.5" fill="#57606a" text-anchor="middle">统计每档有多少桶</text>
<rect x="40" y="182" width="600" height="26" rx="6" fill="#f6f8fa" stroke="#d0d7de"/>
<text x="340" y="200" font-size="12.5" fill="#1f2328" text-anchor="middle">E = α∞ · m² / z，z 由 C[j] 加权累加，τ 修正饱和、σ 修正空桶</text>
</svg>
</div>

## 四、从寄存器到估计值：调和平均与区间修正

最直接的想法是算术平均各桶的 2^R，再乘 m。这个做法会被单个异常大的寄存器带偏：一个桶出现 30 位的游程，2³⁰ 会把整体估计拉高好几个数量级。实际采用**调和平均**，它对大值不敏感：

E = α_m · m² / Σⱼ 2^(-M[j])

分母里每一项都是 2 的负幂。某个桶出现极长游程时，它对应的 2^(-M[j]) 趋近于 0，对分母的削减有限，因此单个离群值无法把整体估计拉飞。α_m 是归一化常数，渐近值为 1/(2ln2) ≈ 0.7213475；原始论文对有限 m 再乘一个 1/(1+1.079/m) 做小桶数修正，而 Redis 采用的 Ertl 估计量直接把 1/(2ln2) 当作常数使用，小桶数带来的偏差交给下一段的 σ 处理。

这个估计量只在「中等基数」区间成立，两头都会失效：

- **基数很小时**，绝大多数桶还是 0，2⁰=1 让分母接近 m，公式系统性地高估。经典解法是线性计数：数出还有多少空桶 V，用 m·ln(m/V) 估计，这个式子在 V 接近 m 时精度反而很高。
- **基数极大时**，寄存器会被 6 bit 的 63 顶住而饱和，最大值不再随基数增长，估计出现平台。

早期实现靠两张修正表和阈值拼接三段区间，切换点附近容易出现不连续。Redis 4.0 之后采用的是 Ertl 2017 年的估计量（arXiv:1702.01284），用两个辅助函数把全区间收进一个公式：σ 处理空桶偏多的小基数段，τ 处理寄存器接近上限的饱和段，两个函数在中间区间自然趋近于 0，不再需要硬切换。

```python
def tau(x):
    if x == 0.0 or x == 1.0:
        return 0.0
    z, y = 1.0 - x, 1.0
    while True:
        x = math.sqrt(x)
        z_prev = z
        y *= 0.5
        z -= (1.0 - x) ** 2 * y
        if z == z_prev:
            return z / 3.0

def sigma(x):
    if x == 1.0:
        return float("inf")
    z, y = x, 1.0
    while True:
        x *= x
        z_prev = z
        z += x * y
        y += y
        if z == z_prev:
            return z
```

累加过程就是遍历一次直方图，C[j] 表示「寄存器值等于 j 的桶有多少个」，q = 64−p：

```python
z = M * tau((M - histo[q + 1]) / M)
for j in range(q, 0, -1):
    z += histo[j]
    z *= 0.5
z += M * sigma(histo[0] / M)
return int(round(0.7213475204444817 * M * M / z))
```

误差的标准差有解析式：1.04/√m。m=16384 时是 0.8125%，这就是 Redis 文档里 0.81% 的来源。这个数字只与桶数有关，**与基数大小无关**，也是 HLL 最反直觉的一点。

## 五、Redis 的实现细节

源码 `hyperloglog.c` 里几个常量定义了全部几何形状：

```c
#define HLL_P 14                    /* The greater is P, the smaller the error. */
#define HLL_Q (64-HLL_P)            /* 50 位用于数前导零 */
#define HLL_REGISTERS (1<<HLL_P)    /* 16384 个寄存器 */
#define HLL_BITS 6                  /* Enough to count up to 63 leading zeroes. */
#define HLL_REGISTER_MAX ((1<<HLL_BITS)-1)
#define HLL_HDR_SIZE sizeof(struct hllhdr)              /* 16 字节 */
#define HLL_DENSE_SIZE (HLL_HDR_SIZE+((HLL_REGISTERS*HLL_BITS+7)/8))
```

12304 = 16 + 16384×6/8，即 16 字节头部加 12288 字节位域。头部结构是 `magic[4] + encoding + notused[3] + card[8]`。最后的 `card[8]` 是一个缓存：上一次 PFCOUNT 算出的基数会写在这里，最高位的 MSB 作脏标志，任何写入都会把它置脏，于是重复 PFCOUNT 变成一次读缓存。

### 5.1 6 bit 位域的读写代价

6 不是 2 的幂，一个寄存器的 6 位可能横跨两个字节，读写要拆位拼接。Redis 为此专门写了 `hllDenseSet` / `hllDenseGet`，并在合并与压缩路径上用 AVX2、NEON 做了向量化版本，条件正是 `HLL_REGISTERS==16384 && HLL_BITS==6`。

### 5.2 两种编码：稀疏与稠密

新键刚创建时寄存器几乎全为 0，用定长位域存 12 KB 的零是浪费。Redis 提供稀疏编码，用三种 opcode 对寄存器数组做游程压缩：

| opcode | 长度 | 编码 | 语义 |
|---|---|---|---|
| ZERO | 1 字节 | `00xxxxxx` | 1~64 个连续的 0 寄存器 |
| XZERO | 2 字节 | `01xxxxxx yyyyyyyy` | 1~16384 个连续的 0 寄存器 |
| VAL | 1 字节 | `1vvvvvxx` | 值 1~32，连续重复 1~4 次 |

只要有一个寄存器的值超过 32（VAL 能表示的上限），或者稀疏表示的总字节数超过阈值，就整体转换成稠密编码，此后不再回退。阈值由 `hll-sparse-max-bytes` 控制，可用 `CONFIG GET hll-sparse-max-bytes` 查当前实例的生效值。

阈值必须远小于 12288，原因在体积曲线上。下面是按上述 opcode 规则实测的稀疏体积随基数变化的结果，横线是稠密编码的固定 12288 字节：

<div align="center">
<svg viewBox="0 0 680 270" width="100%" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
<text x="40" y="22" font-size="14" font-weight="600" fill="#1f2328">稀疏编码体积 vs 基数（稠密恒为 12288 B，不含 16 B 头部）</text>
<line x1="60" y1="210" x2="650" y2="210" stroke="#8c959f" stroke-width="1.2"/>
<line x1="60" y1="40" x2="60" y2="210" stroke="#8c959f" stroke-width="1.2"/>
<line x1="60" y1="40" x2="650" y2="40" stroke="#1a7f37" stroke-width="1.4" stroke-dasharray="5 4"/>
<text x="648" y="34" font-size="11.5" fill="#1a7f37" text-anchor="end">稠密 12288 B</text>
<polyline points="60,209 253,206 340,195 456,162 533,111 640,63" fill="none" stroke="#0969da" stroke-width="2" stroke-linejoin="round"/>
<g fill="#0969da">
<circle cx="60" cy="209" r="4"/><circle cx="253" cy="206" r="4"/><circle cx="340" cy="195" r="4"/>
<circle cx="456" cy="162" r="4"/><circle cx="533" cy="111" r="4"/><circle cx="640" cy="63" r="4"/>
</g>
<g font-size="11.5" fill="#1f2328" text-anchor="middle">
<text x="60" y="228">10</text><text x="253" y="228">100</text><text x="340" y="228">500</text>
<text x="456" y="228">2000</text><text x="533" y="228">5000</text><text x="640" y="228">10000</text>
</g>
<text x="355" y="248" font-size="12" fill="#57606a" text-anchor="middle">真实基数（对数刻度）</text>
<g font-size="11.5" fill="#bc4c00" text-anchor="middle">
<text x="253" y="196">286</text><text x="340" y="185">1059</text><text x="456" y="152">3455</text>
<text x="533" y="101">7169</text><text x="630" y="53">10625</text>
</g>
<text x="60" y="266" font-size="11.5" fill="#57606a">基数到一万时稀疏体积已逼近稠密，再往上压缩比彻底失效</text>
</svg>
</div>

稠密编码的 6 bit 位域有一个隐含开销：寄存器值越大，高位稀疏的桶越少，压缩前提是「大量连续零和小值」，一旦寄存器值分散到 5 以上，每个非零寄存器都要独占一个 VAL 字节，零游程也被切碎，体积反超定长位域。所以转换阈值必须提前介入，而不是等到体积相等。

### 5.3 哈希函数

元素用 `MurmurHash64A` 计算 64 位哈希，种子固定为 `0xadc83b19`，并针对大小端做了中性化改造，保证同一份数据在不同架构上算出相同的哈希。随后低 14 位做索引，剩余位移位后打一个第 50 位的哨兵，再数尾部连续零：

```c
hash = MurmurHash64A(ele,elesize,0xadc83b19ULL);
index = hash & HLL_P_MASK;
hash >>= HLL_P;
hash |= ((uint64_t)1<<HLL_Q);
count = __builtin_ctzll(hash) + 1;
```

### 5.4 存成一个字符串

HyperLogLog 在类型上不是独立类型，底层就是 string。这带来几个实用后果：可以用 `STRLEN` 看编码结果是稀疏还是稠密，可以用 `GET`、`SET` 整体搬运，可以进 RDB 与 AOF，也可以在集群里正常按 key 分片。代价是它和普通字符串共用同一套内存与淘汰策略，一个 HLL 就是一个 12 KB 的 key，不能按桶拆分。

## 六、本机复刻与实测数据

本机没有 redis-server，命令层无法实跑。算法层用 Python 做了完整复刻：同样的 p=14 与 16384 个寄存器、同样的 6 bit 位宽语义、同样的 Ertl 估计量与 τ/σ 累加顺序、同样的稀疏 opcode 规则，只把哈希换成了 blake2b 取低 64 位（Redis 用 MurmurHash64A，哈希只需均匀，不影响算法骨架与误差量级）。下面所有数字都是本机真实跑出来的。

第一组对比估计值与真实基数，同时记录两种编码的体积：

```text
      真实基数        估计值       相对误差       稀疏字节       稠密字节
       100         99     -1.00%        281      12304
      1000       1006     +0.60%       1911      12304
     10000       9977     -0.23%      10584      12304
    100000     100972     +0.97%      13659      12304
   1000000     999251     -0.07%      13629      12304
```

注意第 4、5 行：稀疏体积 13659 已经超过稠密 12304。这在真实 Redis 里不会出现，因为早在体积达到阈值时就已经转成稠密了，这里的数字是「强行不转换」的理论体积，用来观察曲线的走向。

第二组把 1e6 基数重复 20 次，看误差是否服从理论值：

```text
样本数 20  均值 -0.142%  标准差 0.791%
最小值 -2.257%  最大值 +1.181%
理论标准误差 1.04/sqrt(16384) = 0.812%
```

实测标准差 0.791%，与理论 0.812% 吻合。最小值 −2.257% 大约是 2.8 个标准差，属于 20 次采样里的正常尾部。这也说明 0.81% 是标准差而不是上界，单次结果落在 ±2% 以内都算正常。

第三组验证 PFMERGE 的语义。A 与 B 各 10 万个 ID，其中 3 万个重叠，真并集 17 万：

```text
A 100000  B 100000  交集 30000  真并集 170000
merge(A,B) = 171332  (+0.78%)
merge(B,A) = 171332  (+0.78%)
两次结果寄存器完全一致: True
不合并、直接相加: 200585  (+17.99%)
```

合并是逐寄存器取 max，因此满足交换律与结合律，两个方向合并后寄存器数组逐字节相同。直接把两个基数相加会得到 20 万，比真并集高 18%，这是去重场景里最常见的误用。

第四组改桶数 p，验证误差只由 m 决定：

```text
  p       桶数       稠密字节        实测标准差       理论误差
 10     1024        784       3.503%     3.250%
 12     4096       3088       1.614%     1.625%
 14    16384      12304       0.859%     0.812%
 16    65536      49168       0.233%     0.406%
```

精度每提升一倍（误差减半），空间翻四倍。Redis 选 p=14 是在 12 KB 与 0.81% 之间取的工程折中：UV 统计报一个约数即可，12 KB 的单价又能接受。

## 七、命令语义与五个容易误判的边界

三个命令的语义比名字看起来要窄：

| 命令 | 作用 | 返回值 |
|---|---|---|
| `PFADD key element [element ...]` | 写入元素 | 1 表示至少一个寄存器被更新，0 表示内部状态没变 |
| `PFCOUNT key [key ...]` | 取基数估计，多个 key 按并集算 | 估计值（整数） |
| `PFMERGE destkey sourcekey [...]` | 按寄存器取 max 写入 destkey | OK |

**边界一：PFADD 返回 1 不等于「这是一个新元素」。** 返回值反映的是内部寄存器状态是否改变，而不是元素是否首次出现。基数越大，新元素落在「已被更高计数值占住」的桶里的概率越高，返回 0 就越常见。本机复刻实测新元素触发更新的比例：

```text
     已写入基数      每桶均值          新元素返回 1 的比例
      1000       0.1                92.5%
     10000       0.6                65.8%
    100000       6.1                11.6%
   1000000      61.0                 1.5%
```

写到 100 万时，一个从未出现过的用户 ID 只有 1.5% 的概率让 PFADD 返回 1。反过来，已存在的元素一定返回 0，因为它的哈希固定，对应寄存器早已不低于这个值。想判断元素是否首次出现，只能用 Set。

**边界二：不能删除元素，也不能求交集。** 寄存器只保留最大值，没有任何信息能支撑「把某个元素的影响撤掉」。同理，两个 HLL 合并只能得到并集的基数，无法得到交集。「既看过 A 又看过 B 的用户数」这类需求，HyperLogLog 给不出答案。

**边界三：12 KB 是上限，也是固定成本。** 基数 100 的场景用 HLL 要占几百字节（稀疏编码），用 Set 只占几 KB 但能枚举、能删除。基数小于几千时，HLL 的空间优势并不存在，用 Set 更合适。HLL 的价值出现在基数上百万之后，且只在「只要那个数字」时成立。

**边界四：PFCOUNT 多 key 是内部合并，不写回。** 多 key 查询会把所有 HLL 合并到一块临时结构再统计，复杂度是 O(N·m)，键越多越慢。需要反复查询同一组并集时，应该先用 PFMERGE 固化成一个目标键，之后单键 PFCOUNT 走缓存，接近 O(1)。

**边界五：误差是系统性的，重复计算取平均不会变准。** 同一个键反复 PFCOUNT 得到的是同一个数（有缓存时连计算都省了），多算几遍再平均没有意义。降低误差的唯一手段是增大 m，也就是换用更大的桶数，而 Redis 的 p 值在编译期固定，运行期改不了。要更准，只能在应用层做分片：按用户 ID 的某个位把流量拆到 16 个 HLL，最后合并，等效把 m 放大 16 倍，误差降到约 0.2%，空间代价是 16 份 12 KB。

最后一条与滚动窗口有关：HLL 不能删除元素，所以「最近 7 天 UV」不能靠一个键滚动更新。可行的做法是按天建键（`uv:20261015`、`uv:20261016`……），查询时用 PFMERGE 临时合并这 7 个键。合并的代价是 7 次 12 KB 的读与一次位运算，比重新扫一遍明细便宜得多。

## 八、横向对照与适用边界

| 维度 | Set | Bitmap | HyperLogLog |
|---|---|---|---|
| 空间 | O(n)，每元素 40 字节上下 | O(取值域/8) | 常数，最多 12304 字节 |
| 误差 | 0 | 0 | 约 0.81%（标准差） |
| 元素枚举 | 支持 | 支持 | 不支持 |
| 元素删除 | 支持 | 支持 | 不支持 |
| 求交集 | 支持 | 支持（按位与） | 不支持 |
| 合并 | 并集运算 | 按位或 | 寄存器取 max |
| 基数上限 | 受内存限制 | 受取值域限制 | 极大（6 bit 寄存器 63 档） |
| 典型场景 | 需要精确与可枚举 | 取值域小且稠密 | 大基数、只要数字 |

选择判据可以压成三句：

1. 需要枚举、删除、求交集，或者基数在几千以内，用 Set。
2. 取值域小且连续（比如按位编号的设备、状态位），用 Bitmap，它的精度是免费的。
3. 只要一个数量级正确的数字，且基数在百万以上，用 HyperLogLog。

### 三条能带走的

- **HyperLogLog 用哈希的均匀性换了元素的记忆**：低 14 位选桶、高位数前导零，两段独立，所以一次哈希既能分桶又能计数。
- **误差只由桶数决定，1.04/√m**：16384 个桶给出 0.81%，与基数无关；想更准只能加桶，不能靠重复计算。
- **它的三条硬边界是不可删除、不可求交、返回值不表示新元素**：越过这三条，就该换数据结构，而不是加参数。

参考：Redis 源码 `src/hyperloglog.c`（常量、Ertl 估计量、稀疏 opcode、PFMERGE 合并逻辑）；Otmar Ertl, *New cardinality estimation algorithms for HyperLogLog sketches*, arXiv:1702.01284；Redis 官方文档 HyperLogLog 数据类型页（12 KB 上限与 0.81% 标准误差）。
