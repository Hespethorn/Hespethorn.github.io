---

title: Python @property装饰器核心机制解析
tags:
  - Python
  - 装饰器
  - /@property
  - 属性
categories: [Languages, Python]
series: [Python]
abbrlink: python-property-decorator-core
date: 2024-05-20

---

## 引言

"明明定义了@property，为什么在init里给它赋值却提示can't set attribute？"——这是无数Python初学者踩过的坑。今天，我们从这个报错出发，彻底搞懂@property的底层逻辑。

## 一、错误现场：一个"只读"的陷阱

先看这段看似合理的代码：

```python
class Student:
    def __init__(self, name):
        self.name = name  # 这里会报错！

    @property
    def name(self):
        return self._name
```

运行后抛出`AttributeError: can't set attribute`。为什么？因为Python将@property装饰的name视为"只读属性"——你只定义了"读取方法"（getter），却没提供"写入方法"（setter），就像给变量装了个"只读开关"，自然无法赋值。

## 二、核心机制：self.name不是变量，是"触发器"

关键认知：在@property机制下，`self.name`并非存储数据的"容器"，而是调用函数的"触发器"。

- 当你写`self.name = value`时，Python不会直接创建`self.name`，而是去查找`@name.setter`函数；
- 如果找不到setter，就认为该属性"只读"，拒绝赋值；
- 如果找到setter，则自动调用它，并将value作为参数传入。

## 三、正确姿势：setter+_name的"双保险"

要解决这个问题，必须同时满足两个条件：

1. 定义`@name.setter`：提供"写入通道"；
2. 用`self._name`存储数据：避免无限递归（若在setter中写`self.name = value`，会再次触发setter，导致死循环）。

正确代码如下：

```python
class Student:
    def __init__(self, name):
        self.name = name  # 触发setter

    @property
    def name(self):
        return self._name  # getter返回内部存储

    @name.setter
    def name(self, name):
        if not name:
            raise ValueError("Name cannot be empty")  # 数据验证
        self._name = name  # 实际存储到"私有"变量
```

## 四、进阶理解：@property的本质是"属性描述符"

@property是Python"属性描述符"的简化实现。它允许你将方法伪装成属性，从而在"读取""写入""删除"时插入自定义逻辑（如数据验证、懒加载、计算属性等）。这种"显式控制"的设计，正是Python"优雅、明确"哲学的体现。

## 五、最佳实践总结

- 若需在init中赋值@property属性，必须定义对应的@setter；
- 实际数据应存储在`self._xxx`（带下划线前缀），`self.xxx`仅作为"接口"；
- 利用setter实现数据验证，让属性赋值更安全；
- 避免在setter中直接操作`self.xxx`，防止无限递归。
