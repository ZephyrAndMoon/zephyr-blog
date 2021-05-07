---
title: MacOS下安装nvm
date: 2021-05-07
tags:
 - 安装/配置
categories: 
 - Other
---

## 卸载Node

若电脑已经安装node，需要卸载掉，检查是否安装node。

```
node -v
```

**如果有版本返回，说明电脑已经安装node，此时需要把node卸载掉，若未安装node忽略以下操作。**

1. 依次执行下列命令，卸载node

   ```bash
   sudo npm uninstall npm -g
   sudo rm -rf /usr/local/lib/node /usr/local/lib/node_modules /var/db/receipts/org.nodejs.*
   sudo rm -rf /usr/local/include/node /Users/$USER/.npm
   sudo rm /usr/local/bin/node
   sudo rm /usr/local/share/man/man1/node.1
   sudo rm /usr/local/lib/dtrace/node.d
   ```

2. 验证是否卸载完成

   ```bash
   node  -v
   npm  -v
   ```

>  安装nvm之前要先安装git



<br>

## 安装 NVM

### 通过curl安装

```bash
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash
```



### 通过brew安装

```bash
brew install nvm
```


### 配置`zsh`终端工具全局变量

```bash
# 编辑配置文件
vi ~/.zshrc

# 添加以下语句
export NVM_DIR=~/.nvm
source $(brew --prefix nvm)/nvm.sh

# 重载配置文件
source ~/.zshrc
```

<br>

## **问题**

当前安装 nvm 成功了，但是每次关闭终端后，都需要重新执行 `source .bash_profile` 才能重新使用 nvm 命令，否则提示 `commond not found:nvm`



**解决方法：** 配置 .bash_profile 和 .zshrc

（1）配置 .bash_profile 文件

- 打开.bash_profile文件

  ```bash
  open ~/.bash_profile
  ```

- 添加配置

  ```bash
  export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
  ```

- 保存配置后在终端执行

  ```bash
  source ~/.bash_profile
  ```

（2）配置 .zshrc 文件

- 打开.zshrc文件

  ```bash
  open ~/.zshrc
  ```

- 添加配置

  ```bash
  export NVM_DIR=~/.nvm
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  ```

- 保存配置后在终端执行

  ```bash
  source ~/.zshrc
  ```


<br>

## NVM常用命令

```
nvm version 查看当前的版本
nvm install 安装最新版本nvm
nvm install <version>  安装相应版本
nvm use <version>  切换使用指定的版本node
nvm ls 列出所有版本
nvm current显示当前版本
nvm uninstall <version> 卸载制定的版本
```

