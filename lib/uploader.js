const qiniu = require('qiniu')
const watch = require('watch')
const Promise = require('bluebird')
const _       = require('lodash')
const md5File = require('md5-file/promise')
const fs      = require('fs')

const data  = require('./data')
const util  = require('./util')

// 构建bucketmanager对象
var client = new qiniu.rs.Client()

// 构建上传策略函数
function uptoken(bucket, key) {
  return new qiniu.rs.PutPolicy(bucket+":"+key).token()
}

// 构造上传函数
function uploadFile(bucket, key, localFile) {

  let token = uptoken(bucket, key)
  let extra = new qiniu.io.PutExtra()
  return new Promise ((resolve, reject) => {
    qiniu.io.putFile(token, key, localFile, extra, (err, ret) => {
      if(!err) {
        // 上传成功， 处理返回值
        // console.log('-- Uploaded: ', ret.hash, ret.key, ret.persistentId)
        let domain = _.find(data.folders, {bucket}).domain
        console.log(`---- Uploaded: http://${domain}/${ret.key}`)
        resolve(ret)
        fs.stat(localFile, (err, stats) => {
          ret.mtime = stats.mtime
          ret.bucket = bucket
          data._sync[localFile] = ret
        })
      } else {
        // 上传失败， 处理返回代码
        console.error('---- Upload error: ', err)
        reject(err)
      }
    })
  })
}

//删除资源
function removeFile(bucket, key) {
  return new Promise ((resolve, reject) => {
    client.remove(bucket, key, (err, ret) => {
      if (!err) {
        console.log('---- Deleted: ', ret)
        resolve(ret)
      } else {
        console.log('---- Failed to delete: ', err)
        reject(err)
      }
    })
  })
}

function batchSync (folders) {
  let walk = Promise.promisify(watch.walk)
  let promises = []
  folders.forEach(folder => {
    let {bucket, dir} = folder

    walk(dir, data.watchOption)
      .then(files => {
        let filePaths = []
        let uploadCount = 0, ignoredCount = 0
        _.forIn(files, (stat, f) => {
          if (stat.isDirectory())
            return
          if (!isUploaded(f, stat.mtime.toISOString(), bucket)) {
            filePaths.push(f)
            uploadCount += 1
          } else {
            ignoredCount += 1
          }
        })
        console.log(`-- ${uploadCount} files uploading, ${ignoredCount} files passed.`)
        promises.push(Promise.map(filePaths, f => {
          let key = util.getBucketKey(bucket, dir, f)
          return uploadFile(bucket, key, f)
        }))
      })
  })
  return Promise.all(promises)
}

// 判断文件修改日期，如果相同则不上传
function isUploaded (localFile, mtime, bucket) {
  let syncInfo = data._sync[localFile]
  return syncInfo && syncInfo.mtime === mtime 
    && syncInfo.bucket === bucket
}

module.exports = {
  uploadFile,
  removeFile,
  batchSync
}