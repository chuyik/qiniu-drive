const watch = require('watch')
const fs    = require('fs')
const _     = require('lodash')
const colors  = require('colors')
const path  = require('path')

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
    console.log(`-- ${'Watching dir'.green}: `, dir.underline.blue)
    
    return watch.createMonitor(dir, option, monitor => {
      monitor.on("created", this.fileCreated.bind(this))
      monitor.on("changed", this.fileChanged.bind(this))
      monitor.on("removed", this.fileRemoved.bind(this))
    })
  }

  getBucketPath (f) {
    let folder = _.find(this.folders, folder => f.startsWith(folder.dir))
    return {bucket: folder.bucket, key: util.getBucketKey(folder, f)}
  }

  uploadFile (f, stat, isNew) {
    if (stat.isDirectory()) return
    if (_.includes(['.markdown', '.md'], path.extname(f))) {
      util.markdownToHTML(f, !isNew)
    }
    let {bucket, key} = this.getBucketPath(f)
    uploader.uploadFile(bucket, key, f)
  }

  fileCreated (f, stat) {
    console.log(`-- ${'File created'.green}: `, f.underline.blue)
    this.uploadFile(f, stat, true)
  }

  fileChanged (f, stat, prevStat) {
    console.log(`-- ${'File changed'.green}: `, f.underline.blue)
    this.uploadFile(f, stat, false)
  }

  fileRemoved (f, stat) {
    if (stat.isDirectory()) return
    console.log(`-- ${'File removed'.green}: `, f.underline.blue)
    let {bucket, key} = this.getBucketPath(f)
    uploader.removeFile(bucket, key)
  }
}



module.exports = {
  init
}