Qiniu Drive (Node.js)
---

将七牛云存储作为同步盘，生成外链。

## 截图
![](http://chuyik-github-io.qiniudn.com/others/intro.png?1)

## 特性
- 可定义多个目录作为根目录，绑定不同的 bucket
- 启动应用时，会进行一次增量同步
- 本地文件修改时，会被重新上传
- 本地文件删除时，云端文件会被删除
- 如果待上传的文件是 Markdown 格式，会被转成 html 再一起上传

## 使用方法
1. 执行 `npm i` 安装依赖包
2. 修改 data.yml 文件
3. 执行 `npm start` 命令，启动应用

## 协议
BSD 2-Clause