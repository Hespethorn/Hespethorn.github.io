---
title: 在 Windows 上打出 arm64 的 deb 包：从 WSL 交叉编译到板子上一行 dpkg -i
tags:
  - deb
  - 交叉编译
  - aarch64
  - WSL
  - CMake
categories: [Systems, Dev-Practice]
abbrlink: b3e4a71c
date: 2026-09-14
series: [Dev-Practice]
---

手里是一台 Windows 开发机，目标是一块 RK3588（aarch64）板子。最省事的想法是"把源码 scp 过去，在板子上 `make`"，可板子四颗 A76 主频 1.7 GHz，编译一遍要十几分钟，交叉编译依赖还常常装不上；想打 deb 又总觉得"这是 Debian 的东西，得在 Debian 上做"。

其实**打 deb 包根本不需要目标机器在场**——`.deb` 的本质是一个 `ar` 归档，里面塞了三个文件：`debian-binary`（写死 `2.0`）、`control.tar`（元数据）、`data.tar`（要装进根文件系统的文件）。**它是个打包格式，不是编译产物。** 只要你能产出 aarch64 的二进制、能跑 `dpkg-deb`，在哪台机器上打都行——Windows 上装个 WSL 就齐活了。

这一篇全程在 WSL Ubuntu 22.04（x86_64）上实操，产出 `cfgd_1.0.0_arm64.deb`，用 qemu 在打包机上直接把包里的 arm64 二进制跑起来验证，最后给出板子上的安装与回滚命令。所有命令输出都是本机真跑出来的，不是抄的。

## 1. 三条路线，先选对

<div align="center">
<svg viewBox="0 0 680 300" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="680" height="300" fill="#fbfbfd"/>
<text x="340" y="22" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#333">把程序送上 aarch64 板子的三条路</text>
<rect x="16" y="40" width="200" height="104" rx="6" fill="#fde8e8" stroke="#e5484d"/>
<text x="116" y="62" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#1f2328">① 板子原生编译</text>
<text x="28" y="84" font-size="11.5" font-family="sans-serif" fill="#555">scp 源码 → 板子上 gcc → make</text>
<text x="28" y="102" font-size="11.5" font-family="sans-serif" fill="#555">✓ 依赖绝对不会错</text>
<text x="28" y="120" font-size="11.5" font-family="sans-serif" fill="#e5484d">✗ 慢（分钟级），占板子资源</text>
<text x="28" y="138" font-size="11.5" font-family="sans-serif" fill="#e5484d">✗ 无版本、无卸载、无回滚</text>
<rect x="240" y="40" width="200" height="104" rx="6" fill="#e6f6ea" stroke="#30a46c"/>
<text x="340" y="62" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#1f2328">② WSL 交叉编译 + 打 deb</text>
<text x="252" y="84" font-size="11.5" font-family="sans-serif" fill="#555">x86 主机 → arm64 二进制 → .deb</text>
<text x="252" y="102" font-size="11.5" font-family="sans-serif" fill="#30a46c">✓ 秒级构建，可进 CI</text>
<text x="252" y="120" font-size="11.5" font-family="sans-serif" fill="#30a46c">✓ 有版本/依赖/卸载/回滚</text>
<text x="252" y="138" font-size="11.5" font-family="sans-serif" fill="#e2a03f">△ 依赖要靠 apt 元数据声明</text>
<rect x="464" y="40" width="200" height="104" rx="6" fill="#e8f0fe" stroke="#7f9cf5"/>
<text x="564" y="62" text-anchor="middle" font-size="13" font-family="sans-serif" fill="#1f2328">③ qemu 容器模拟</text>
<text x="476" y="84" font-size="11.5" font-family="sans-serif" fill="#555">docker buildx / arm64 rootfs</text>
<text x="476" y="102" font-size="11.5" font-family="sans-serif" fill="#30a46c">✓ 环境最接近真板</text>
<text x="476" y="120" font-size="11.5" font-family="sans-serif" fill="#e5484d">✗ 慢（指令翻译 5~10 倍）</text>
<text x="476" y="138" font-size="11.5" font-family="sans-serif" fill="#e5484d">✗ 配置重，不适合日常迭代</text>
<rect x="16" y="162" width="648" height="58" rx="6" fill="#fff4d6" stroke="#e2a03f"/>
<text x="30" y="182" font-size="12" font-family="sans-serif" fill="#1f2328">推荐组合：日常迭代走 ②，发布前用 qemu 把包里的二进制跑一遍做冒烟；只有在需要 apt 装一堆 arm64 依赖库时，才临时开 ③ 做完整验证。</text>
<text x="30" y="204" font-size="12" font-family="sans-serif" fill="#1f2328">关键认知：编译要交叉（需要 arm64 工具链），打包不需要（dpkg-deb 只是归档器，跟架构无关）。</text>
<rect x="16" y="232" width="648" height="52" rx="6" fill="#f3f0fa" stroke="#8e7cc3"/>
<text x="30" y="252" font-size="12" font-family="sans-serif" fill="#1f2328">产出物：cfgd_1.0.0_arm64.deb —— 4.4 KB，装完后 /usr/local/bin/cfgd 是一个 ELF aarch64 可执行文件。</text>
<text x="30" y="274" font-size="12" font-family="sans-serif" fill="#1f2328">实测环境：WSL Ubuntu 22.04.5 LTS（x86_64），gcc 11.4.0，CMake 3.22.1，dpkg-deb 1.21.1。</text>
</svg>
</div>

