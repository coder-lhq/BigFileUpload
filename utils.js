const path = require('path')
const fs = require('fs')

const fsPrimose = require('fs').promises

function getUnqieFilename(dir, filename) {

  // 获取扩展名
  let ext = path.extname(filename)

  // 获取文件名
  let basename = path.basename(filename, ext)

  let newFilename = filename

  let counter = 1

  // 判断文件名是否存在，如果存在则新建
  while (fs.existsSync(path.join(dir, newFilename))) {

    newFilename = `${basename}${counter}${ext}`

    counter++
  }

  return newFilename

}

// 递归删除目录
async function removeDir(dir) {

  try {
    const files = await fsPrimose.readdir(dir)

    for (const file of files) {

      const filePath = path.join(dir, file)

      const stat = await fsPrimose.lstat(filePath)

      // 判断是不是一个文件夹
      console.log(stat.isDirectory());
      
      if (stat.isDirectory()) {
        // 是则递归删除
        await removeDir(filePath)

      } else {
        // 不是则直接删除
        await fsPrimose.unlink(filePath)

      }
    }

    // 删除最后的目录
    await fsPrimose.rmdir(dir)

  } catch (error) {

    console.log(error);

   }
}

module.exports = {
  getUnqieFilename,
  removeDir
}