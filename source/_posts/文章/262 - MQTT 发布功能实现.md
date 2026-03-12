---
title: MQTT 发布功能实现
tags:
  - MQTT
categories:
  - MQTT
series: MQTT
abbrlink: aaf4f01
date: 2025-12-25 19:33:21
---

MQTT的发布功能是客户端向Broker发送消息到指定主题的核心操作，结合paho-mqtt C++库，实现发布功能需遵循**连接Broker→构造消息→发布消息→处理发布结果**的流程。以下是具体步骤、代码示例及关键细节说明。

## 一、实现发布功能的核心步骤

1. **初始化客户端并连接Broker**：先建立与MQTT Broker的连接（基础前提）。
2. **构造MQTT消息**：指定消息的主题、负载（内容）、QoS等级、保留标志等属性。
3. **调用发布接口**：通过客户端实例发送消息，支持同步/异步发布。
4. **处理发布结果**：通过回调或返回值确认消息是否发布成功（尤其QoS>0时）。
5. **断开连接（可选）**：发布完成后按需断开与Broker的连接。

## 二、基础发布功能实现（同步发布）

### 步骤1：配置基础信息

定义Broker地址、客户端ID、发布主题等常量：

```C++
#include <iostream>
#include <mqtt/client.h>

// 配置信息
const std::string BROKER_ADDRESS = "tcp://test.mosquitto.org:1883";  // 公共测试Broker
const std::string CLIENT_ID = "mqtt_publisher_demo";               // 客户端ID（需唯一）
const std::string PUBLISH_TOPIC = "test/cpp/publish";               // 发布主题
```

### 步骤2：创建客户端并连接Broker

初始化MQTT客户端实例，配置连接选项并建立连接：

```C++
// 创建MQTT客户端
mqtt::client client(BROKER_ADDRESS, CLIENT_ID);

// 配置连接选项
mqtt::connect_options conn_opts;
conn_opts.set_clean_session(true);          // 清理会话
conn_opts.set_keep_alive_interval(20);      // 心跳间隔20秒

try {
    // 连接Broker
    std::cout << "连接Broker: " << BROKER_ADDRESS << std::endl;
    client.connect(conn_opts);
    std::cout << "连接成功！" << std::endl;
} catch (const mqtt::exception& e) {
    std::cerr << "连接失败: " << e.what() << std::endl;
    return 1;
}
```

### 步骤3：构造并发布消息

通过`mqtt::message`类构造消息，调用`client.publish()`发布：

```C++
// 构造消息
std::string payload = "Hello, MQTT from C++ Publisher!";  // 消息内容
int qos = 1;                                              // QoS等级（0/1/2）
bool retained = false;                                    // 是否保留消息（Broker存储最后一条保留消息）

mqtt::message msg(PUBLISH_TOPIC, payload, qos, retained);

// 同步发布消息（阻塞直到发布完成或失败）
try {
    std::cout << "发布消息到主题: " << PUBLISH_TOPIC << std::endl;
    client.publish(msg);  // 发布消息
    std::cout << "消息发布成功！内容: " << payload << std::endl;
} catch (const mqtt::exception& e) {
    std::cerr << "发布失败: " << e.what() << std::endl;
    client.disconnect();
    return 1;
}
```

### 步骤4：断开连接（可选）

发布完成后断开与Broker的连接：

```C++
// 断开连接
client.disconnect();
std::cout << "已断开与Broker的连接" << std::endl;
```

### 完整代码示例

```C++
#include <iostream>
#include <mqtt/client.h>

const std::string BROKER_ADDRESS = "tcp://test.mosquitto.org:1883";
const std::string CLIENT_ID = "mqtt_publisher_demo";
const std::string PUBLISH_TOPIC = "test/cpp/publish";

int main() {
    // 1. 创建客户端
    mqtt::client client(BROKER_ADDRESS, CLIENT_ID);

    // 2. 配置连接选项并连接
    mqtt::connect_options conn_opts;
    conn_opts.set_clean_session(true);
    conn_opts.set_keep_alive_interval(20);

    try {
        client.connect(conn_opts);
        std::cout << "连接Broker成功！" << std::endl;
    } catch (const mqtt::exception& e) {
        std::cerr << "连接失败: " << e.what() << std::endl;
        return 1;
    }

    // 3. 构造并发布消息
    std::string payload = "Hello, MQTT from C++ Publisher!";
    mqtt::message msg(PUBLISH_TOPIC, payload, 1, false);

    try {
        client.publish(msg);
        std::cout << "消息发布成功！" << std::endl;
        std::cout << "主题: " << PUBLISH_TOPIC << std::endl;
        std::cout << "内容: " << payload << std::endl;
    } catch (const mqtt::exception& e) {
        std::cerr << "发布失败: " << e.what() << std::endl;
        client.disconnect();
        return 1;
    }

    // 4. 断开连接
    client.disconnect();
    std::cout << "断开连接成功！" << std::endl;

    return 0;
}
```