## 2. 环境：只需要两行 apt

```bash
$ sudo apt update
$ sudo apt install -y gcc-aarch64-linux-gnu g++-aarch64-linux-gnu \
                      dpkg-dev binutils-aarch64-linux-gnu file qemu-user-static
```

装完先确认工具链真的能产出 aarch64：

```bash
$ aarch64-linux-gnu-gcc -dumpmachine
aarch64-linux-gnu
$ uname -m ; dpkg --print-architecture
x86_64
amd64
```

注意最后两行的落差：**宿主是 amd64，产物是 arm64**——这正是我们后面要用 `Architecture: arm64` 显式声明的原因，链接器不会替你猜。

顺手确认交叉 sysroot 里有 libc（后面 qemu 试跑要用）：

```bash
$ ls /usr/aarch64-linux-gnu/lib/libc.so.6
/usr/aarch64-linux-gnu/lib/libc.so.6
```

## 3. 交叉编译：先拿到一个 aarch64 二进制

示例程序 `cfgd.c`——一个读配置文件的迷你服务：

```c
/* cfgd.c */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define CFGD_VERSION "1.0.0"
#define DEFAULT_CONF "/etc/cfgd/cfgd.conf"

int main(int argc, char **argv)
{
    if (argc > 1 && strcmp(argv[1], "--version") == 0) {
        printf("cfgd %s (%s)\n", CFGD_VERSION,
#ifdef __aarch64__
               "aarch64"
#else
               "x86-64"
#endif
        );
        return 0;
    }

    const char *path = (argc > 1) ? argv[1] : DEFAULT_CONF;
    FILE *fp = fopen(path, "r");
    if (!fp) { fprintf(stderr, "cfgd: cannot open %s\n", path); return 1; }

    char line[256]; int n = 0;
    while (fgets(line, sizeof(line), fp)) {
        char *eq = strchr(line, '=');
        if (!eq || line[0] == '#') continue;
        *eq = '\0';
        char *val = eq + 1;
        val[strcspn(val, "\r\n")] = '\0';
        printf("  %-16s = %s\n", line, val);
        n++;
    }
    fclose(fp);
    printf("cfgd: %d keys loaded from %s\n", n, path);
    return 0;
}
```

两个方向各编一次，对比输出：

```bash
$ aarch64-linux-gnu-gcc -O2 -Wall -o cfgd-arm64 src/cfgd.c
$ file cfgd-arm64
cfgd-arm64: ELF 64-bit LSB pie executable, ARM aarch64, version 1 (SYSV),
dynamically linked, interpreter /lib/ld-linux-aarch64.so.1, ...

$ gcc -O2 -o cfgd-x86 src/cfgd.c
$ file cfgd-x86
cfgd-x86: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV),
dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, ...
```

**`file` 这一行是整条流水线的第一道闸门**：`ARM aarch64` 说明交叉成功。要是这里写着 `x86-64`，后面打成 deb 也白搭——包会在板子上装成功、然后一运行就 `Exec format error`。

### 用 qemu 在打包机上直接跑 arm64 二进制

这一步是我强烈建议加进流程的：**不必等到上板子才知道能不能跑。**

```bash
$ qemu-aarch64-static -L /usr/aarch64-linux-gnu ./cfgd-arm64 --version
cfgd 1.0.0 (aarch64)

$ qemu-aarch64-static -L /usr/aarch64-linux-gnu ./cfgd-arm64 src/cfgd.conf
  listen_port      =  8379
  snapshot_path    =  /var/lib/cfgd/snapshot.json
  log_level        =  info
cfgd: 3 keys loaded from src/cfgd.conf
```

`-L` 指定 arm64 的 sysroot，让动态加载器能找到 aarch64 的 libc。有了它，你可以把"冒烟测试"放在 CI 里，而不是放在板子上。

