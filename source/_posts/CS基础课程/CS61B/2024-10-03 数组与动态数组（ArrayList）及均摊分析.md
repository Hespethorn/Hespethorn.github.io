---
title: 数组与动态数组（ArrayList）及均摊分析
date: 2024-10-03
categories: [CS基础课程, CS61B]
tags: [动态数组, ArrayList, 均摊分析, Java]
abbrlink: c61b0102
---

你每天写 `ArrayList`、`vector`、`list.append()`，从没操心过"容量"——它好像永远装得下。但每次"满了"，它其实偷偷把整片数据**搬了一次家**：分配更大的内存、把旧元素逐个复制过去、再扔掉旧的。这一篇把这件"看不见的搬家"讲透，并回答一个反直觉的问题：**为什么扩容是 O(n)，尾部追加却是 O(1)？** 答案叫**均摊分析（amortized analysis）**。

---

## 一、静态数组：快，但僵

数组是最原始的数据结构：N 个同类型元素**连续**摆在内存里，靠下标直接寻址。

- **优点**：随机访问 `a[i]` 是 **O(1)**——CPU 算一下 `基地址 + i × 元素大小` 就能取到，不依赖数组长度。
- **死穴**：容量在创建时就钉死了。想在第 0 位插一个？后面所有元素都得往后挪，**O(n)**。更糟的是，满了就彻底塞不下了。

数组这层"裸"结构，正是上一篇说的"只承诺怎么存、不约束怎么用"。动态数组要解决的，就是给它套一层**自动扩容**的抽象。

---

## 二、动态数组：在数组上套一层"自动扩容"

动态数组 = **底层静态数组 + 两个计数器**：

- `capacity`：底层数组实际分配的长度（能装多少）。
- `size`：当前装了多少个元素。

核心操作 `add(x)`（尾部追加）：若 `size == capacity`（满了），先**扩容**分配 2 倍大新数组并复制，再把 `x` 写进 `a[size]`、`size++`。

来一个最小可运行的 Java 版（刻意不依赖标准库，把机制摊开）：

```java
public class GrowableIntArray {
    private int[] a;
    private int size;
    public GrowableIntArray() { a = new int[1]; size = 0; }
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

扩容之所以贵，是因为要**复制所有旧元素**。关键在于——**复制发生的频率**。

- **如果每次满了只 +1**：第 n 次 add 复制 n−1 个。n 次总复制量 = 0+1+2+…+(n−1) = **O(n²)**，均摊到每次 **O(n)**——比静态数组还烂。
- **如果翻倍**：容量走 1→2→4→8→16…，复制只发生在容量边界。n 次总复制量 = 1+2+4+…+2^⌈log₂n⌉，**严格小于 2n**（等比数列求和）。加上 n 次写入，总工作量 **O(n)**，均摊到每次 **O(1)**。一次"贵"的搬家，被后面很多次"便宜"的插入摊薄了。

> **本质一句话**：翻倍让复制频率几何级稀疏化（任何 >1 的常数因子都行，不止 2×），所以总复制量被压在 O(n) 内——这是"以空间换均摊时间"的典型权衡。

---

## 四、均摊 O(1) 一眼看穿（聚合分析）

"均摊 O(1)"怎么严格证明？最直观的**聚合分析**就够了：直接算 n 次 `add` 的**总代价** T(n)，再除以 n。

- 写入代价：n 次，共 **n**。
- 复制代价：发生在 size 达到 1, 2, 4, 8, … 时，复制量分别为 1, 2, 4, 8, …
  T(n) ≤ n + (1 + 2 + 4 + … + 2^⌈log₂n⌉) < n + 2n = **3n**。
- 所以单次**均摊代价 = T(n)/n < 3 = O(1)**。

也就是说：偶尔出现一次 O(n) 的"搬家尖峰"，但被前后大量 O(1) 的普通插入摊平，平均每次只花常数时间。下面这张图把"尖峰被摊平"画出来：

<div align="center">

<svg width="430" height="160" viewBox="0 0 430 160" xmlns="http://www.w3.org/2000/svg">
  <text x="215" y="18" text-anchor="middle" font-size="12" fill="#374151">单次 add 的代价：平时 O(1)，容量边界出现 O(n) 尖峰</text>
  <line x1="40" y1="130" x2="400" y2="130" stroke="#9ca3af" stroke-width="1"/>
  <g fill="#93c5fd" stroke="#2563eb" stroke-width="1">
    <rect x="55"  y="120" width="20" height="10"/>
    <rect x="85"  y="120" width="20" height="10"/>
    <rect x="115" y="120" width="20" height="10"/>
  </g>
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
  <rect x="385" y="20" width="20" height="110" fill="#fca5a5" stroke="#dc2626" stroke-width="1"/>
  <text x="155" y="148" text-anchor="middle" font-size="9" fill="#dc2626">复制4</text>
  <text x="395" y="148" text-anchor="middle" font-size="9" fill="#dc2626">复制8</text>
  <text x="215" y="148" text-anchor="middle" font-size="10" fill="#6b7280">均摊后每次 ≈ 3，与尖峰无关</text>
</svg>
</div>

---

## 五、坑：均摊 ≠ 平均（Amortized ≠ Average）

这是面试和考试最爱挖的坑：

- **平均（average）**：依赖**概率分布**——"随机场景下平均多快"。如果输入有偏（比如总是撑满才插入），平均可能退化。
- **均摊（amortized）**：是**最坏情况**下的序列保证——无论输入怎么刁难，任意 n 次操作的总代价都 ≤ c·n。它不赌概率。

所以"动态数组 add 是 O(1) 均摊"的意思是：**哪怕你恶意构造输入，让每次都在刚扩容后插入，n 次 add 的总时间也还是 O(n)**。单次最坏仍是 O(n)（正好触发扩容那次），但被序列摊平了。

> **本质一句话**：均摊分析保证的是"一段操作的总账"，而不是"每一次都快"。

---

🐾 **小结**

- 动态数组 = 底层数组 + `capacity`/`size`，满则**翻倍扩容**并复制。
- **翻倍**而非 +1，是因为翻倍让复制频率几何级稀疏化，总复制量压到 O(n)，均摊 **O(1)**。
- 用**聚合分析**一眼看穿：n 次 add 总代价 < 3n，单次均摊 < 3。
- 均摊 ≠ 平均：均摊是最坏情况的序列保证，不依赖概率。
- 它赢在"尾部追加快 + 随机访问快"，代价是"中间/头部插入要搬移"以及最多一倍的空间浪费——这些代价画像，是评估任何一种数据结构时都要反复掂量的维度。
