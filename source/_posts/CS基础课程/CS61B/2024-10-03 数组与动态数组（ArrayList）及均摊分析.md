---
title: 数组与动态数组（ArrayList）及均摊分析
date: 2024-10-03
categories: [CS基础课程, CS61B]
tags: [动态数组, ArrayList, 均摊分析, Java]
abbrlink: c61b0102
---

你每天写 `ArrayList`、`vector`、`list.append()`，从没操心过"容量"——它好像永远装得下。但每次"满了"，它其实偷偷把整片数据**搬了一次家**：分配一块更大的内存，把旧元素逐个复制过去，再扔掉旧的。这一篇就把这件"看不见的搬家"讲透，并回答一个反直觉的问题：**为什么翻倍扩容是 O(1)，明明单次搬家是 O(n)？** 答案叫**均摊分析（amortized analysis）**。

---

## 一、静态数组：快，但僵

数组是最原始的数据结构：N 个同类型元素**连续**摆在内存里，靠下标直接寻址。

- **优点**：随机访问 `a[i]` 是 **O(1)**——CPU 算一下 `基地址 + i × 元素大小` 就能取到，不依赖数组长度。
- **死穴**：容量在创建时就钉死了。想在第 0 位插一个元素？后面所有元素都得往后挪一位，**O(n)**。更糟的是，满了就彻底塞不下了。

<div align="center">

<svg width="460" height="150" viewBox="0 0 460 150" xmlns="http://www.w3.org/2000/svg">
  <text x="230" y="22" text-anchor="middle" font-size="13" fill="#374151">静态数组：连续内存，容量固定</text>
  <g font-size="13" fill="#1e40af" text-anchor="middle">
    <rect x="40"  y="45" width="55" height="42" rx="4" fill="#bfdbfe" stroke="#2563eb" stroke-width="1.5"/>
    <rect x="98"  y="45" width="55" height="42" rx="4" fill="#bfdbfe" stroke="#2563eb" stroke-width="1.5"/>
    <rect x="156" y="45" width="55" height="42" rx="4" fill="#bfdbfe" stroke="#2563eb" stroke-width="1.5"/>
    <rect x="214" y="45" width="55" height="42" rx="4" fill="#bfdbfe" stroke="#2563eb" stroke-width="1.5"/>
    <rect x="272" y="45" width="55" height="42" rx="4" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1.5"/>
    <text x="67"  y="71" fill="#1e3a8a">A</text>
    <text x="125" y="71" fill="#1e3a8a">B</text>
    <text x="183" y="71" fill="#1e3a8a">C</text>
    <text x="241" y="71" fill="#1e3a8a">D</text>
    <text x="299" y="71" fill="#6b7280">·</text>
  </g>
  <text x="40"  y="110" font-size="11" fill="#6b7280">下标 0</text>
  <text x="266" y="110" font-size="11" fill="#6b7280">capacity-1</text>
  <text x="230" y="138" text-anchor="middle" font-size="11" fill="#b91c1c">已满 → 再 add 直接失败 / 需手动重建</text>
</svg>

</div>

数组这层"裸"结构，正是上一篇说的"只承诺怎么存、不约束怎么用"。动态数组要解决的，就是给它套一层**自动扩容**的抽象。

---

## 二、动态数组：在数组上套一层"自动扩容"

动态数组 = **底层静态数组 + 两个计数器**：

- `capacity`：底层数组实际分配的长度（能装多少）。
- `size`：当前装了多少个元素（也叫 `length` / `count`）。

核心操作 `add(x)`（尾部追加）：

1. 若 `size == capacity`（满了），先**扩容**：分配一块 2 倍大的新数组，把旧元素复制过去。
2. 把 `x` 写进 `a[size]`，`size++`。

<div align="center">