## 4. deb 解剖：三层结构

<div align="center">
<svg viewBox="0 0 680 340" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="680" height="340" fill="#fbfbfd"/>
<text x="340" y="20" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#333">.deb = ar 归档，里面三个成员</text>
<rect x="240" y="34" width="200" height="34" rx="5" fill="#e6e6ef" stroke="#8e8ea0"/>
<text x="340" y="56" text-anchor="middle" font-size="13" font-family="monospace" fill="#1f2328">cfgd_1.0.0_arm64.deb</text>
<path d="M340 70 L340 84 L150 84 L150 100" stroke="#888" stroke-width="1.6" fill="none" marker-end="url(#d1)"/>
<path d="M340 70 L340 84 L340 100" stroke="#888" stroke-width="1.6" fill="none" marker-end="url(#d1)"/>
<path d="M340 70 L340 84 L530 84 L530 100" stroke="#888" stroke-width="1.6" fill="none" marker-end="url(#d1)"/>
<rect x="40" y="102" width="220" height="30" rx="4" fill="#f3f0fa" stroke="#8e7cc3"/>
<text x="150" y="122" text-anchor="middle" font-size="12" font-family="monospace" fill="#1f2328">debian-binary   "2.0"</text>
<rect x="280" y="102" width="220" height="30" rx="4" fill="#fff4d6" stroke="#e2a03f"/>
<text x="390" y="122" text-anchor="middle" font-size="12" font-family="monospace" fill="#1f2328">control.tar.zst</text>
<rect x="520" y="102" width="120" height="30" rx="4" fill="#e8f0fe" stroke="#7f9cf5"/>
<text x="580" y="122" text-anchor="middle" font-size="12" font-family="monospace" fill="#1f2328">data.tar.zst</text>
<rect x="280" y="138" width="220" height="150" rx="4" fill="#fffaf0" stroke="#e2a03f"/>
<text x="390" y="156" text-anchor="middle" font-size="11.5" font-family="sans-serif" fill="#a06a10">元数据（装之前读）</text>
<text x="292" y="176" font-size="11.5" font-family="monospace" fill="#1f2328">control   Package/Version/</text>
<text x="292" y="192" font-size="11.5" font-family="monospace" fill="#e5484d">          Architecture: arm64</text>
<text x="292" y="208" font-size="11.5" font-family="monospace" fill="#1f2328">          Depends/Maintainer</text>
<text x="292" y="226" font-size="11.5" font-family="monospace" fill="#1f2328">md5sums   文件校验和</text>
<text x="292" y="244" font-size="11.5" font-family="monospace" fill="#1f2328">conffiles 升级时不覆盖的配置</text>
<text x="292" y="262" font-size="11.5" font-family="monospace" fill="#1f2328">postinst  安装后脚本</text>
<text x="292" y="278" font-size="11.5" font-family="monospace" fill="#1f2328">prerm     卸载前脚本</text>
<rect x="520" y="138" width="120" height="150" rx="4" fill="#f4f8ff" stroke="#7f9cf5"/>
<text x="580" y="156" text-anchor="middle" font-size="11.5" font-family="sans-serif" fill="#3b5bdb">安装内容</text>
<text x="530" y="178" font-size="11" font-family="monospace" fill="#1f2328">usr/local/bin/</text>
<text x="530" y="194" font-size="11" font-family="monospace" fill="#1f2328">etc/cfgd/</text>
<text x="530" y="210" font-size="11" font-family="monospace" fill="#1f2328">lib/systemd/</text>
<text x="530" y="226" font-size="11" font-family="monospace" fill="#1f2328">usr/share/doc/</text>
<text x="530" y="252" font-size="11" font-family="sans-serif" fill="#555">路径是相对根</text>
<text x="530" y="268" font-size="11" font-family="sans-serif" fill="#555">的，不带前导</text>
<text x="530" y="278" font-size="11" font-family="sans-serif" fill="#555">斜杠前缀 /</text>
<rect x="40" y="138" width="220" height="150" rx="4" fill="#f7f5fb" stroke="#8e7cc3"/>
<text x="150" y="158" text-anchor="middle" font-size="11.5" font-family="sans-serif" fill="#6b4fa0">格式版本号</text>
<text x="150" y="180" text-anchor="middle" font-size="11.5" font-family="sans-serif" fill="#555">从 1990 年代起</text>
<text x="150" y="198" text-anchor="middle" font-size="11.5" font-family="sans-serif" fill="#555">就一直是 2.0</text>
<text x="150" y="222" text-anchor="middle" font-size="11.5" font-family="sans-serif" fill="#555">压缩格式取决于</text>
<text x="150" y="238" text-anchor="middle" font-size="11.5" font-family="sans-serif" fill="#555">dpkg 版本：</text>
<text x="150" y="256" text-anchor="middle" font-size="11.5" font-family="monospace" fill="#1f2328">Ubuntu 22.04 → zst</text>
<text x="150" y="274" text-anchor="middle" font-size="11.5" font-family="monospace" fill="#1f2328">Ubuntu 18.04 → xz</text>
<rect x="40" y="300" width="600" height="30" rx="4" fill="#fde8e8" stroke="#e5484d"/>
<text x="54" y="319" font-size="11.5" font-family="sans-serif" fill="#1f2328">注意：data.tar 里的路径写成 usr/local/bin/...，展开后就是 /usr/local/bin/... —— 千万别写成 /usr/local（会变成 /usr/usr/local）。</text>
<defs><marker id="d1" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="#888"/></marker></defs>
</svg>
</div>

