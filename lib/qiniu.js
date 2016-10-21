const qiniu = require('qiniu')

function init ({AK, SK}) {
  qiniu.conf.ACCESS_KEY = AK
  qiniu.conf.SECRET_KEY = SK
}

module.exports = {
  init
}