importScripts('./createChunk.js')
onmessage = async (e) => {
  const { file, CHUNK_SIZE, start, end, uploadedchunks } = e.data
  
  // 当前线程已经处理的切片数计数
  let doneNUmber = 0

  for(let index = start; index < end; index++) {

    // 之前已经上传过的切片
    if (uploadedchunks.includes(index)) {

      doneNUmber++

      postMessage({
        isThreadDone: doneNUmber === (end - start), // 切片任务已经完成
        chunkIndex: index,
        isUploaded: true
      })
      continue
    }

    // 切片成功一个上传一个
    const res = await createChunk(file, index, CHUNK_SIZE)

    doneNUmber++

    // 当计数值等于每个线程分配的切片数时
    // 表示该线程已经完成任务
    if (doneNUmber === (end - start)) {
      res.isThreadDone = true
    }

    postMessage(res)

    // result.push(createChunk(file, index, CHUNK_SIZE))
  }
}