`control` 是唯一必填的元数据文件：

```
Package: cfgd
Version: 1.0.0
Section: utils
Priority: optional
Architecture: arm64
Depends: libc6 (>= 2.34)
Maintainer: Hespethorn <hespethorn@example.com>
Description: Tiny config service (arm64 build)
 cfgd reads /etc/cfgd/cfgd.conf and prints the parsed key/value pairs.
 .
 This package is cross-built with aarch64-linux-gnu-gcc on Windows/WSL
 and is meant to be installed on aarch64 boards such as Rockchip RK3588.
```

几个字段的讲究：

| 字段 | 值 | 说错会怎样 |
| --- | --- | --- |
| `Architecture` | `arm64` | 写 `amd64` 板子直接拒装；写 `all` 只适用于纯脚本/数据 |
| `Version` | `1.0.0` 或 `1.0.0-1` | 后半段 `-1` 是 Debian 修订号，同版本改打包方式时要涨 |
| `Depends` | `libc6 (>= 2.34)` | 交叉编译时 dpkg 不会自动分析，得自己按目标 rootfs 的 glibc 版本写 |
| `Description` | 首行摘要 + 缩进行 | 缩进行必须以**一个空格**起头；空行写 `.` + 空格 |

维护者脚本的调用时机（脚本放在 `DEBIAN/` 下，**权限必须是 0755**）：

| 脚本 | 时机 | 典型用途 |
| --- | --- | --- |
| `preinst` | 解包前 | 停止旧服务、创建用户 |
| `postinst` | 解包后 | `systemctl daemon-reload`、enable 服务 |
| `prerm` | 删文件前 | 停服务 |
| `postrm` | 删文件后 | 清理运行时目录 |

## 5. 手工打包：dpkg-deb --build

先把"要装进根文件系统的东西"摆成一棵树：

```bash
pkgroot/
├── DEBIAN/
│   ├── control
│   ├── conffiles
│   ├── postinst          # 0755
│   └── prerm             # 0755
├── etc/cfgd/cfgd.conf
├── lib/systemd/system/cfgd.service
└── usr/local/bin/cfgd    # 交叉编译出来的 arm64 二进制
```

`postinst` 示例（创建系统用户、注册 systemd 服务）：

```sh
#!/bin/sh
set -e

case "$1" in
    configure)
        if ! id -u cfgd >/dev/null 2>&1; then
            adduser --system --group --no-create-home --quiet cfgd
        fi
        install -d -o cfgd -g cfgd /var/lib/cfgd
        if [ -d /run/systemd/system ]; then
            systemctl daemon-reload || true
            systemctl enable --now cfgd.service || true
        fi
        ;;
    abort-upgrade|abort-remove|abort-deconfigure)
        ;;
    *)
        echo "postinst called with unknown argument '$1'" >&2
        exit 1
        ;;
esac

#DEBHELPER#
exit 0
```

然后一行打包：

```bash
$ dpkg-deb --build --root-owner-group pkgroot cfgd_1.0.0_arm64.deb
dpkg-deb: building package 'cfgd' in 'cfgd_1.0.0_arm64.deb'.
$ ls -l cfgd_1.0.0_arm64.deb
-rw-r--r-- 1 hespethorn hespethorn 4400 Sep 14 13:44 cfgd_1.0.0_arm64.deb
```

`--root-owner-group` 是必加的：不加的话包内文件属主会变成你自己的账户。实测对比：

```bash
$ dpkg-deb --build pkgroot /tmp/noroot.deb          # 故意不加该参数
$ dpkg-deb -c /tmp/noroot.deb | grep bin/cfgd
-rwxr-xr-x hespethorn/hespethorn 13424 ... ./usr/local/bin/cfgd
                    ^^^^^^^^^^^^^^^^^^^ 应该是 root/root
```