<svg width="470" height="170" viewBox="0 0 470 170" xmlns="http://www.w3.org/2000/svg">
  <text x="235" y="20" text-anchor="middle" font-size="12" fill="#374151">扩容：size == capacity 时分配 2× 新数组并复制</text>
  <!-- 旧数组 -->
  <g font-size="12" text-anchor="middle">
    <rect x="30" y="45" width="40" height="36" rx="4" fill="#fde68a" stroke="#d97706" stroke-width="1.5"/>
    <rect x="72" y="45" width="40" height="36" rx="4" fill="#fde68a" stroke="#d97706" stroke-width="1.5"/>
    <rect x="114" y="45" width="40" height="36" rx="4" fill="#fde68a" stroke="#d97706" stroke-width="1.5"/>
    <rect x="156" y="45" width="40" height="36" rx="4" fill="#fde68a" stroke="#d97706" stroke-width="1.5"/>
    <text x="50" y="68" fill="#92400e">A</text><text x="92" y="68" fill="#92400e">B</text>
    <text x="134" y="68" fill="#92400e">C</text><text x="176" y="68" fill="#92400e">D</text>
  </g>
  <text x="103" y="100" text-anchor="middle" font-size="10" fill="#92400e">capacity = 4, 已满</text>
  <!-- 箭头 -->
  <line x1="200" y1="63" x2="250" y2="63" stroke="#6b7280" stroke-width="2" marker-end="url(#arr2)"/>
  <!-- 新数组 -->
  <g font-size="12" text-anchor="middle">
    <rect x="255" y="45" width="35" height="34" rx="4" fill="#bbf7d0" stroke="#16a34a" stroke-width="1.5"/>
    <rect x="292" y="45" width="35" height="34" rx="4" fill="#bbf7d0" stroke="#16a34a" stroke-width="1.5"/>
    <rect x="329" y="45" width="35" height="34" rx="4" fill="#bbf7d0" stroke="#16a34a" stroke-width="1.5"/>
    <rect x="366" y="45" width="35" height="34" rx="4" fill="#bbf7d0" stroke="#16a34a" stroke-width="1.5"/>
    <rect x="403" y="45" width="35" height="34" rx="4" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1.5"/>
    <rect x="440" y="45" width="35" height="34" rx="4" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1.5"/>
    <text x="272" y="67" fill="#166534">A</text><text x="309" y="67" fill="#166534">B</text>
    <text x="346" y="67" fill="#166534">C</text><text x="383" y="67" fill="#166534">D</text>
  </g>
  <text x="380" y="100" text-anchor="middle" font-size="10" fill="#166534">capacity = 8</text>
  <defs>
    <marker id="arr2" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L7,3 L0,6 z" fill="#6b7280"/>
    </marker>
  </defs>
  <text x="235" y="145" text-anchor="middle" font-size="11" fill="#374151">旧数组随后被 GC 回收（Java）/ free（C/C++）</text>
</svg>

</div>

来一个最小可运行的 Java 版（刻意不依赖标准库，把机制摊开）：

```java
public class GrowableIntArray {
    private int[] a;
    private int size;

    public GrowableIntArray() {
        a = new int[1];   // 初始容量 1
        size = 0;
    }
    public void add(int x) {
        if (size == a.length) resize(2 * a.length); // 满了就翻倍
        a[size++] = x;
    }
    private void resize(int cap) {
        int[] b = new int[cap];
        for (int i = 0; i < size; i++) b[i] = a[i];  // O(n) 复制
        a = b;                                        // 旧数组等待回收
    }
    public int get(int i) { return a[i]; }
    public int size() { return size; }
}
```

客户端完全无感：

```java
GrowableIntArray list = new GrowableIntArray();
for (int i = 0; i < 5; i++) list.add(i);
for (int i = 0; i < list.size(); i++) System.out.print(list.get(i) + " ");
```

输出：

```
0 1 2 3 4 
```

---

## 三、坑：为什么要"翻倍"，而不是"每次 +1"？

这是动态数组最该想清楚的一点。扩容之所以贵，是因为要**复制所有旧元素**。关键在于——**复制发生的频率**。

**如果每次满了只 +1（capacity 加 1）**：第 1 次 add 不复制，第 2 次复制 1 个，第 3 次复制 2 个……第 n 次复制 n−1 个。n 次 add 的总复制量 = 0+1+2+…+(n−1) = **O(n²)**，均摊到每次是 **O(n)**——比静态数组还烂，毫无意义。

**如果翻倍**：容量走 1→2→4→8→16……复制只发生在容量边界。n 次 add 的总复制量是 1+2+4+…+2^⌈log₂n⌉，**严格小于 2n**（等比数列求和）。加上 n 次写入，**总工作量 O(n)**，均摊到每次 **O(1)**。一次"贵"的搬家，被后面很多次"便宜"的插入摊薄了。