### 编译运行

```Bash
# 编译（链接paho-mqtt库）
g++ -std=c++11 mqtt_publisher.cpp -o mqtt_publisher -lpaho-mqttpp3 -lpaho-mqtt3as

# 运行发布端
./mqtt_publisher
```

## 三、进阶发布功能实现

### 1. 异步发布与发布确认（QoS>0）

对于QoS=1或2的消息，可通过异步发布+回调确认消息是否送达Broker：

```C++
#include <iostream>
#include <mqtt/client.h>
#include <mqtt/callback.h>

// 自定义回调类：处理发布完成事件
class PublishCallback : public virtual mqtt::callback {
public:
    // 发布完成回调（QoS>0时触发）
    void delivery_complete(mqtt::delivery_token_ptr tok) override {
        if (tok) {
            std::cout << "\n发布完成！消息ID: " << tok->get_message_id() << std::endl;
            std::cout << "主题: " << tok->get_message()->get_topic() << std::endl;
        }
    }
};

int main() {
    mqtt::client client(BROKER_ADDRESS, CLIENT_ID);
    PublishCallback cb;
    client.set_callback(cb);  // 设置回调

    // 连接Broker
    mqtt::connect_options conn_opts;
    conn_opts.set_clean_session(true);
    client.connect(conn_opts);

    // 异步发布消息（非阻塞）
    std::string payload = "异步发布的MQTT消息";
    mqtt::message msg(PUBLISH_TOPIC, payload, 1, false);
    mqtt::delivery_token_ptr tok = client.publish(msg);  // 获取发布令牌

    // 等待发布完成（可选）
    tok->wait_for_completion();
    std::cout << "异步发布完成！" << std::endl;

    client.disconnect();
    return 0;
}
```

### 2. 批量发布多条消息

循环发布多条消息到同一或不同主题：

```C++
// 批量发布5条消息
for (int i = 0; i < 5; ++i) {
    std::string payload = "批量消息 " + std::to_string(i + 1);
    mqtt::message msg(PUBLISH_TOPIC, payload, 0);  // QoS=0（最多一次交付）
    client.publish(msg);
    std::cout << "已发布: " << payload << std::endl;
    std::this_thread::sleep_for(std::chrono::seconds(1));  // 间隔1秒
}
```

### 3. 发布保留消息

保留消息会被Broker存储，后续订阅该主题的客户端会立即收到最后一条保留消息：

```C++
// 构造保留消息（retained=true）
mqtt::message msg(PUBLISH_TOPIC, "保留消息内容", 1, true);
client.publish(msg);
std::cout << "保留消息发布成功！" << std::endl;
```

### 4. 带认证的发布（用户名/密码）

若Broker需身份认证，需在连接选项中配置用户名和密码：

```C++
// 配置认证信息
conn_opts.set_user_name("your_username");
conn_opts.set_password("your_password");

// 连接并发布
client.connect(conn_opts);
client.publish(PUBLISH_TOPIC, "带认证的消息", 1);
```

## 四、关键参数说明

| 参数                           | 作用                                        | 可选值/示例                                 |
| ------------------------------ | ------------------------------------------- | ------------------------------------------- |
| **QoS等级**                    | 消息交付保证机制                            | 0（最多一次）、1（至少一次）、2（恰好一次） |
| **保留标志**                   | Broker是否存储最后一条消息，供新订阅者接收  | `true`（保留）、`false`（不保留）           |
| **发布令牌（delivery_token）** | 跟踪异步发布的状态，用于确认发布完成        | `tok->wait_for_completion()` 等待完成       |
| **主题（Topic）**              | 消息的分类标识，支持层级（如`sensor/temp`） | `test/cpp/publish`、`sensor/#`（通配符）    |

## 五、常见问题排查

### 1. 消息发布成功但订阅端未收到？

- 检查发布主题与订阅主题是否完全匹配（区分大小写）。
- 确认QoS配置：订阅端QoS需≥发布端QoS才能接收对应消息。
- 若使用QoS=1/2，确保客户端发布后未立即断开连接（需等待Broker确认）。

### 2. 发布时抛出异常？

- 检查Broker连接是否正常（未连接时发布会抛出异常）。
- 确认主题格式合法（不能包含空格、通配符仅用于订阅）。
- 若Broker启用认证，需配置正确的用户名/密码。

### 3. 异步发布的回调未触发？

- 确保设置了回调类（`client.set_callback(cb)`）。
- 确认消息的QoS>0（QoS=0无发布确认，不会触发回调）。

## 六、总结

实现MQTT发布功能的核心流程为：**连接Broker→构造消息→调用publish接口→处理结果**。根据业务需求，可选择同步/异步发布、设置不同QoS等级、发布保留消息等。关键需注意Broker连接状态、主题匹配规则及QoS机制，确保消息可靠送达。