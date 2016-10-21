const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const jsonfile = require('jsonfile')

const syncLogPath = path.join(__dirname, '../.sync.log')
let data
try {
  data = yaml.load(fs.readFileSync(path.join(__dirname, '../data.yml'), 'utf8'))
  
  // normalize data
  data.folders.forEach (f => {
    f.prefix = f.prefix || '/'
    if (f.prefix !== '/') {
      if (!f.prefix.startsWith('/'))
        f.prefix = '/' + f.prefix
      if (!f.prefix.endsWith('/'))
        f.prefix += '/'
    }
  })

  // init Sync Log
  if (!fs.existsSync(syncLogPath)) jsonfile.writeFileSync(syncLogPath, {})
  data._sync = jsonfile.readFileSync(syncLogPath)
} catch (e) {
  console.error('data.yml 数据格式错误。', e)
  process.exit(1)
}

process.stdin.resume()

function exitHandler(err) {
  if (err) console.log(err.stack)
  if (fs.existsSync(syncLogPath)) 
    jsonfile.writeFileSync(syncLogPath, data._sync)
  process.exit()
}

process.on('exit', exitHandler)
process.on('SIGINT', exitHandler)
process.on('uncaughtException', exitHandler)

module.exports = data