验收三连：

```bash
$ ar t cfgd_1.0.0_arm64.deb
debian-binary
control.tar.zst
data.tar.zst

$ dpkg-deb -I cfgd_1.0.0_arm64.deb
 new Debian package, version 2.0.
 size 4400 bytes: control archive=799 bytes.
      20 bytes,     1 lines      conffiles
     421 bytes,    12 lines      control
     566 bytes,    24 lines   *  postinst             #!/bin/sh
     376 bytes,    20 lines   *  prerm                #!/bin/sh
 Package: cfgd
 Version: 1.0.0
 Architecture: arm64
 Depends: libc6 (>= 2.34)
 ...

$ dpkg-deb -c cfgd_1.0.0_arm64.deb
drwxr-xr-x root/root         0 ... ./etc/cfgd/
-rwxr-xr-x root/root       108 ... ./etc/cfgd/cfgd.conf
drwxr-xr-x root/root         0 ... ./lib/systemd/system/
-rwxr-xr-x root/root       197 ... ./lib/systemd/system/cfgd.service
-rwxr-xr-x root/root     13424 ... ./usr/local/bin/cfgd
```

## 6. 五个必踩的坑（全部本机实测）

### 坑 1：在 `/mnt/c` 下准备包树 —— dpkg-deb 直接拒绝

这是 Windows 场景独有的坑。`/mnt/c` 是 drvfs，**没有 Unix 权限位**，所有文件一律 0777：

```bash
$ find /mnt/c/.../winfs -printf "%M %u:%g %p\n"
-rwxrwxrwx hespethorn:hespethorn .../winfs/DEBIAN/control
-rwxrwxrwx hespethorn:hespethorn .../winfs/usr/local/bin/cfgd
drwxrwxrwx hespethorn:hespethorn .../winfs/DEBIAN

$ dpkg-deb --build --root-owner-group /mnt/c/.../winfs /tmp/winfs.deb
dpkg-deb: error: control directory has bad permissions 777 (must be >=0755 and <=0775)
```

**结论：包树必须在 WSL 的 ext4 分区里搭（`~/`、`/tmp` 都行），绝不能放在 `/mnt/c`、`/mnt/d`。** 可以源码放 Windows 侧（用 VS Code 编辑方便），构建脚本负责 `cp -r` 到 `~/` 再 `chmod`——但**这一步必须做**。

### 坑 2：CRLF 换行 —— 脚本变成 `/bin/sh^M`

Windows 编辑器保存的 `postinst`，行尾是 `\r\n`。在 Linux 上执行：

```bash
$ ./postinst configure
bash: ./postinst: /bin/sh^M: bad interpreter: No such file or directory

$ sh ./postinst configure
postinst: 4: Syntax error: word unexpected (expecting "in")
```

`\r` 混进了 `case ... in`，连语法检查 `sh -n` 都可能放它过关（实测 `sh -n` 返回 0），**只有真跑才炸**。三道防线：

```bash
# ① 编辑器/仓库层面：给 Git 配置自动转换
git config core.autocrlf input

# ② 构建脚本里兜底清洗
sed -i 's/\r$//' pkgroot/DEBIAN/*

# ③ CI 里加断言，有问题直接失败
file pkgroot/DEBIAN/postinst | grep -q CRLF && { echo "CRLF detected"; exit 1; }
```

### 坑 3：`Architecture` 写成 amd64

忘了改这一行，包能打出来、能 scp 到板子，但装的时候：

```bash
$ dpkg -i cfgd_1.0.0_arm64.deb
dpkg: error processing archive cfgd_1.0.0_arm64.deb (--install):
 package architecture (arm64) does not match system (amd64)
```

上面这段是我在 amd64 的 WSL 上装 arm64 包时的真实报错——**反过来看，它恰好证明我们的 `Architecture: arm64` 是对的**：同一条命令，在 arm64 板子上就会顺顺利利地装进去。

### 坑 4：依赖声明靠猜

交叉编译环境下 `dpkg-shlibdeps` 无从分析 arm64 二进制（它需要目标架构的库文件与符号表）。要么老老实实手写 `Depends`，要么先把 arm64 库挂进来：

```bash
$ sudo dpkg --add-architecture arm64
$ sudo apt update
$ sudo apt install -y libc6:arm64 libstdc++6:arm64
$ dpkg-shlibdeps -e ./usr/local/bin/cfgd ...   # 这时才能自动分析
```

更省事的做法：打完包用 `apt install ./xxx.deb`（而不是 `dpkg -i`），让 apt 自己去补依赖。

### 坑 5：postinst 里无脑调 systemctl

