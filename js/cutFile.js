const CHUNK_SIZE = 1204 * 1024 * 5; // 5MB

const THREAD_COUNT = navigator.hardwareConcurrency || 4; // 获取 cpu 个数
// const THREAD_COUNT = 1; // 获取 cpu 个数
/**
 * file 源文件
 * uploadedchunks 已经上传过的文件
 */
export function cutFile(file, uploadedchunks, callback) {

  return new Promise((resolve, reject) => {

    // 将文件进行切片，得到切片总数
    const chunkCount = Math.ceil(file.size / CHUNK_SIZE)

    // 将切片数量除于线程数量，得到每个线程处理多少个切片
    const threadChunkCount = Math.ceil(chunkCount / THREAD_COUNT)
    // // 定义其实位置和结束位置
    for (let index = 0; index < THREAD_COUNT; index++) {

      // 开始
      const start = index * threadChunkCount

      // 结束
      let end = (index + 1) * threadChunkCount

      if (end > chunkCount) end = chunkCount

      // 
      if (start >= end) continue

      // 开启线程
      const worker = new Worker('./js/worker.js')

      worker.onerror = (err) => console.log('worker erroe:::', index, err);

      // 将文件交给 worker 进行文件切片处理
      worker.postMessage({
        file,
        CHUNK_SIZE,
        start,
        end,
        uploadedchunks
      })

      worker.onmessage = (e) => {

        // 完成切片关闭线程
        if (e.data.isThreadDone) {

          worker.terminate()

        }

        callback(e.data, chunkCount)
      }
    }
  })
}