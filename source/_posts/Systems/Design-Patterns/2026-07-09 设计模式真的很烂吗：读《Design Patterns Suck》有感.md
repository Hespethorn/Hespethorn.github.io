---
title: 设计模式真的很烂吗：读《Design Patterns Suck》有感
tags:
  - 文章
  - 设计模式
  - 架构设计
  - C++
  - 软件工程
categories:
  - Systems
  - Design-Patterns
abbrlink: c610829b
date: 2026-07-09 00:00:00
series: [Design-Patterns]
---

## 一、偶然读到一篇"离经叛道"的文章

今天偶然看到一篇标题很刺眼的文章：**"Design Patterns Suck"**（设计模式很烂）。作为一个从 C++ 起步、曾经把《设计模式》奉为圭臬的程序员，我带着好奇和一丝抵触点了进去。

文章的观点非常激进：

> "设计模式被高估了、滥用了，而且常常是完全不必要的。"
> 
> "设计模式不过是丑陋的变通方案，因为我们的编程语言不够强大、不够灵活，无法表达我们真正想要的东西。"

读完之后，我陷入了沉思。这些话虽然刺耳，但似乎又有点道理。让我从自己的经历出发，谈谈对这个话题的看法。

## 二、我的设计模式之旅

### 2.1 C++时代的"模式实践"

我最早接触设计模式是在大学学习 C++ 的时候。那时候，《设计模式》这本书几乎是每个 C++ 开发者的必备读物。工厂模式、单例模式、观察者模式、策略模式……这些名词像咒语一样被反复念叨。

记得当时做一个简单的学生管理系统，我非要往里塞各种设计模式：

```cpp
class Student {
public:
    virtual ~Student() = default;
    virtual std::string getName() const = 0;
};

class Undergraduate : public Student {
    std::string name_;
    int age_;
public:
    Undergraduate(const std::string& name, int age) : name_(name), age_(age) {}
    std::string getName() const override { return name_; }
};

class Graduate : public Student {
    std::string name_;
    int age_;
public:
    Graduate(const std::string& name, int age) : name_(name), age_(age) {}
    std::string getName() const override { return name_; }
};

class StudentFactory {
public:
    virtual ~StudentFactory() = default;
    virtual std::unique_ptr<Student> createStudent(const std::string& name, int age) = 0;
};

class UndergraduateFactory : public StudentFactory {
public:
    std::unique_ptr<Student> createStudent(const std::string& name, int age) override {
        return std::make_unique<Undergraduate>(name, age);
    }
};

class GraduateFactory : public StudentFactory {
public:
    std::unique_ptr<Student> createStudent(const std::string& name, int age) override {
        return std::make_unique<Graduate>(name, age);
    }
};
```

使用方式：

```cpp
std::unique_ptr<StudentFactory> factory = std::make_unique<UndergraduateFactory>();
auto student = factory->createStudent("张三", 20);
std::cout << student->getName() << std::endl;
```

运行结果：

```
张三
```

现在回想起来，这个系统总共就两种学生类型，完全不需要这么复杂的工厂模式。但当时的我觉得，只有用了设计模式，代码才算"专业"。

### 2.2 简化后的C++写法

后来我意识到，C++ 其实可以用更简洁的方式实现同样的功能。不需要虚函数、不需要工厂类，用一个简单的函数就够了：

```cpp
class Undergraduate {
    std::string name_;
    int age_;
public:
    Undergraduate(const std::string& name, int age) : name_(name), age_(age) {}
    std::string getName() const { return name_; }
};

class Graduate {
    std::string name_;
    int age_;
public:
    Graduate(const std::string& name, int age) : name_(name), age_(age) {}
    std::string getName() const { return name_; }
};

template<typename T>
auto create_student(const std::string& name, int age) {
    return T(name, age);
}
```

使用方式：

```cpp
auto student = create_student<Undergraduate>("张三", 20);
std::cout << student.getName() << std::endl;
```

运行结果：

```
张三
```

就这么简单。不需要虚函数，不需要工厂类，不需要复杂的继承体系。一个模板函数就搞定了。

再看单例模式。传统的 C++ 单例需要写一堆代码：

