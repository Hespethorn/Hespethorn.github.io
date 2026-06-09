---
title: Leetcode 0429. N-ary Tree Level Order Traversal
tags:
  - leetcode
categories:
  - Leetcode
  - tree
series: Leetcode-Cpp
abbrlink: 541cfd3d
date: 2023-12-22 20:47:00
---

## [429. N-ary Tree Level Order Traversal](https://leetcode.cn/problems/n-ary-tree-level-order-traversal/)

Given an n-ary tree, return the *level order* traversal of its nodes' values.

*Nary-Tree input serialization is represented in their level order traversal, each group of children is separated by the null value (See examples).*

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2018/10/12/narytreeexample.png)

```
Input: root = [1,null,3,2,4,null,5,6]
Output: [[1],[3,2,4],[5,6]]
```

**Example 2:**

![img](https://assets.leetcode.com/uploads/2019/11/08/sample_4_964.png)

```
Input: root = [1,null,2,3,4,5,null,null,6,7,null,8,null,9,10,null,null,11,null,12,null,13,null,null,14]
Output: [[1],[2,3,4,5],[6,7,8,9,10],[11,12,13],[14]]
```

## 题目大意

给定一棵 N 叉树的根节点 `root`，返回其节点值的**层序遍历**结果（即按层从上到下、每层从左到右访问节点）。N 叉树的每个节点可能有多个子节点（而非二叉树的最多 2 个），输入序列化以层序遍历表示，子节点组之间用 `null` 分隔。

例如：

- 输入 N 叉树 `[1,null,3,2,4,null,5,6]`，层序遍历结果为 `[[1],[3,2,4],[5,6]]`（第一层为根节点 1，第二层为子节点 3、2、4，第三层为 3 的子节点 5、6）。

## 解题思路

1. 利用队列存储每一层的节点，保证按顺序处理
2. 对于每一层，先记录当前队列的大小（即当前层的节点数）
3. 依次取出当前层的所有节点，收集它们的值
4. 将每个节点的所有子节点加入队列，作为下一层的节点
5. 处理完一层后，将收集到的当前层节点值加入结果集

## 代码实现

```
/*
// Definition for a Node.
class Node {
public:
    int val;
    vector<Node*> children;

    Node() {}

    Node(int _val) {
        val = _val;
    }

    Node(int _val, vector<Node*> _children) {
        val = _val;
        children = _children;
    }
};
*/

class Solution {
public:
    vector<vector<int>> levelOrder(Node *root) {
        if (root == nullptr) return {};
        vector<vector<int>> ans;
        queue<Node*> q;
        q.push(root);
        while (!q.empty()) {
            vector<int> vals;
            for (int n = q.size(); n--;) {
                auto node = q.front();
                q.pop();
                vals.push_back(node->val);
                for (auto c : node->children) {
                    q.push(c);
                }
            }
            ans.emplace_back(vals);
        }
        return ans;
    }
};
```

作者：灵茶山艾府
链接：https://leetcode.cn/problems/n-ary-tree-level-order-traversal/solutions/2642410/liang-chong-bfs-xie-fa-shuang-shu-zu-dui-a4hd/
来源：力扣（LeetCode）
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。