---
title: Python @property高级应用技巧
tags:
  - Python
  - 装饰器
  - /@property
  - 数据校验
categories:
  - Python
series: Python
abbrlink: python-property-advanced-usage
date: 2024-06-13
---

## 一、数据校验与约束

这是@property最常见的用途。当你需要确保某个属性的值符合特定规则时（例如，年龄不能为负数），可以使用它：

* 传统方式：需要显式调用`set_age()`方法
* 使用@property：可以像给普通属性赋值一样`obj.age = 25`，但赋值操作会触发你预设的校验逻辑

```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self._age = age  # 使用单下划线表示这是一个内部属性
    
    @property
    def age(self):
        """获取年龄"""
        return self._age

    @age.setter
    def age(self, value):
        """设置年龄，并进行校验"""
        if not isinstance(value, int) or value < 0 or value > 150:
            raise ValueError("年龄必须在0-150之间的整数")
        self._age = value

p = Person("Alice", 30)
p.age = 31          # 像属性一样赋值，但会触发setter中的校验逻辑
p.age = -5        # 会抛出ValueError
```

## 二、创建计算属性（只读属性）

有些值并非直接存储，而是由其他属性动态计算得出，比如圆的面积、矩形的周长。使用@property可以将这些计算方法变成只读属性：

* 传统方式：需要调用`get_area()`方法
* 使用@property：可以直接访问`obj.area`，语义更清晰，调用方也无需关心这个值是存储的还是计算的

```python
class Circle:
    def __init__(self, radius):
        self.radius = radius

    @property
    def area(self):
        """计算并返回圆的面积（只读属性）"""
        return 3.14159 * self.radius ** 2

c = Circle(5)
print(c.area)  # 像访问属性一样获取计算结果，无需加括号
c.area = 100 # 报错！因为没有定义setter，这是一个只读属性
```

## 三、保持向后兼容性

这是@property的一个高级但极其重要的用途。假设你最初将一个属性设计为公开属性，后来发现需要增加校验逻辑：

* 不使用@property：你需要将所有`obj.attr`的调用改为`obj.set_attr()`，这会破坏已有的代码
* 使用@property：你可以将公开属性重构为@property，而所有调用方代码`obj.attr`无需任何改动，实现了无缝升级

## 四、完整语法：Getter, Setter, Deleter

@property体系包含三个装饰器，让你可以完全控制属性的访问、修改和删除行为：

| 装饰器 | 作用 | 触发时机 |
|-------|------|--------|
| @property | 定义getter方法 | 当读取属性时，如`obj.attr` |
| @attr.setter | 定义setter方法 | 当设置属性时，如`obj.attr = value` |
| @attr.deleter | 定义deleter方法 | 当删除属性时，如`del obj.attr` |

```python
class Example:
    def __init__(self, value):
        self._value = value

    @property
    def value(self):
        print("Getting value")
        return self._value

    @value.setter
    def value(self, new_value):
        print(f"Setting value to {new_value}")
        self._value = new_value

    @value.deleter
    def value(self):
        print("Deleting value")
        del self._value

e = Example(10)
val = e.value      # 输出: Getting value
e.value = 20       # 输出: Setting value to 20
del e.value        # 输出: Deleting value
```

## 五、注意事项

* **避免耗时操作**：@property方法在执行时看起来就像访问一个普通属性，因此不应在其中执行耗时操作（如网络请求、复杂计算），否则会让调用方在不经意间感到程序卡顿
* **不要过度使用**：对于简单的、无需任何逻辑的数据存储，直接使用公开属性是更简单、更高效的选择。@property应该用在"需要逻辑控制"的场景
* **避免循环引用**：在getter或setter方法内部，务必访问带下划线的内部属性（如`_value`），而不是属性本身（如`self.value`），否则会引发无限递归