```cpp
class Logger {
    static std::unique_ptr<Logger> instance_;
    
    Logger() = default;
public:
    Logger(const Logger&) = delete;
    Logger& operator=(const Logger&) = delete;
    
    static Logger& getInstance() {
        if (!instance_) {
            instance_ = std::make_unique<Logger>();
        }
        return *instance_;
    }
    
    void log(const std::string& message) {
        std::cout << "[LOG] " << message << std::endl;
    }
};

std::unique_ptr<Logger> Logger::instance_ = nullptr;
```

使用方式：

```cpp
Logger::getInstance().log("Hello World");
```

运行结果：

```
[LOG] Hello World
```

而现代 C++ 里呢？C++11 之后，局部静态变量天然就是线程安全的单例：

```cpp
class Logger {
public:
    static Logger& getInstance() {
        static Logger instance;
        return instance;
    }
    
    void log(const std::string& message) {
        std::cout << "[LOG] " << message << std::endl;
    }
};
```

使用方式：

```cpp
Logger::getInstance().log("Hello World");
```

运行结果：

```
[LOG] Hello World
```

甚至更简单，直接用 namespace：

```cpp
namespace logger {
    void log(const std::string& message) {
        std::cout << "[LOG] " << message << std::endl;
    }
}
```

使用方式：

```cpp
logger::log("Hello World");
```

运行结果：

```
[LOG] Hello World
```

## 三、设计模式的本质是什么

### 3.1 设计模式是语言的"补丁"

这篇文章让我意识到一个重要的观点：**设计模式本质上是语言缺陷的补丁。**

| 设计模式 | 解决的语言问题 | C++ 的解决方案 |
|---------|--------------|----------------|
| **单例模式** | 语言无法直接表达"只有一个实例" | C++11 局部静态变量、namespace |
| **工厂模式** | 复杂对象创建无法优雅表达 | 模板函数、std::variant、std::any |
| **策略模式** | 无法将算法作为参数传递 | 函数指针、lambda、std::function |
| **观察者模式** | 无法轻松实现事件订阅 | std::function + std::vector、信号槽库 |
| **模板方法** | 无法灵活组合行为 | 模板、CRTP、策略模式 + 模板 |

以策略模式为例。传统 C++ 需要定义虚函数接口：

```cpp
class PaymentStrategy {
public:
    virtual ~PaymentStrategy() = default;
    virtual void pay(double amount) = 0;
};

class CreditCardPayment : public PaymentStrategy {
public:
    void pay(double amount) override {
        std::cout << "Paying " << amount << " with credit card" << std::endl;
    }
};

class PayPalPayment : public PaymentStrategy {
public:
    void pay(double amount) override {
        std::cout << "Paying " << amount << " with PayPal" << std::endl;
    }
};

class ShoppingCart {
    std::unique_ptr<PaymentStrategy> paymentStrategy_;
public:
    ShoppingCart(std::unique_ptr<PaymentStrategy> strategy) 
        : paymentStrategy_(std::move(strategy)) {}
    
    void checkout(double amount) {
        paymentStrategy_->pay(amount);
    }
};
```

使用方式：

```cpp
ShoppingCart cart(std::make_unique<CreditCardPayment>());
cart.checkout(100.0);
```

运行结果：

```
Paying 100 with credit card
```

而现代 C++ 直接用 std::function：

```cpp
void credit_card_pay(double amount) {
    std::cout << "Paying " << amount << " with credit card" << std::endl;
}

void paypal_pay(double amount) {
    std::cout << "Paying " << amount << " with PayPal" << std::endl;
}

void process_payment(std::function<void(double)> payment_method, double amount) {
    payment_method(amount);
}
```

调用时：

```cpp
process_payment(credit_card_pay, 100.0);
```

运行结果：

```
Paying 100 with credit card
```

甚至可以用 lambda：

```cpp
process_payment([](double amount) {
    std::cout << "Paying " << amount << " with Apple Pay" << std::endl;
}, 100.0);
```

运行结果：

```
Paying 100 with Apple Pay
```

不需要虚函数，不需要继承，不需要多态。这就是现代 C++ 表达力带来的差距。

