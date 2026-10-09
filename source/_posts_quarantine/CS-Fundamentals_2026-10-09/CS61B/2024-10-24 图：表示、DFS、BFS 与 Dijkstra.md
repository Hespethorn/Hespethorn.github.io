---

title: 图：表示、DFS、BFS 与 Dijkstra
date: 2024-10-24
categories: [CS-Fundamentals, CS61B]
tags:
  - 图
  - 深度优先搜索
  - 广度优先搜索
  - Dijkstra
abbrlink: c61b0108
series: [CS61B]

---

数组管顺序，树管层次，哈希管查找——可现实里的关系常常既不是一条线、也不是一棵树：**地铁线网、朋友关系、任务依赖、互联网路由**，全都是"点连着点"的网络。这种结构叫**图（Graph）**。本篇我们解决三件事：图怎么存进计算机、怎么把整张图"走一遍"、以及怎么在带权图里找到两点间最短的路。

---

## 一、是什么：顶点、边、权

一句话：**图 = 顶点集合 V + 边集合 E**；边可以**有向/无向**，可以带**权重（权）**表示距离/代价/时间。

- **无向图**：边双向（朋友关系）。
- **有向图**：边单向（关注关系、依赖）。
- **带权图**：边上标数字（地图里程）。

---

## 二、怎么存：邻接表 vs 邻接矩阵

这是图论里第一个关键取舍。

| 维度 | 邻接表（adjacency list） | 邻接矩阵（adjacency matrix） |
|---|---|---|
| 存储 | `O(V+E)` | `O(V²)` |
| 遍历某点邻居 | `O(degree)` 很快 | `O(V)` 要扫整行 |
| 判断两点是否相邻 | `O(degree)` | `O(1)` |
| 适合 | 稀疏图（大多数真实网络） | 稠密图、需要频繁查边 |

<div style="background:#fff;border:1px solid #d0d7de;border-radius:8px;padding:8px;margin:16px 0">
<svg viewBox="0 0 520 170" xmlns="http://www.w3.org/2000/svg" font-family="monospace" font-size="12">
  <rect x="0" y="0" width="520" height="170" fill="#fff"/>
  <text x="110" y="16" text-anchor="middle" fill="#1a4731">邻接表（省空间）</text>
  <rect x="20" y="30" width="60" height="26" fill="#f1f0ff" stroke="#7048e8"/><text x="50" y="48" text-anchor="middle" fill="#3b2a8c">0: 1→2</text>
  <rect x="20" y="64" width="50" height="26" fill="#f1f0ff" stroke="#7048e8"/><text x="45" y="82" text-anchor="middle" fill="#3b2a8c">1: 2</text>
  <rect x="20" y="98" width="40" height="26" fill="#f1f0ff" stroke="#7048e8"/><text x="40" y="116" text-anchor="middle" fill="#3b2a8c">2: –</text>
  <text x="400" y="16" text-anchor="middle" fill="#1a4731">邻接矩阵（查边快）</text>
  <g fill="#f1f0ff" stroke="#7048e8">
    <rect x="330" y="34" width="26" height="22"/><rect x="356" y="34" width="26" height="22"/><rect x="382" y="34" width="26" height="22"/>
    <rect x="330" y="56" width="26" height="22"/><rect x="356" y="56" width="26" height="22"/><rect x="382" y="56" width="26" height="22"/>
    <rect x="330" y="78" width="26" height="22"/><rect x="356" y="78" width="26" height="22"/><rect x="382" y="78" width="26" height="22"/>
  </g>
  <text x="343" y="50" text-anchor="middle" fill="#3b2a8c">0</text><text x="369" y="50" text-anchor="middle" fill="#3b2a8c">1</text><text x="395" y="50" text-anchor="middle" fill="#3b2a8c">0</text>
  <text x="343" y="72" text-anchor="middle" fill="#3b2a8c">1</text><text x="369" y="72" text-anchor="middle" fill="#3b2a8c">0</text><text x="395" y="72" text-anchor="middle" fill="#3b2a8c">0</text>
  <text x="343" y="94" text-anchor="middle" fill="#3b2a8c">0</text><text x="369" y="94" text-anchor="middle" fill="#3b2a8c">0</text><text x="395" y="94" text-anchor="middle" fill="#3b2a8c">0</text>
</svg>
</div>

