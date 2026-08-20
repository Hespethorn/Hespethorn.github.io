---
title: CS61A 笔记（八）Scheme 解释器、尾递归与声明式 SQL
tags:
  - CS61A
  - Scheme
  - 尾递归
  - SQL
categories:
  - CS基础课程
series: CS基础课程
abbrlink: c61a0108
date: 2024-09-26
---

## 一、Scheme 基础：括号即一切

Scheme 是 CS61A 后半段的主力语言（Lisp 方言）。一切都是**S-表达式**：原子（数字、符号）或括号包裹的组合。

```scheme
(define (square x) (* x x))     ; 定义过程
(square 5)                      ; => 25
(define x 10)
(if (> x 0) "正" "负")          ; => "正"
```

调用形式是 `(操作符 操作数 ...)`，和 Python 的 `操作符(操作数)` 对应，但全是前缀。

## 二、过程也是值（和 Python 一致）

```scheme
(define (make-adder n)
  (lambda (x) (+ x n)))         ; 返回匿名过程，闭包！
(define add5 (make-adder 5))
(add5 3)                        ; => 8
```

这正是篇二的"高阶函数 + 闭包"，在 Scheme 里是原生范式。

## 三、尾递归：让递归不爆栈

普通递归调用后还要"做点什么"（如 `fib` 的 `+`），调用栈一直挂着。若递归调用是**最后一步**、返回值直接作为结果，就是**尾递归**，解释器可复用栈帧（尾调用优化）：

```scheme
; 尾递归版阶乘：累加器 acc 带着中间结果
(define (fact n)
  (define (iter i acc)
    (if (= i 0)
        acc
        (iter (- i 1) (* i acc))))   ; 最后一步就是递归调用
  (iter n 1))
```

`iter` 的递归调用是函数体最后一步，结果直接返回——这是**迭代过程**（iterative process），空间 O(1)，不会随 n 爆栈。对比篇三的线性递归是**递归过程**（recursive process），空间 O(n)。

## 四、eval / apply：解释器怎么跑

CS61A 的高潮是**写一个 Scheme 解释器**。核心两个函数：

- `eval(expr, env)`：在当前环境求值表达式；
- `apply(proc, args)`：把过程作用于实参。

二者互相调用，形成"求值—应用"的循环。理解它，你就明白了"编程语言本身也是程序"——这也呼应篇一的环境模型：`env` 就是名字→值的映射。

## 五、声明式编程与 SQL

命令式（如 Python）告诉计算机**怎么做**；**声明式**只说**要什么**，细节交给系统。SQL 是典型：

```sql
SELECT name, age
FROM   students
WHERE  age > 20
ORDER  BY age DESC;
```

这段只声明"选出年龄>20 的姓名年龄、按年龄降序"，至于怎么扫描、用什么索引，数据库自己决定。对比 Python 命令式写法：

```python
[(s.name, s.age) for s in students if s.age > 20][::-1]  # 还得自己管排序方向
```

**核心区别**：声明式把"逻辑"和"执行"解耦，系统可自由优化；命令式把步骤写死。CS61A 用 Scheme（函数式）和 SQL（声明式）拓宽你对"编程范式"的认知边界。

## 六、收官小结

- Scheme：**前缀 S-表达式**、过程即值、闭包原生。
- **尾递归** = 递归调用是最后一步 → 可尾调用优化，空间 O(1)。
- 解释器 = `eval` 与 `apply` 互调，基于环境模型。
- **SQL 是声明式**：说要什么，不说怎么做。

至此，一个月、8 篇，CS61A 的核心骨架（函数/环境 → 高阶函数 → 递归 → 数据抽象/序列 → 可变与结构 → OOP → 效率/迭代器 → Scheme/解释器/SQL）已铺完。后续可往**数据结构与算法（CS61B）**、**计算机系统（CS61C）** 继续深入。🐾
