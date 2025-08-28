const express = require('express')

const path = require('path')

const fs = require('fs')

const fsPromise = require('fs').promises

const busboy = require('busboy')

const router = express.Router()

const UPLOAD_DIR = path.join(__dirname, 'uploads')

const { getUnqieFilename, removeDir } = require('./utils')

// 返回已经上传过的 chnkindex
router.get('/getUploadedChunks', (req, res) => {

  const { filename } = req.query

  const chunkDir = path.join(UPLOAD_DIR, `${filename}_CHUNKS_FOLDER_MARK`)

  let uploadedChunks = []

  if (fs.existsSync(chunkDir)) {

    uploadedChunks = fs.readdirSync(chunkDir).map(name => parseInt(name.split('_')[1]))
  }

  res.json(uploadedChunks)
})


router.post('/upload', (req, res) => {

  const bb = busboy({ headers: req.headers })

  let chunkIndex, chunkHash, filename, wirteStream;

  // 监听上传中断的方法啊
  bb.on('aborted', () => {
    // 文件存储路劲
    const chunkDir = path.join(UPLOAD_DIR, `${filename}_CHUNKS_FOLDER_MARK`)

    // 块的存储路径
    const chunkPath = path.join(chunkDir, `chunk_${chunkIndex}`)

    // 关闭写入流，因为这个是写了一部分的流
    wirteStream.end()

    // 删除写了一部分的分片
    fsPromise.unlink(chunkPath)
  })

  bb.on('field', (fieldname, value) => {

    if (fieldname === 'chunkIndex') chunkIndex = value

    if (fieldname === 'chunkHash') chunkHash = value

    if (fieldname === 'filename') filename = value


    if (fieldname === 'chunkBlob' && value === 'undefined') {
      res.status(400).json({msg: '文件切片数据不存在！'})
    }

  })

  bb.on('file', (filedname, file) => {

    const chunkDir = path.join(UPLOAD_DIR, `${filename}_CHUNKS_FOLDER_MARK`)

    // 目录是否存在，不存在则创建，存在的忽略
    fs.mkdir(chunkDir, { recursive: true }, (err) => {

      if (err) return res.status(500).json({ msg: '无法创建文件夹', error: err.message })

      const chunkPath = path.join(chunkDir, `chunk_${chunkIndex}`)

      // 创建写入流,并指定路径
      wirteStream = fs.createWriteStream(chunkPath)

      file.pipe(wirteStream);

      // 写入完成后回调
      wirteStream.on('close', () => {
        res.sendStatus(200)
      })

      // 写入错误时的回调
      wirteStream.on('error', (error) => {
        res.status(500).json({ msg: '保存文件失败', error: error.message })
      })
    })

  })

  // 把可读的文件流传递给 busboy，然后作为一个可写的文件流处理
  req.pipe(bb)

})


router.post('/merge', async (req, res) => {
  const { filename } = req.body
  const chunkDir = path.join(UPLOAD_DIR, `${filename}_CHUNKS_FOLDER_MARK`)

  if (!fs.existsSync(chunkDir)) {
    res.sendStatus(400).json({
      msg: '要合并的文件不存在！'
    })

    return
  }

  // 获取到切片下标数组
  const indexs = fs.readdirSync(chunkDir).map(name => parseInt(name.split('_')[1]))

  // 按顺序排序
  const indexsSort = indexs.sort((a, b) => a - b)

  // 文件名判断，是否已经存在
  const unqieFilename = getUnqieFilename(UPLOAD_DIR, filename)

  // 创建写入流
  const wirteStream = fs.createWriteStream(path.join(UPLOAD_DIR, unqieFilename))

  for (let index = 0; index < indexsSort.length; index++) {

    // 按顺序获取文件路径
    const chunkPath = path.join(chunkDir, `chunk_${index}`)

    // 读取文件
    const chunk = fs.readFileSync(chunkPath)

    // 写入文件
    wirteStream.write(chunk)
  }

  // 关闭写入流
  wirteStream.end()

  // 合并后删除临时创建的文件夹
  await removeDir(chunkDir)
  res.sendStatus(200)

})


module.exports = router