### 3.2 设计模式是"词汇表"，不是"银弹"

文章中提到一个很有趣的观点：设计模式的真正价值是作为**沟通的词汇表**。

> "模式不是用来教你写好代码的。它们是用来谈论已经写好的代码的。"

在团队沟通中，说"这是一个门面模式"比详细解释"我们用一个类封装了三个复杂类，提供统一的接口"要高效得多。但如果把模式当成解决问题的起点，而不是描述问题的工具，就本末倒置了。

我曾经遇到过一个项目，代码里充斥着各种设计模式的名称，但实际功能却非常简单。团队成员讨论时满口"依赖注入"、"控制反转"、"中介者模式"，但写出来的代码却难以理解。这就是把模式当成了目的，而不是手段。

## 四、设计模式与过度设计

### 4.1 我见过的过度设计

设计模式很容易导致过度设计。我见过太多这样的例子：

**例子一：一个简单的配置管理类**

```cpp
class ConfigProvider {
public:
    virtual ~ConfigProvider() = default;
    virtual std::string get(const std::string& key) = 0;
};

class FileConfigProvider : public ConfigProvider {
public:
    std::string get(const std::string& key) override {
        return "file-value";
    }
};

class DatabaseConfigProvider : public ConfigProvider {
public:
    std::string get(const std::string& key) override {
        return "db-value";
    }
};

class ConfigProviderFactory {
public:
    static std::unique_ptr<ConfigProvider> create() {
        return std::make_unique<FileConfigProvider>();
    }
};
```

使用方式：

```cpp
auto config = ConfigProviderFactory::create();
std::cout << config->get("database.url") << std::endl;
```

运行结果：

```
file-value
```

实际上，这个项目从始至终只用到了文件配置，数据库配置从未实现过。这就是为了"可能的需求"而做的过度设计。

而现代 C++ 里，一个简单的 std::map 就够了：

```cpp
#include <map>
#include <string>

class ConfigManager {
    std::map<std::string, std::string> configs_;
public:
    ConfigManager() {
        configs_["database.url"] = "file-value";
    }
    
    std::string get(const std::string& key) const {
        auto it = configs_.find(key);
        return it != configs_.end() ? it->second : "";
    }
};
```

使用方式：

```cpp
ConfigManager config;
std::cout << config.get("database.url") << std::endl;
```

运行结果：

```
file-value
```

**例子二：一个日志系统**

```cpp
class Logger {
public:
    virtual ~Logger() = default;
    virtual void debug(const std::string& message) = 0;
    virtual void info(const std::string& message) = 0;
    virtual void error(const std::string& message) = 0;
};

class ConsoleLogger : public Logger {
public:
    void debug(const std::string& message) override {
        std::cout << "[DEBUG] " << message << std::endl;
    }
    void info(const std::string& message) override {
        std::cout << "[INFO] " << message << std::endl;
    }
    void error(const std::string& message) override {
        std::cerr << "[ERROR] " << message << std::endl;
    }
};

class LoggerManager {
    static std::unique_ptr<Logger> instance_;
public:
    static Logger& getInstance() {
        if (!instance_) {
            instance_ = std::make_unique<ConsoleLogger>();
        }
        return *instance_;
    }
};

std::unique_ptr<Logger> LoggerManager::instance_ = nullptr;
```

使用方式：

```cpp
LoggerManager::getInstance().info("Application started");
```

运行结果：

```
[INFO] Application started
```

而 C++ 里，我们可以用 spdlog 这样的成熟库，或者直接用 std::source_location（C++20）：

```cpp
#include <source_location>
#include <iostream>

void log_info(const std::string& message, 
              const std::source_location& loc = std::source_location::current()) {
    std::cout << "[INFO] " << loc.file_name() << ":" << loc.line() 
              << " " << message << std::endl;
}
```

使用方式：

```cpp
log_info("Application started");
```

运行结果：

```
[INFO] main.cpp:42 Application started
```

### 4.2 简单性原则

文章中引用了一个很好的准则：

> "如果你的解决方案需要一张图来解释，那你已经走得太远了。"

