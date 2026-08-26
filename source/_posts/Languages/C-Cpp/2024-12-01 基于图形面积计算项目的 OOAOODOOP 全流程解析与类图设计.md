---

title: 基于图形面积计算项目的 OOA/OOD/OOP 全流程解析与类图设计
tags:
  - OOA
  - OOD
  - OOP
  - UML
categories: [Languages, C-Cpp]
abbrlink: f2ee0340
date: 2024-12-01

---
## 一、面向对象分析（OOA）：需求提取与实体识别

### 1.1 核心业务需求

本系统旨在实现以下关键功能：

1. 支持对多种基础几何图形，包括矩形、圆形和三角形的面积计算；

1. 以统一的方式展示不同类型图形的名称及其对应的面积计算结果；

1. 构建具有高度扩展性的系统架构，确保在新增图形类型时，现有计算逻辑无需进行任何修改。

### 1.2 核心实体识别（3 个以上核心实体）

经过严谨的需求分析，本研究确定了以下核心业务实体，并对各实体的属性、行为及业务约束进行了详细定义：

| 实体名称                    | 核心属性                      | 核心行为               | 业务约束                                     |
| --------------------------- | ----------------------------- | ---------------------- | -------------------------------------------- |
| 图形（Figure）              | 无直接属性（抽象概念）        | 获取名称、计算面积     | 作为抽象基类，不可实例化，需由具体图形类继承 |
| 矩形（Rectangle）           | 长度（length）、宽度（width） | 计算面积、返回名称     | 长度和宽度必须为正数                         |
| 圆形（Circle）              | 半径（radius）                | 计算面积、返回名称     | 半径必须为正数                               |
| 三角形（Triangle）          | 三边长度（a、b、c）           | 计算面积、返回名称     | 三边长度需满足三角不等式（a+b>c 等）         |
| 图形管理器（FigureManager） | 图形集合（figures）           | 展示图形信息、批量计算 | 支持图形的添加与移除操作                     |

### 1.3 行为需求梳理

本系统涉及的行为需求可分为抽象行为、具体行为和辅助行为三类，具体如下：

1. **抽象行为**：定义getName()方法用于获取图形名称，getArea()方法用于计算图形面积，这些方法将在具体图形类中实现；

1. **具体行为**：针对不同图形类型，采用相应的计算公式，如矩形面积通过长乘宽计算，圆形面积基于圆周率与半径平方的乘积，三角形面积则依据海伦公式进行计算；

1. **辅助行为**：display()方法用于展示图形的详细信息，addFigure()方法用于向系统中添加新的图形对象。

## 二、面向对象设计（OOD）：类结构设计与 StarUML 建模

### 2.1 StarUML 建模准备（步骤 2）

建模准备工作包括以下具体步骤：

1. 启动 StarUML 软件，创建新的项目，选择默认的 "UML Project" 模板；
1. 在左侧的 Model Explorer 中，通过右键菜单依次选择 "Model" → "Add Diagram" → "Class Diagram"，并将新建的类图命名为 "图形面积计算类图"；
1. 建立统一的建模规范：
   - 类命名采用 "首字母大写驼峰式"（如Figure、Rectangle）；
   - 属性命名采用 "首字母小写驼峰式"（如length、radius）；
   - 方法命名采用 "首字母小写驼峰式"（如getName()、getArea()）；
   - 使用+（public）、-（private）、#（protected）标注成员的可见性。

### 2.2 类图结构化设计（步骤 3：5 个类及关系）

#### 2.2.1 类图核心元素

本研究设计了包含五个核心类的类图结构，各成员的可见性、属性和方法定义如下：

| 类名                 | 可见性 | 属性（可见性 + 类型 + 名称）           | 方法（可见性 + 返回类型 + 名称 (参数)）                      |
| -------------------- | ------ | -------------------------------------- | ------------------------------------------------------------ |
| **Figure**（抽象类） | -      | 无                                     | + getName(): string（纯虚）+ getArea(): double（纯虚）       |
| **Rectangle**        | -      | - length: double- width: double        | + Rectangle(len: double, wid: double)+ getName(): string（重写）+ getArea(): double（重写） |
| **Circle**           | -      | - radius: double- PI: double（static） | + Circle(r: double)+ getName(): string（重写）+ getArea(): double（重写） |
| **Triangle**         | -      | - a: double- b: double- c: double      | + Triangle(a: double, b: double, c: double)+ getName(): string（重写）+ getArea(): double（重写） |
| **FigureManager**    | -      | - figures: List<Figure*>               | + addFigure(fig: Figure*): void+ displayAll(): void+ calculateTotalArea(): double |

#### 2.2.2 类间关系定义（明确标注关系类型）

本系统类间存在三种关系，其具体定义和在 StarUML 中的绘制方式如下：

**继承关系（Generalization）**：

- Rectangle、Circle和Triangle均继承自Figure类；

- 在 StarUML 中，使用 "Generalization" 工具，从子类指向父类绘制空心三角形箭头。

**聚合关系（Aggregation）**：

- FigureManager类聚合多个Figure对象，被聚合的图形对象可以独立存在；

- 在 StarUML 中，使用 "Aggregation" 工具，从FigureManager指向Figure绘制空心菱形箭头。

**依赖关系（Dependency）**：

- display()函数依赖Figure对象获取图形信息；

- 在 StarUML 中，使用 "Dependency" 工具，从display()指向Figure绘制虚线空心箭头。

#### 2.2.3 StarUML 类图审查（行为准则）

类图设计完成后，需进行严格审查，具体操作和检查要点如下：

1. 在 StarUML 中，通过右键点击类图并选择 "Validate Diagram" 进行验证；
1. 重点检查内容包括：
   - 每个类至少包含一个属性和一个方法，满足面向对象设计的基本规则；
   - 继承关系中，父类作为抽象类，子类必须正确重写所有纯虚方法；
   - 静态属性（如Circle.PI）需正确标注 "static" 关键字；
   - 类间关系类型标注清晰，不存在模糊或错误的关联。

## 三、面向对象编程（OOP）：模型验证与代码同步

### 3.1 代码生成（StarUML 正向工程）

代码生成步骤如下：

1. 在 StarUML 中选中所有类，通过右键菜单选择 "Code Engineering" → "Generate Code"；
2. 选择 C++ 作为目标编程语言，并配置以下生成参数：
   - 勾选 "Generate Constructor" 以生成构造函数；
   - 若需要属性访问接口，勾选 "Generate Getter/Setter"；
   - 勾选 "Generate Documentation" 生成注释文档；

3. 在生成的代码框架基础上，补充具体业务逻辑，如海伦公式的实现和圆周率的定义，并与示例代码进行对比验证。

### 3.2 逆向工程验证（模型与代码同步）

逆向工程验证过程如下：

1. 在 StarUML 中，通过 "Tools" → "Code Engineering" → "Import Code" 导入示例代码；
1. 选择相应的 C++ 代码文件（.cpp/.h），执行逆向工程操作；
1. 对比逆向生成的类图与原始设计类图，确保：
   - 类的结构，包括属性、方法和可见性完全一致；
   - 继承关系和静态属性标注准确无误；
   - 抽象方法（纯虚函数）被正确识别。