在 chroot、容器、CI 里做包测试时，`systemctl` 一定失败。标准写法是先探测：

```sh
if [ -d /run/systemd/system ]; then      # 只有真 systemd 在跑才执行
    systemctl daemon-reload || true
    systemctl enable --now cfgd.service || true
fi
```

注意每个 `systemctl` 后面的 `|| true`——**维护者脚本非 0 退出会导致整个包进入 `half-configured` 状态**，比服务没起来更难收拾。

## 7. 工程化：CMake + CPack 一条命令出包

手工摆树适合一次性打包，长期维护还是交给 CPack。先写工具链文件：

```cmake
# toolchain-aarch64.cmake
set(CMAKE_SYSTEM_NAME Linux)
set(CMAKE_SYSTEM_PROCESSOR aarch64)

set(TRIPLE aarch64-linux-gnu)
set(CMAKE_C_COMPILER   /usr/bin/${TRIPLE}-gcc)
set(CMAKE_CXX_COMPILER /usr/bin/${TRIPLE}-g++)

set(CMAKE_FIND_ROOT_PATH /usr/${TRIPLE})
set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)   # 程序用宿主的
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)    # 库只找目标架构的
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
```

`CMakeLists.txt` 里的打包段：

```cmake
set(CPACK_GENERATOR "DEB")
set(CPACK_PACKAGE_NAME "cfgd")
set(CPACK_PACKAGE_CONTACT "Hespethorn <hespethorn@example.com>")

# 不加这行，CPack 会自作主张加 /usr 前缀，包里出现 ./usr/usr/local/bin
set(CPACK_PACKAGING_INSTALL_PREFIX "/")

set(CPACK_DEBIAN_PACKAGE_ARCHITECTURE "arm64")   # <-- 整件事的核心
set(CPACK_DEBIAN_FILE_NAME "DEB-DEFAULT")        # cfgd_1.0.0_arm64.deb
set(CPACK_DEBIAN_PACKAGE_DEPENDS "libc6 (>= 2.34)")
set(CPACK_DEBIAN_PACKAGE_SHLIBDEPS OFF)          # 交叉编译时必须关
set(CPACK_DEBIAN_PACKAGE_CONTROL_EXTRA
    "${CMAKE_CURRENT_SOURCE_DIR}/debian/postinst;\
${CMAKE_CURRENT_SOURCE_DIR}/debian/prerm;\
${CMAKE_CURRENT_SOURCE_DIR}/debian/conffiles")
include(CPack)
```

跑起来：

```bash
$ cmake ../src -DCMAKE_TOOLCHAIN_FILE=../src/toolchain-aarch64.cmake
-- Configuring done
-- Generating done
$ make
[100%] Built target cfgd
$ cpack -G DEB
CPack: Create package using DEB
CPack: - package: /home/hespethorn/deb-demo/build/cfgd_1.0.0_arm64.deb generated.
```

**两个 CPack 专属坑，我都踩到了：**

**坑 A：`/usr/usr/local/bin`。** CPack 的默认 `CPACK_PACKAGING_INSTALL_PREFIX` 是 `/usr`，而 `install(DESTINATION usr/local/bin)` 是相对路径，两者叠起来就成双前缀。实测第一次打出来的包：

```bash
$ dpkg-deb -c cfgd_1.0.0_arm64.deb
-rw-r--r-- root/root   108 ... ./usr/etc/cfgd/cfgd.conf
-rwxr-xr-x root/root 13392 ... ./usr/usr/local/bin/cfgd     <-- 错了！
```

加上 `set(CPACK_PACKAGING_INSTALL_PREFIX "/")` 后恢复正确：

```bash
-rw-r--r-- root/root   108 ... ./etc/cfgd/cfgd.conf
drwxr-xr-x root/root     0 ... ./lib/systemd/system/
-rwxr-xr-x root/root 13392 ... ./usr/local/bin/cfgd          <-- 对了
```

**坑 B：`CPACK_DEBIAN_PACKAGE_CONFFILES` 不生效。** 在 CMake 3.22 上设了这个变量，`conffiles` 依然没进包（`dpkg-deb -I` 里根本没这一项）。正确做法是**把 `conffiles` 文件塞进 `CPACK_DEBIAN_PACKAGE_CONTROL_EXTRA` 列表**：

```bash
$ dpkg-deb -I cfgd_1.0.0_arm64.deb | head -8
 new Debian package, version 2.0.
 size 4624 bytes: control archive=840 bytes.
      20 bytes,     1 lines      conffiles        <-- 进来了
     255 bytes,    10 lines      control
     172 bytes,     3 lines      md5sums
     566 bytes,    24 lines   *  postinst             #!/bin/sh
     376 bytes,    20 lines   *  prerm                #!/bin/sh
```

