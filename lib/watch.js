const watch = require('watch')
const fs = require('fs')
const _  = require('lodash')

const uploader = require('./uploader')
const util = require('./util')
const data = require('./data')

function init (folders, option) {
  return new Watcher(folders, option)
}

class Watcher {
  constructor(folders, option) {
    this.folders = folders
    this.folders.forEach(folder => this.watchFiles(folder.dir, option))
  }

  watchFiles (dir, option) {
    console.log('-- Watching dir: ', dir)
    
    return watch.createMonitor(dir, option, monitor => {
      monitor.on("created", this.fileCreated.bind(this))
      monitor.on("changed", this.fileChanged.bind(this))
      monitor.on("removed", this.fileRemoved.bind(this))
    })
  }

  getBucketPath (f) {
    let {bucket, dir} = _.find(this.folders, folder => f.startsWith(folder.dir))
    return {bucket, key: util.getBucketKey(bucket, dir, f)}
  }

  fileCreated (f, stat) {
    if (stat.isDirectory())
      return
    console.log('---- File created: ', f)
    let {bucket, key} = this.getBucketPath(f)
    console.log(`-- bucket: ${bucket}, key: ${key}`)
    uploader.uploadFile(bucket, key, f)
  }

  fileChanged (f, stat, prevStat) {
    if (stat.isDirectory())
      return
    console.log('---- File changed: ', f)
    let {bucket, key} = this.getBucketPath(f)
    console.log(`-- bucket: ${bucket}, key: ${key}`)
    uploader.uploadFile(bucket, key, f)
  }

  fileRemoved (f, stat) {
    if (stat.isDirectory())
      return
    console.log('---- File removed: ', f)
    let {bucket, key} = this.getBucketPath(f)
    console.log(`-- bucket: ${bucket}, key: ${key}`)
    uploader.removeFile(bucket, key)
  }
}



module.exports = {
  init
}