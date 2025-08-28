


## 后端服务开发
安装依赖：
pnpm install express
处理 formData 的中间件：
pnpm install multer

将 multer 更换为 busboy，因为 multer 无法对文件流进行操作
multer 是基于 busboy 进行封装的




## 优化
前端目前是等全部的线程计算完毕才进行上传操作
b站中的上传的哪些已经计算出来的就先上传，好处是不用等所有的计算完才上传


### 实现并发请求数量限制

- 定义一个数组队列
- 当前并发请求的数量
- 最大的并发请求数量



## 前端文件上传

### 有两种形式：
- 二进制 blob 传输
formData 传输

- base64 传输
转为 base64 传输


相关对象：

可以通过 new File([aasda], 'a.txt') 创建一个 file 实例

- files 通过 input 标签读取过来的文件对象
  参数：
    name 文件名称
    type：文件类型
    size：文件大小
- blob 不可变的二进制内容，包含很多操作
- formData 用于和后端传输的对象
- fileReader 多用于把文件读取为某种形式，如base64，text文本