最后，从包里把二进制解出来再跑一遍——**验证的是最终的交付物，不是编译目录里的临时文件**：

```bash
$ rm -rf /tmp/x && mkdir /tmp/x && dpkg-deb -x cfgd_1.0.0_arm64.deb /tmp/x
$ qemu-aarch64-static -L /usr/aarch64-linux-gnu /tmp/x/usr/local/bin/cfgd --version
cfgd 1.0.0 (aarch64)
```

<div align="center">
<svg viewBox="0 0 680 250" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="680" height="250" fill="#fbfbfd"/>
<text x="340" y="20" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#333">完整流水线：每一步都有可自动化的检查点</text>
<rect x="14" y="40" width="118" height="46" rx="5" fill="#e8f0fe" stroke="#7f9cf5"/>
<text x="73" y="60" text-anchor="middle" font-size="12" font-family="sans-serif" fill="#1f2328">源码（Windows）</text>
<text x="73" y="76" text-anchor="middle" font-size="11" font-family="monospace" fill="#555">D:\...\src</text>
<path d="M136 63 L164 63" stroke="#888" stroke-width="1.8" marker-end="url(#e1)"/>
<rect x="168" y="40" width="118" height="46" rx="5" fill="#fff4d6" stroke="#e2a03f"/>
<text x="227" y="60" text-anchor="middle" font-size="12" font-family="sans-serif" fill="#1f2328">cp 到 ext4</text>
<text x="227" y="76" text-anchor="middle" font-size="11" font-family="monospace" fill="#555">~/deb-demo</text>
<path d="M290 63 L318 63" stroke="#888" stroke-width="1.8" marker-end="url(#e1)"/>
<rect x="322" y="40" width="118" height="46" rx="5" fill="#f3f0fa" stroke="#8e7cc3"/>
<text x="381" y="60" text-anchor="middle" font-size="12" font-family="sans-serif" fill="#1f2328">交叉编译</text>
<text x="381" y="76" text-anchor="middle" font-size="11" font-family="monospace" fill="#555">aarch64-gcc</text>
<path d="M444 63 L472 63" stroke="#888" stroke-width="1.8" marker-end="url(#e1)"/>
<rect x="476" y="40" width="104" height="46" rx="5" fill="#e8f0fe" stroke="#7f9cf5"/>
<text x="528" y="60" text-anchor="middle" font-size="12" font-family="sans-serif" fill="#1f2328">cpack -G DEB</text>
<text x="528" y="76" text-anchor="middle" font-size="11" font-family="monospace" fill="#555">_arm64.deb</text>
<path d="M584 63 L612 63" stroke="#888" stroke-width="1.8" marker-end="url(#e1)"/>
<rect x="616" y="40" width="50" height="46" rx="5" fill="#e6f6ea" stroke="#30a46c"/>
<text x="641" y="60" text-anchor="middle" font-size="12" font-family="sans-serif" fill="#1f2328">板子</text>
<text x="641" y="76" text-anchor="middle" font-size="11" font-family="monospace" fill="#555">RK3588</text>
<rect x="14" y="104" width="652" height="34" rx="4" fill="#e6f6ea" stroke="#30a46c"/>
<text x="28" y="125" font-size="11.5" font-family="sans-serif" fill="#1f2328">检查点 1：file 输出必须是 "ARM aarch64"  ·  检查点 2：file 不得含 CRLF  ·  检查点 3：dpkg-deb -I 里 Architecture: arm64</text>
<rect x="14" y="144" width="652" height="34" rx="4" fill="#e6f6ea" stroke="#30a46c"/>
<text x="28" y="165" font-size="11.5" font-family="sans-serif" fill="#1f2328">检查点 4：dpkg-deb -c 里没有 ./usr/usr 双前缀  ·  检查点 5：qemu-aarch64-static 能从包里解出的二进制跑通</text>
<rect x="14" y="184" width="316" height="50" rx="5" fill="#fde8e8" stroke="#e5484d"/>
<text x="28" y="203" font-size="11.5" font-family="sans-serif" fill="#1f2328">红线：包树不能放 /mnt/c（权限 777 直接失败）</text>
<text x="28" y="222" font-size="11.5" font-family="sans-serif" fill="#1f2328">红线：脚本必须 0755，且必须是 LF 换行</text>
<rect x="350" y="184" width="316" height="50" rx="5" fill="#fff4d6" stroke="#e2a03f"/>
<text x="364" y="203" font-size="11.5" font-family="sans-serif" fill="#1f2328">交付：scp 到板子后用 apt install ./x.deb（apt 会补依赖，</text>
<text x="364" y="222" font-size="11.5" font-family="sans-serif" fill="#1f2328">dpkg -i 不会）· 回滚用 apt remove / purge</text>
<defs><marker id="e1" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="#888"/></marker></defs>
</svg>
</div>