我深以为然。好的代码应该是自解释的，不需要复杂的 UML 图来理解。设计模式不是目的，而是手段。当简单的方案能解决问题时，就不需要引入复杂的模式。

## 五、两种编程哲学的对比

### 5.1 Gosling vs Guido

文章提到了两种截然不同的编程哲学：

**James Gosling（Java 设计者）的哲学：**
- 对程序员持悲观态度
- 认为普通开发者会滥用权力
- 提供一个"沙盒"，限制自由度
- 强调安全性和规范性

**Guido van Rossum（Python 设计者）的哲学：**
- 对程序员持乐观态度
- 认为代码是读得多、写得少
- 提供强大的工具，信任开发者
- 强调可读性和表达力

这两种哲学直接导致了设计模式在不同语言中的地位差异：

| 方面 | Java（Gosling 哲学） | Python（Guido 哲学） |
|------|---------------------|---------------------|
| **设计模式地位** | 核心工具，必须掌握 | 辅助工具，按需使用 |
| **代码风格** | 冗长、规范、模式化 | 简洁、灵活、直接 |
| **问题解决方式** | 通过模式间接解决 | 直接解决 |
| **学习曲线** | 陡峭，需要掌握大量模式 | 平缓，语言本身就是解决方案 |

## 六、C++与设计模式的关系

### 6.1 C++的独特位置

C++ 处在一个很独特的位置：它比 Java 更强大、更灵活，但又不像 Python 那样完全抛弃了静态类型。这使得设计模式在 C++ 中的地位很微妙。

**更重要的是，C++ 的发展历程恰恰验证了《Design Patterns Suck》一文的核心观点。** 从 C++03 到 C++11/14/17/20，随着语言不断引入更强大的特性（lambda、std::function、auto、移动语义、概念等），很多曾经必须用设计模式解决的问题，现在都可以用语言特性直接解决。这正是设计模式作为"语言补丁"的最好证明。

| 方面 | Java | C++ | Python |
|------|------|-----|--------|
| **设计模式地位** | 核心工具 | 辅助工具 | 很少使用 |
| **语言表达力** | 较弱 | 中等偏强 | 很强 |
| **代码风格** | 冗长、规范 | 灵活、可定制 | 简洁、直接 |
| **问题解决方式** | 通过模式间接解决 | 直接解决或用模式 | 直接解决 |
| **性能要求** | 一般 | 严格 | 一般 |

### 6.2 C++的语言特性如何替代设计模式

C++ 提供了很多语言特性，可以直接替代传统的设计模式：

| 设计模式 | C++ 替代方案 | 说明 |
|---------|-------------|------|
| **单例模式** | 局部静态变量 | C++11 线程安全，简洁优雅 |
| **工厂模式** | 模板函数、std::variant | 编译期多态，零运行时开销 |
| **策略模式** | std::function、lambda | 一等函数，灵活组合 |
| **观察者模式** | std::vector<std::function> | 简单直接，无需继承 |
| **装饰器模式** | 模板、组合 | 编译期组合，零虚函数开销 |
| **适配器模式** | 模板、lambda | 编译期适配，灵活 |

### 6.3 我的体会

作为一个 C++ 工程师，我最大的感受是：**C++ 给了你足够的自由度，但也需要你做出正确的选择。**

在 C++ 里，我可以选择用虚函数实现传统的设计模式，也可以选择用模板、lambda、std::function 等现代特性直接解决问题。这种选择的自由，既是 C++ 的优势，也是它的挑战。

但这并不意味着设计模式完全没有价值。当我需要和其他开发者沟通时，模式名称仍然是高效的沟通工具。只是我不再把它们当作解决问题的"银弹"。

## 七、设计模式的正确打开方式

### 7.1 我的观点

经过思考，我对设计模式的看法是：

1. **设计模式不是坏东西，但它们被滥用了。** 当语言表达力不足时，模式是有用的工具。但当语言已经足够强大时，强行套用模式只会增加不必要的复杂性。

2. **模式是词汇表，不是解决方案。** 学习模式的目的是为了更好地理解和讨论代码，而不是为了在每个问题上都套用模式。

3. **优先使用语言特性，其次考虑模式。** 在动手写代码之前，先想想语言本身是否已经提供了解决方案。C++ 的模板、lambda、std::function、RAII 等特性，常常能替代复杂的模式。