> **本质一句话**：翻倍让"搬家"越来越稀有（频率指数下降），所以总复制量被压在 O(n) 内——这是"以空间换均摊时间"的典型权衡。

---

## 四、均摊分析：三种武器

"均摊 O(1)"到底怎么严格证明？有三种等价武器，我们用同一个翻倍动态数组各打一遍。

### 4.1 聚合分析（Aggregate）

直接算 n 次 `add` 的**总代价** T(n)，再除以 n。

- 写入代价：n 次，共 **n**。
- 复制代价：发生在 size 达到 1, 2, 4, 8, … 时，复制量分别为 1, 2, 4, 8, …
  T(n) ≤ n + (1 + 2 + 4 + … + 2^⌈log₂n⌉) < n + 2n = **3n**。
- 所以单次的**均摊代价 = T(n)/n < 3 = O(1)**。

聚合法最直观，但只给"平均值上界"，看不出每次怎么摊。

### 4.2 记账法（Accounting / Banker's）

给每次 `add` 记一笔 **3 单位**的"费用"：

- **1 单位**：支付本次写入的真实代价。
- **2 单位**：存进"信用账户"当押金。

不变量：账户里攒的信用，永远够付下一次搬家。具体地，一次翻倍要复制 `capacity` 个元素，而这之前刚攒了 `capacity` 次插入 × 2 单位 = 2·capacity 的信用，绰绰有余。既然每次实际只花 3 单位，均摊代价就是 **O(1)**。

记账法的妙处：把"未来的贵操作"提前用"现在的便宜操作"预付了——像零存整取。

### 4.3 势能法（Potential）

给数据结构定义一个**势能函数 Φ**（类似"被压缩的弹簧能量"），让:

> **均摊代价 = 实际代价 + Φ(之后) − Φ(之前)**

我们对翻倍动态数组取 **Φ = 2·size − capacity**（始终 ≥ 0）。

- **普通插入**（未满，capacity 不变）：实际代价 c = 1；ΔΦ = 2(size+1) − cap − (2·size − cap) = 2。
  均摊 = 1 + 2 = **3**。
- **触发扩容的插入**（插入前 size == capacity）：新 capacity = 2·cap，插入后 size = cap+1。
  实际代价 c = 1（写）+ cap（复制）= cap + 1。
  扩容前 Φ = 2·cap − cap = cap；扩容后 Φ = 2(cap+1) − 2cap = 2。
  ΔΦ = 2 − cap。均摊 = (cap + 1) + (2 − cap) = **3**。

**每一次插入的均摊代价都恰好是 3**，无论是否触发扩容。这就是势能法的威力：把"偶发尖峰"用势能的涨落彻底抹平。

<div align="center">

<svg width="430" height="160" viewBox="0 0 430 160" xmlns="http://www.w3.org/2000/svg">
  <text x="215" y="18" text-anchor="middle" font-size="12" fill="#374151">单次 add 的代价：平时 O(1)，容量边界出现 O(n) 尖峰</text>
  <!-- 基线 -->
  <line x1="40" y1="130" x2="400" y2="130" stroke="#9ca3af" stroke-width="1"/>
  <!-- 低价柱 -->
  <g fill="#93c5fd" stroke="#2563eb" stroke-width="1">
    <rect x="55"  y="120" width="20" height="10"/>
    <rect x="85"  y="120" width="20" height="10"/>
    <rect x="115" y="120" width="20" height="10"/>
  </g>
  <!-- 尖峰（扩容） -->
  <rect x="145" y="40" width="20" height="90" fill="#fca5a5" stroke="#dc2626" stroke-width="1"/>
  <g fill="#93c5fd" stroke="#2563eb" stroke-width="1">
    <rect x="175" y="120" width="20" height="10"/>
    <rect x="205" y="120" width="20" height="10"/>
    <rect x="235" y="120" width="20" height="10"/>
    <rect x="265" y="120" width="20" height="10"/>
    <rect x="295" y="120" width="20" height="10"/>
    <rect x="325" y="120" width="20" height="10"/>
    <rect x="355" y="120" width="20" height="10"/>
  </g>
  <!-- 大尖峰 -->
  <rect x="385" y="20" width="20" height="110" fill="#fca5a5" stroke="#dc2626" stroke-width="1"/>
  <text x="155" y="148" text-anchor="middle" font-size="9" fill="#dc2626">复制4</text>
  <text x="395" y="148" text-anchor="middle" font-size="9" fill="#dc2626">复制8</text>
  <text x="215" y="148" text-anchor="middle" font-size="10" fill="#6b7280">均摊后每次 ≈ 3，与尖峰无关</text>
