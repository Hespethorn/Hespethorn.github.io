---

title: Python self与cls的区别深度解析
tags:
  - Python
  - self
  - cls
  - 实例方法
  - 类方法
categories: [Languages, Python]
series: [Python]
abbrlink: python-self-vs-cls
date: 2024-05-28

---

## 一、核心区别对比

| 特性 | self (实例方法) | cls (类方法 @classmethod) |
|-----|----------------|--------------------------|
| 代表对象 | 实例对象 (具体的某一个) | 类对象 (整个类别/图纸) |
| 第一个参数 | 接收调用该方法的实例 | 接收调用该方法的类 |
| 访问权限 | 访问实例属性(self.name) 和类属性 | 只能访问类属性(cls.count) |
| 主要职责 | 处理具体业务逻辑，修改个体状态 | 修改全局状态、工厂模式创建实例 |
| 调用方式 | 通常通过 实例.方法() 调用 | 通常通过 类.方法() 调用 |

## 二、形象类比：汽车工厂

为了更直观地理解，我们可以把类想象成一个汽车工厂，把实例想象成造出来的汽车：

### 1. self (实例方法) — 针对具体的车

- **场景**：给车喷漆、踩油门、换轮胎
- **逻辑**：你必须先有一辆车（实例），才能做这些操作。你不能对着空气踩油门
- **代码体现**：`self.color = "Red"`（把这一辆车喷红，不影响别的车）

### 2. cls (类方法) — 针对工厂/图纸

- **场景**：修改出厂默认颜色、统计总共造了多少辆车、决定下一代车型的引擎规格
- **逻辑**：这些操作不需要具体的车，而是针对“生产线”或“设计图”的
- **代码体现**：`cls.default_color = "Blue"`（以后造出来的所有新车默认都是蓝色）

## 三、代码实战：看它们如何分工

```python
class Robot:
    # 类属性：所有机器人共享的“集体记忆”
    battery_type = "Lithium-Ion"
    robot_count = 0

    def __init__(self, name):
        # 实例属性：每个机器人独有的“个人记忆”
        self.name = name
        self.energy = 100
        
        # 这里调用类方法来增加计数
        Robot.increment_count()

    # --- self 的主场：实例方法 ---
    def say_hello(self):
        # 访问实例属性(self.name) 和类属性
        print(f"我是 {self.name}，我的电量是 {self.energy}。所有机器人用的电池是 {Robot.battery_type}")

    def work(self):
        # 修改实例状态
        self.energy -= 10
        print(f"{self.name} 正在工作，剩余电量 {self.energy}")

    # --- cls 的主场：类方法 ---
    @classmethod
    def change_battery_type(cls, new_type):
        # 修改类属性，影响所有实例
        cls.battery_type = new_type
        print(f"工厂升级了！以后所有机器人将使用 {cls.battery_type} 电池")

    @classmethod
    def increment_count(cls):
        # 修改类属性
        cls.robot_count += 1

    @classmethod
    def get_robot_count(cls):
        return cls.robot_count

# --- 验证区别 ---

r1 = Robot("R2-D2")
r2 = Robot("C-3PO")

# 1. 使用 self (实例方法)
r1.work()        # 只有 R2-D2 掉电
r1.say_hello()   # 输出: 我是 R2-D2...

# 2. 使用 cls (类方法)
# 改变电池类型，这是针对“类”的操作
Robot.change_battery_type("Nuclear") 

# 此时再让 r2 说话，它也会知道电池变了
r2.say_hello()   # 输出: ...所有机器人用的电池是 Nuclear
# 3. 统计数量
print(f"总共有 {Robot.get_robot_count()} 个机器人") # 输出: 2
```

## 四、为什么要区分得这么清楚？

### 1. 数据安全与隔离：

- 如果 `work` 方法用 `cls` 写，那么一个机器人工作，所有机器人的电量都会减少，这显然不符合逻辑
- 如果 `change_battery_type` 用 `self` 写，那你必须先造出一个机器人才能改电池类型，而且改了之后可能只影响这一个机器人，也不符合逻辑

### 2. 工厂模式（Factory Method）：

- `cls` 还有一个神奇的能力：它知道它是谁
- 如果你有一个父类 `Robot` 和一个子类 `FlyingRobot`，当你调用 `FlyingRobot.create()` 时，`cls` 会自动变成 `FlyingRobot`。这样你就能用同一套代码创建不同种类的子类实例，而 `self` 做不到这一点（因为 `self` 必须在实例创建后才存在）

## 五、总结

- `self` 是“我”：关注个体的喜怒哀乐（属性）
- `cls` 是“我们”：关注集体的规则和未来的规划

当你需要操作具体数据时，用 `self`；当你需要操作全局配置或制造新个体时，用 `cls`。