4. **避免过度设计。** 不要为了"可能的需求"而引入模式。YAGNI（You Ain't Gonna Need It）原则永远适用。

### 7.2 一个实际例子

让我用一个实际的例子来说明我的观点。

**需求：** 实现一个数据处理器，可以处理不同格式的数据（JSON、CSV、XML）。

**传统 C++ 方式（使用策略模式）：**

```cpp
class DataProcessor {
public:
    virtual ~DataProcessor() = default;
    virtual void process(const std::string& data) = 0;
};

class JsonProcessor : public DataProcessor {
public:
    void process(const std::string& data) override {
        std::cout << "Processing JSON: " << data.substr(0, std::min(data.size(), size_t(50))) << std::endl;
    }
};

class CsvProcessor : public DataProcessor {
public:
    void process(const std::string& data) override {
        std::cout << "Processing CSV: " << data.substr(0, std::min(data.size(), size_t(50))) << std::endl;
    }
};

class XmlProcessor : public DataProcessor {
public:
    void process(const std::string& data) override {
        std::cout << "Processing XML: " << data.substr(0, std::min(data.size(), size_t(50))) << std::endl;
    }
};

class DataProcessorFactory {
public:
    static std::unique_ptr<DataProcessor> create(const std::string& format) {
        if (format == "json") return std::make_unique<JsonProcessor>();
        if (format == "csv") return std::make_unique<CsvProcessor>();
        if (format == "xml") return std::make_unique<XmlProcessor>();
        throw std::invalid_argument("Unknown format: " + format);
    }
};
```

使用方式：

```cpp
auto processor = DataProcessorFactory::create("json");
processor->process("{\"name\": \"test\", \"value\": 123}");
```

运行结果：

```
Processing JSON: {"name": "test", "value": 123}
```

**现代 C++ 方式（使用 std::map 和 std::function）：**

```cpp
#include <map>
#include <functional>

void process_json(const std::string& data) {
    std::cout << "Processing JSON: " << data.substr(0, std::min(data.size(), size_t(50))) << std::endl;
}

void process_csv(const std::string& data) {
    std::cout << "Processing CSV: " << data.substr(0, std::min(data.size(), size_t(50))) << std::endl;
}

void process_xml(const std::string& data) {
    std::cout << "Processing XML: " << data.substr(0, std::min(data.size(), size_t(50))) << std::endl;
}

std::map<std::string, std::function<void(const std::string&)>> processors = {
    {"json", process_json},
    {"csv", process_csv},
    {"xml", process_xml}
};

void process_data(const std::string& format, const std::string& data) {
    auto it = processors.find(format);
    if (it != processors.end()) {
        it->second(data);
    } else {
        throw std::invalid_argument("Unknown format: " + format);
    }
}
```

测试一下：

```cpp
process_data("json", "{\"name\": \"test\", \"value\": 123}");
```

运行结果：

```
Processing JSON: {"name": "test", "value": 123}
```

可以看到，现代 C++ 版本同样实现了相同的功能，但代码量少了一半，而且更加直观。不需要虚函数、不需要继承、不需要工厂。这就是语言表达力的差异。

## 八、总结

读这篇文章让我重新审视了设计模式的价值。设计模式本身不是问题，问题在于我们如何使用它们。

**我的核心观点：**

1. **设计模式是语言缺陷的补丁。** 随着编程语言越来越强大，很多模式变得不再必要。

2. **模式的真正价值是作为沟通工具。** 使用模式名称可以高效地讨论代码，但不能作为解决问题的起点。

3. **优先使用语言特性。** 在 C++、Python 等现代语言中，很多模式可以用语言特性直接替代。

4. **避免过度设计。** 简单的解决方案往往是最好的。

设计模式不是银弹，也不是洪水猛兽。它们是工具，工具的价值取决于使用者。作为 C++ 工程师，我们应该理解模式背后的思想，而不是死记硬背模式的实现。当语言已经足够强大时，我们应该直接解决问题，而不是绕道而行。

**记住：代码是用来解决问题的，不是用来展示模式的。**
