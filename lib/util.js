function getBucketKey (bucket, dir, f) {
  let key = f.slice(f.indexOf(dir) + dir.length)
  return key.startsWith('/') ? key.slice(1) : key
}

module.exports = {
  getBucketKey
}