## 8. 到板子上：安装、验证、回滚

```bash
# 1) 传过去
$ scp cfgd_1.0.0_arm64.deb user@rk3588:/tmp/

# 2) 先确认板子确实是 arm64
$ ssh user@rk3588 'dpkg --print-architecture; uname -m'
arm64
aarch64

# 3) 安装 —— 用 apt 而不是 dpkg，apt 会自动补依赖
$ ssh user@rk3588 'sudo apt install -y /tmp/cfgd_1.0.0_arm64.deb'
```

验证：

```bash
$ ssh user@rk3588 'dpkg -l cfgd'
ii  cfgd   1.0.0   arm64   Tiny config service (arm64 build)

$ ssh user@rk3588 'dpkg -L cfgd'
/usr/local/bin/cfgd
/etc/cfgd/cfgd.conf
/lib/systemd/system/cfgd.service

$ ssh user@rk3588 'cfgd --version'
cfgd 1.0.0 (aarch64)

$ ssh user@rk3588 'systemctl status cfgd --no-pager | head -5'
● cfgd.service - Tiny config service (cfgd)
     Loaded: loaded (/lib/systemd/system/cfgd.service; enabled)
     Active: active (running)
```

回滚与清理：

```bash
$ sudo apt remove cfgd      # 删二进制，保留 /etc 下的配置
$ sudo apt purge cfgd       # 连配置一起删
$ dpkg -s cfgd              # 确认状态（purge 后应为 "not-installed"）
```

要是出现 `Exec format error`，别怀疑 deb 打包——**回去看第 3 节那个 `file` 检查点**，99% 是误把 x86-64 二进制打进了 arm64 包（包照样能装成功，只是跑不起来）。

## 9. 三种打包方式对照

| 维度 | `dpkg-deb --build` | CMake + CPack | `dpkg-buildpackage` |
| --- | --- | --- | --- |
| 上手成本 | 最低，一条命令 | 中，要写 toolchain + CPack 段 | 最高，要 `debian/` 全套 |
| 适合场景 | 一次性交付、救急 | **日常迭代 / CI（推荐）** | 进 Debian/Ubuntu 官方源 |
| 架构控制 | control 里手写 | `CPACK_DEBIAN_PACKAGE_ARCHITECTURE` | `debian/control` + 构建机架构 |
| 依赖分析 | 手写 | 手动或 shlibdeps | 自动（本机架构） |
| 源码包 | 无 | 有（`cpack -G TGZ`） | 有（`.dsc` + `.orig.tar`） |
| 交叉编译友好度 | 好（跟架构无关） | 好（显式声明即可） | 差（默认假定本机架构） |
| 常见翻车点 | /mnt/c 权限、CRLF | `/usr/usr` 双前缀、conffiles 失效 | 需要目标架构的构建依赖 |

## 小结

1. **deb 是归档格式不是编译产物**，所以"在 Windows 上打 arm64 包"这件事只需 WSL + 交叉工具链 + `dpkg-deb`，跟目标机器在不在场无关。
   2. **两条独立的正确性**：二进制要 `file` 确认是 `ARM aarch64`；元数据要 `Architecture: arm64`。少任何一条，都会以不同方式翻车（前者是 `Exec format 																																	error`，后者是 `does not match system`）。
3. **包树必须在 WSL 的 ext4 分区里**，`/mnt/c` 下权限全 0777，`dpkg-deb` 会直接报 `control directory has bad permissions 777`。
4. **脚本要 0755 + LF**。CRLF 会让 `postinst` 变成 `/bin/sh^M: bad interpreter`，而 `sh -n` 语法检查还抓不到它。
5. **CPack 的两个坑**：必须设 `CPACK_PACKAGING_INSTALL_PREFIX "/"` 否则出现 `/usr/usr/local/bin`；`conffiles` 要走 `CONTROL_EXTRA` 而不是 `CPACK_DEBIAN_PACKAGE_CONFFILES`。
6. **交叉编译要关 `SHLIBDEPS`**，依赖手写或从 arm64 rootfs 分析。
7. **用 qemu-user-static 在打包机上跑一遍包里的二进制**——把"能不能跑"这个问题从"上板子之后"提前到"出包之后"，省掉一轮 scp。
8. **装包用 `apt install ./x.deb` 而不是 `dpkg -i`**，前者会自动补依赖；回滚用 `apt remove` / `purge`。