</svg>

</div>

---

## 五、Java `ArrayList` 与 C++ `vector` 对照

标准库里的动态数组，机制完全一致，API 各有所长：

```java
// Java：java.util.ArrayList
ArrayList<Integer> list = new ArrayList<>();
list.ensureCapacity(100); // 预分配容量，避免前几次扩容
list.add(1);
int cap = list.size();    // 注意：Java 不直接暴露 capacity
list.trimToSize();        // 释放多余容量（收缩）
```

```cpp
// C++：std::vector
#include <vector>
std::vector<int> v;
v.reserve(100);           // 等价于 ensureCapacity
v.push_back(1);
size_t cap = v.capacity();// C++ 直接暴露 capacity()
v.shrink_to_fit();        // C++11：释放多余容量
```

| 维度 | Java `ArrayList` | C++ `vector` |
| --- | --- | --- |
| 扩容因子 | 约 1.5×（JDK 不同版本有差异） | 通常 2× |
| 预分配 | `ensureCapacity` | `reserve` |
| 查容量 | 无直接 API（靠 `size`） | `capacity()` |
| 收缩 | `trimToSize()` | `shrink_to_fit()` |
| 缩容时机 | **仅显式调用** | **仅显式调用** |

> 注意两边**都不会自动缩容**：如果装了 10 万再 `clear()`，底层数组仍占 10 万的空间，除非你显式 `trimToSize` / `shrink_to_fit`。这是有意为之——避免"扩容↔缩容"反复横跳造成的抖动。

---

## 六、代价总表：静态数组 vs 动态数组

| 操作 | 静态数组 | 动态数组（均摊） |
| --- | --- | --- |
| 随机访问 `get(i)` | O(1) | O(1) |
| 尾部 `add` | 满则失败 | **O(1) 均摊** |
| 中间 `insert(i)` | O(n) 搬移 | O(n) 搬移 |
| 头部 `insert` | O(n) 搬移 | O(n) 搬移 |
| 空间占用 | 精确 n | size … 2·size（≤ 2 倍浪费） |

动态数组**赢在"尾部追加快 + 随机访问快"**，代价是"中间/头部插入要搬移"以及最多一倍的空间浪费。它牺牲了任意位置 O(1) 插入，换来了自动扩容的便利——这正是后续链表要补的那个洞。

---

## 七、坑：均摊 ≠ 平均（Amortized ≠ Average）

这是面试和考试最爱挖的坑：

- **平均（average）**：依赖**概率分布**——"随机场景下平均多快"。如果输入有偏（比如总是撑满才插入），平均可能退化。
- **均摊（amortized）**：是**最坏情况**下的序列保证——无论输入怎么刁难，任意 n 次操作的总代价都 ≤ c·n。它不赌概率。

所以"动态数组 add 是 O(1) 均摊"的意思是：**哪怕你恶意构造输入，让每次都在刚扩容后插入，n 次 add 的总时间也还是 O(n)**。单次最坏仍是 O(n)（正好触发扩容那次），但被序列摊平了。

> **本质一句话**：均摊分析保证的是"一段操作的总账"，而不是"每一次都快"。

---

🐾 **小结**

- 动态数组 = 底层数组 + `capacity`/`size`，满则**翻倍扩容**并复制。
- **翻倍**而非 +1，是因为翻倍让复制频率指数下降，总复制量压到 O(n)。
- 均摊分析三法：**聚合**（总账÷n）、**记账**（每次预付 3 单位）、**势能**（Φ 抹平尖峰），结论都是每次 add **均摊 O(1)**。
- 均摊 ≠ 平均：均摊是最坏情况的序列保证，不依赖概率。
- 标准库对照：Java `ArrayList`(ensureCapacity/trimToSize) ↔ C++ `vector`(reserve/shrink_to_fit)；两者都**不自动缩容**，以防抖动。
- 动态数组短板（中间插删要搬移）正是链表的主场——而链表用"不连续 + 指针"换掉了随机访问。