**坑①**：稀疏图用矩阵就是浪费——社交网络几亿用户，绝大多数互不认识，矩阵会爆内存。反之需要"这条边在不在"频繁查询时，矩阵 `O(1)` 更香。

---

## 三、BFS：广度优先，按层扩散

从起点出发，**先访问所有距离为 1 的点，再距离为 2 的……**用**队列**实现。它天然给出**无权图的最短路径**（边数最少）。

```java
// 邻接表 BFS（同时记录到各点的最短距离）
static int[] bfs(List<Integer>[] g, int s){
    int n = g.length;
    int[] dist = new int[n];
    Arrays.fill(dist, -1);
    Queue<Integer> q = new LinkedList<>();
    dist[s] = 0; q.add(s);
    while (!q.isEmpty()){
        int u = q.poll();
        for (int v : g[u]){
            if (dist[v] == -1){          // 未访问过
                dist[v] = dist[u] + 1;
                q.add(v);
            }
        }
    }
    return dist;
}
```

<div style="background:#fff;border:1px solid #d0d7de;border-radius:8px;padding:8px;margin:16px 0">
<svg viewBox="0 0 460 150" xmlns="http://www.w3.org/2000/svg" font-family="monospace" font-size="12">
  <rect x="0" y="0" width="460" height="150" fill="#fff"/>
  <text x="230" y="16" text-anchor="middle" fill="#1a4731">BFS 层级扩散（环上数字 = 距起点层数）</text>
  <circle cx="60" cy="80" r="16" fill="#ddf4e4" stroke="#2da44e"/><text x="60" y="84" text-anchor="middle" fill="#1a4731">0</text>
  <circle cx="150" cy="40" r="16" fill="#e7f5ff" stroke="#1971c2"/><text x="150" y="44" text-anchor="middle" fill="#0b4a8a">1</text>
  <circle cx="150" cy="120" r="16" fill="#e7f5ff" stroke="#1971c2"/><text x="150" y="124" text-anchor="middle" fill="#0b4a8a">1</text>
  <circle cx="250" cy="80" r="16" fill="#fff4e6" stroke="#e8590c"/><text x="250" y="84" text-anchor="middle" fill="#9a4a00">2</text>
  <circle cx="350" cy="40" r="16" fill="#fff4e6" stroke="#e8590c"/><text x="350" y="44" text-anchor="middle" fill="#9a4a00">2</text>
  <circle cx="350" cy="120" r="16" fill="#fff4e6" stroke="#e8590c"/><text x="350" y="124" text-anchor="middle" fill="#9a4a00">2</text>
  <circle cx="430" cy="80" r="16" fill="#ffe3e3" stroke="#e03131"/><text x="430" y="84" text-anchor="middle" fill="#a61e1e">3</text>
  <g stroke="#57606a" fill="none"><line x1="76" y1="74" x2="134" y2="48"/><line x1="76" y1="86" x2="134" y2="112"/>
  <line x1="166" y1="48" x2="234" y2="72"/><line x1="166" y1="112" x2="234" y2="88"/>
  <line x1="266" y1="74" x2="334" y2="48"/><line x1="266" y1="86" x2="334" y2="112"/>
  <line x1="366" y1="48" x2="414" y2="72"/><line x1="366" y1="112" x2="414" y2="88"/></g>
</svg>
</div>

---

## 四、DFS：深度优先，一条道走到黑

用**栈（或递归）**，先往深处钻，走不动再回溯。擅长判**连通性、环、拓扑排序**，但**不保证最短路径**。

```java
static void dfs(List<Integer>[] g, int u, boolean[] seen){
    seen[u] = true;
    for (int v : g[u]){
        if (!seen[v]) dfs(g, v, seen);   // 递归即隐式栈
    }
}
```

**坑②**：DFS 找到的路径通常**不是最短**——它只是"能到达"。需要最短距离务必用 BFS（无权）或 Dijkstra（带权）。

---

## 五、Dijkstra：带权图的最短路径

当边有**权重**时，BFS 失效（边数少 ≠ 权值和小）。Dijkstra 用**优先队列（最小堆）**反复"取出当前距离最小的未定节点，用它松弛邻居"——典型贪心。

