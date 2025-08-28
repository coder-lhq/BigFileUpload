const express = require('express')

const fileRoutes = require('./file')

const app = express()

const port = 3000

// 设置静态资源目录
app.use(express.static(__dirname))

// 处理请求的 json 数据
app.use(express.json())

app.get('/', (req, res) => {
  res.redirect('./index.html')
})

app.use('/file', fileRoutes)

app.listen(port, () => {
  console.log('服务已启动，请访问：http://localhost:3000');
})