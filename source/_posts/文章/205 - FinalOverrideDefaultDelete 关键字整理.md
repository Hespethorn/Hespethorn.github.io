---
title: Final/Override/Default/Delete 关键字整理
tags:
  - Final
  - Override
  - Default
categories:
  - C++
  - Foundational Syntax and Core Concepts
series: Foundational Syntax and Core Concepts
abbrlink: 6a5bb7d1
date: 2025-03-08 19:52:50
---
## 导言

整理[CppGuide社区](https://cppguide.cn/)内容，Final/Override/Default/Delete 均为**C++ 关键字**，ANSI C（如 C89、C99、C11）标准不支持这些特性。以下解析基于 C++（面向对象扩展，常与 C 语言结合使用），关联 C 语言的内存管理、代码安全思想，所有代码需用 C++ 编译器（如 g++、clang++）编译，ANSI C 编译器（如 gcc）均不支持。

## 一、Final 关键字：限制继承与重写

### 1. 语义定义与作用域

- 作用 1：修饰**类**时，禁止该类被继承（作用域为整个类）

- 作用 2：修饰**虚函数**时，禁止子类重写该虚函数（作用域为单个虚函数）

- C 语言类比：C 中通过结构体封装 + 函数指针模拟多态时，需手动规范 “继承”（如不允许其他结构体包含父结构体模拟继承），但 Final 是 C++ 编译期强制约束，比 C 的代码规范更可靠。

### 2. 代码实例 1：Final 修饰类（禁止继承）

```
#include <stdio.h>
// Final作用域：整个base_class类，禁止任何子类继承
class base_class final  
{
public:
    void print_msg()
    {
        printf("this is base class\n");
    }
};

// 错误示例：尝试继承final修饰的类，编译器报错（g++ 11.4.0，C++11+）
// class derived_class : public base_class
// {
// public:
//     void print_msg()
//     {
//         printf("this is derived class\n");
//     }
// };

int main()
{
    base_class obj;
    obj.print_msg();  // 运行结果：this is base class
    return 0;
}
```

= 说明：base_class 被 final 修饰后，继承操作直接触发编译错误，避免 C 语言中 “意外扩展结构体” 导致的成员偏移错误（如子类结构体新增成员覆盖父类成员）。

### 3. 代码实例 2：Final 修饰虚函数（禁止重写）

```
#include <stdio.h>
class base_class
{
public:
    // Final作用域：virtual print_msg函数，禁止子类重写
    virtual void print_msg() final
    {
        printf("base class virtual function\n");
    }
};

class derived_class : public base_class
{
public:
    // 错误示例：尝试重写final虚函数，编译器报错（g++ 11.4.0，C++11+）
    // virtual void print_msg()
    // {
    //     printf("derived class virtual function\n");
    // }
};

int main()
{
    base_class* ptr = new derived_class();
    ptr->print_msg();  // 无错误代码时运行结果：base class virtual function
    delete ptr;
    return 0;
}
```

= 说明：final 修饰虚函数后，子类无法修改函数逻辑，避免 C 语言中 “误改函数指针” 导致的多态行为异常（如子类函数指针指向错误函数）。

## 二、Override 关键字：显式声明重写

### 1. 语义定义与作用域

- 作用：修饰子类虚函数，显式声明 “该函数重写父类虚函数”（作用域为子类虚函数）

- 编译器检查：1）父类是否存在同名、同参数列表、同返回值（协变除外）的虚函数；2）子类函数是否为虚函数，不满足则报错

- C 语言类比：C 模拟多态时需手动保证函数签名（名称、参数、返回值）一致，若拼写错误（如 calculat）或参数不匹配（float vs int），编译不报错但运行逻辑错误，Override 可提前发现这类问题。

### 2. 代码实例 1：正确使用 Override（重写生效）

```
#include <stdio.h>
class base_class
{
public:
    // 父类虚函数，供子类重写
    virtual void calculate(int a, int b)
    {
        printf("base calculate: %d\n", a + b);
    }
};

class derived_class : public base_class
{
public:
    // Override作用域：calculate函数，显式声明重写父类虚函数
    virtual void calculate(int a, int b) override
    {
        printf("derived calculate: %d\n", a * b);
    }
};

int main()
{
    base_class* ptr = new derived_class();
    ptr->calculate(3, 4);  // 运行结果：derived calculate: 12（多态生效）
    delete ptr;
    return 0;
}
```

= 说明：Override 通过编译器验证重写正确性，避免 C 语言中 “函数签名不匹配” 导致的多态失效（如父类是 int a，子类是 float a，C 中会调用父类函数，Override 直接报错）。

### 3. 代码实例 2：Override 触发错误检查（拼写 / 参数错误）

```
#include <stdio.h>
class base_class
{
public:
    virtual void show_info(const char* msg)
    {
        printf("base info: %s\n", msg);
    }
};

class derived_class : public base_class
{
public:
    // 错误示例1：参数类型不匹配（char* vs const char*），Override报错（g++ 11.4.0）
    // virtual void show_info(char* msg) override
    
    // 错误示例2：函数名拼写错误（show_inf），Override报错
    // virtual void show_inf(const char* msg) override
    
    // 正确示例：签名完全匹配
    virtual void show_info(const char* msg) override
    {
        printf("derived info: %s\n", msg);
    }
};

int main()
{
    derived_class obj;
    obj.show_info("test override");  // 运行结果：derived info: test override
    return 0;
}
```

= 说明：Override 将 “隐式错误” 转为 “编译期错误”，错误信息明确（如 “override does not override any base class method”），比 C 语言的 “运行时逻辑错误” 更易调试。

## 三、Default 关键字：显式生成默认函数

### 1. 语义定义与作用域

- 作用：显式要求编译器生成**默认特殊成员函数**（作用域为类的特殊成员函数），支持的函数包括：
  - 默认构造函数（无参）
  - 默认析构函数
  - 默认复制构造函数
  - 默认复制赋值运算符
  - 默认移动构造函数
  - 默认移动赋值运算符

- C 语言类比：C 结构体无构造 / 析构，需手动写初始化（如 void init_struct (struct_obj* obj)）和销毁（如 void free_struct (struct_obj* obj) 函数，Default 让编译器自动生成这些函数，减少重复代码。

### 2. 代码实例 1：Default 生成默认构造函数（解决 “带参构造屏蔽无参构造” 问题）

```
#include <stdio.h>
class data_class
{
private:
    int data_num;
    char data_char;
public:
    // Default作用域：默认构造函数，显式让编译器生成（无参）
    data_class() = default;
    
    // 带参构造函数：若只写带参构造，编译器默认不生成无参构造
    data_class(int num, char c) : data_num(num), data_char(c) {}
    
    void print_data()
    {
        printf("num: %d, char: %c\n", data_num, data_char);
    }
};

int main()
{
    // 调用编译器生成的默认构造函数，成员为默认值（int=0，char='\0'）
    data_class obj1;  
    // 调用带参构造函数
    data_class obj2(10, 'A');  
    
    obj1.print_data();  // 运行结果：num: 0, char: （char为'\0'，无显示）
    obj2.print_data();  // 运行结果：num: 10, char: A
    return 0;
}
```

= 说明：C 语言中若结构体需要两种初始化方式（无参 / 带参），需写两个函数（init_empty、init_with_val），Default 简化为 “=default”，且生成的默认构造符合 C++ 内存布局（成员零初始化）。

### 3. 代码实例 2：Default 生成默认析构函数（简单场景使用）

```
#include <stdio.h>
#include <cstdlib>  // 用于malloc/free
class resource_class
{
private:
    int* data_ptr;
public:
    // 带参构造：分配动态内存
    resource_class(int size)
    {
        data_ptr = (int*)malloc(size * sizeof(int));
        printf("memory allocated, ptr: %p\n", data_ptr);
    }
    
    // Default作用域：默认析构函数，编译器生成（注：若有malloc，需手动写析构free，此例仅演示语法）
    ~resource_class() = default;  
    
    int* get_ptr() { return data_ptr; }
};

int main()
{
    resource_class obj(5);
    printf("ptr address: %p\n", obj.get_ptr());  // 运行结果：memory allocated, ptr: 0x...（地址可变）
    return 0;
}
```

= 说明：默认析构函数自动释放类成员（无动态内存时无需手动处理），C 语言中需手动写 free 函数，Default 减少简单场景的代码量，且生成的析构符合 C++ 生命周期规则。

## 四、Delete 关键字：显式禁止函数调用

### 1. 语义定义与作用域

- 作用：显式禁止编译器生成默认函数，或禁止特定函数的调用（作用域为类的特殊成员函数或普通函数）

- C 语言类比：C 中需通过 “声明函数但不定义” 阻止调用（如 void func (); 不写实现，链接时报错），Delete 在编译期阻止调用，错误信息更明确，且支持禁止普通函数。

### 2. 代码实例 1：Delete 禁止复制构造 / 赋值（防止浅拷贝内存错误）

```
#include <stdio.h>
#include <cstdlib>
class unique_resource
{
private:
    int* data_ptr;
public:
    // 带参构造：分配动态内存
    unique_resource(int size)
    {
        data_ptr = (int*)malloc(size * sizeof(int));
        printf("resource created, ptr: %p\n", data_ptr);
    }
    
    // 析构函数：释放动态内存
    ~unique_resource()
    {
        free(data_ptr);
        printf("resource freed, ptr: %p\n", data_ptr);
    }
    
    // Delete作用域：复制构造函数，禁止调用（防止浅拷贝）
    unique_resource(const unique_resource& other) = delete;
    
    // Delete作用域：复制赋值运算符，禁止调用
    unique_resource& operator=(const unique_resource& other) = delete;
};

int main()
{
    unique_resource obj1(5);
    // 错误示例1：尝试复制构造，编译器报错（g++ 11.4.0）
    // unique_resource obj2 = obj1;
    
    // 错误示例2：尝试复制赋值，编译器报错
    // unique_resource obj3(3);
    // obj3 = obj1;
    
    return 0;
}
```

= 说明：若不禁止复制，obj2 与 obj1 会浅拷贝（同一块内存），析构时重复 free 导致内存错误，C 语言中需手动确保 “只传结构体指针，不传值”，Delete 从编译期杜绝浅拷贝，比 C 的规范更可靠。

### 3. 代码实例 2：Delete 禁止普通函数的特定调用（避免隐式类型转换）

```
#include <stdio.h>
// 处理int类型的函数
void print_value(int value)
{
    printf("integer value: %d\n", value);
}

// Delete作用域：float类型的print_value，显式禁止调用
void print_value(float value) = delete;

int main()
{
    print_value(10);  // 正确调用int版本，运行结果：integer value: 10
    
    // 错误示例1：直接调用float版本，编译器报错
    // print_value(3.14f);
    
    // 错误示例2：double隐式转换为float，触发delete函数，编译器报错
    // print_value(3.14);
    
    return 0;
}
```

= 说明：C 语言中需通过函数名区分类型（如 print_int、print_double），Delete 简化了函数重载控制，避免隐式转换导致的精度丢失（如 3.14 是 double，转 float 会丢失精度）。

## 五、关键字对编程的影响（对比 C 语言）

### 1. 内存管理

- Final：修饰虚函数时，编译器可优化虚函数表（静态绑定），减少 C 语言模拟多态的函数指针开销

- Default：生成的默认函数确保成员零初始化，避免 C 语言手动初始化遗漏的野指针问题

- Delete：禁止复制构造防止重复 free，比 C 语言手动控制更彻底（C 语言靠链接错误，Delete 靠编译错误）

### 2. 代码安全

- Override：提前发现重写错误，避免 C 语言 “函数签名不匹配” 的运行时逻辑错误

- Final：阻止意外继承，避免 C 语言 “结构体扩展” 导致的成员偏移错误

- Delete：禁止特定函数调用，避免 C 语言 “隐式类型转换” 的精度 / 逻辑错误

### 3. 性能优化

- Final：修饰类时关闭部分 RTTI 优化，修饰虚函数时减少动态绑定开销

- Default：编译器生成的默认函数（如复制构造）比 C 语言手动循环复制更高效

- Override/Delete：无直接性能影响，但减少错误处理开销，间接提升运行稳定性