```java
// 带权图 Dijkstra（返回起点 s 到各点的最短距离）
static int[] dijkstra(int n, int[][] edges, int s){
    List<int[]>[] g = new List[n];
    for (int i = 0; i < n; i++) g[i] = new ArrayList<>();
    for (int[] e : edges){ g[e[0]].add(new int[]{e[1], e[2]}); }  // u -> (v, w)
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[s] = 0;
    PriorityQueue<int[]> pq = new PriorityQueue<>((a,b)->a[1]-b[1]); // (节点, 距离)
    pq.add(new int[]{s, 0});
    while (!pq.isEmpty()){
        int[] cur = pq.poll();
        int u = cur[0], d = cur[1];
        if (d > dist[u]) continue;            // 懒删除：跳过过期副本
        for (int[] edge : g[u]){
            int v = edge[0], w = edge[1];
            if (dist[u] + w < dist[v]){
                dist[v] = dist[u] + w;
                pq.add(new int[]{v, dist[v]});
            }
        }
    }
    return dist;
}
```

<div style="background:#fff;border:1px solid #d0d7de;border-radius:8px;padding:8px;margin:16px 0">
<svg viewBox="0 0 480 130" xmlns="http://www.w3.org/2000/svg" font-family="monospace" font-size="12">
  <rect x="0" y="0" width="480" height="130" fill="#fff"/>
  <text x="240" y="16" text-anchor="middle" fill="#1a4731">Dijkstra 松弛：选出最小 dist 的节点扩展邻居</text>
  <circle cx="70" cy="80" r="16" fill="#ddf4e4" stroke="#2da44e"/><text x="70" y="84" text-anchor="middle" fill="#1a4731">A·0</text>
  <circle cx="200" cy="40" r="16" fill="#e7f5ff" stroke="#1971c2"/><text x="200" y="44" text-anchor="middle" fill="#0b4a8a">B·4</text>
  <circle cx="200" cy="120" r="16" fill="#e7f5ff" stroke="#1971c2"/><text x="200" y="124" text-anchor="middle" fill="#0b4a8a">C·2</text>
  <circle cx="360" cy="80" r="16" fill="#fff4e6" stroke="#e8590c"/><text x="360" y="84" text-anchor="middle" fill="#9a4a00">D·?</text>
  <g stroke="#57606a" fill="none">
    <line x1="86" y1="74" x2="186" y2="48"/><line x1="86" y1="86" x2="186" y2="112"/>
    <line x1="216" y1="48" x2="344" y2="72"/><line x1="216" y1="112" x2="344" y2="88"/></g>
  <text x="135" y="52" text-anchor="middle" fill="#57606a">4</text>
  <text x="135" y="116" text-anchor="middle" fill="#57606a">2</text>
  <text x="285" y="56" text-anchor="middle" fill="#57606a">3</text>
  <text x="285" y="110" text-anchor="middle" fill="#57606a">1</text>
</svg>
</div>

**坑③**：Dijkstra **要求边权非负**。一旦出现负权，贪心"取最小"会被推翻——此时要换 Bellman-Ford（可检测负环）。时间复杂度 `O((V+E) log V)`。

---

## 六、Java 与 C++：图怎么写更顺手

| 维度 | Java | C++ |
|---|---|---|
| 邻接表 | `List<Integer>[]` 或 `List<int[]>` | `vector<vector<pair<int,int>>>` |
| 队列 | `LinkedList` / `ArrayDeque` | `queue` |
| 优先队列 | `PriorityQueue` | `priority_queue`（默认最大堆，需反向比较） |
| 体验 | 内置容器，写起来直观 | 性能略高，但语法更啰嗦 |

**坑④**：Java 的 `PriorityQueue` 默认**最大堆**；Dijkstra 要最小堆，比较器写成 `(a,b)->a[1]-b[1]`（或 `Comparator.comparingInt`）。C++ 则要用 `greater<>` 或自定义比较反转。

---

## 七、小结

- **是什么**：图是点 + 边的网络；邻接表省空间、邻接矩阵查边快。
- **坑**：稀疏图别用矩阵；DFS 不保证最短路径；Dijkstra 不能处理负权；Java 优先队列默认最大堆。
- **本质一句话**：BFS 用队列按层走（无权最短路径），DFS 用栈往深钻（连通/环/拓扑），Dijkstra 用堆做带权最短路——**先想清"我要可达性还是要最短距离、边有没有权"，再选武器**。

带着三个问题读每一篇会更有收获：**① 我的图稠密还是稀疏？决定存法。 ② 要最短路径还是只要到达？决定 BFS 还是 DFS。 ③ 边带权吗、有负权吗？决定 Dijkstra 还是 Bellman-Ford。**
