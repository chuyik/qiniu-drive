const data = require('./lib/data')
 
require('./lib/qiniu').init(data.qiniu)
require('./lib/uploader').batchSync(data.folders)
require('./lib/watch').init(data.folders, data.watchOption)