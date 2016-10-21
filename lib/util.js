const path = require('path')
const fs   = require('fs')
const marked = require('marked')
const ejs  = require('ejs')

const styles = fs.readFileSync(path.join(__dirname, '../assets/index.css'), 'utf8')
const markdownTplPath = path.join(__dirname, '../assets/index.ejs')

// Synchronous highlighting with highlight.js
marked.setOptions({
  gfm: true,
  breaks: true,
  highlight: code => require('highlight.js').highlightAuto(code).value
})

function markdownToHTML (f, override) {
  fs.readFile(f, 'utf8', (err, data) => {
    if (err) return
    let input = path.parse(f)
    let outputPath = path.join(input.dir, input.name + '.html')

    if (!override && fs.existsSync(outputPath)) {
      console.log(`"${input.name}.html" is existed, try not to override.`)
      return
    }
    
    ejs.renderFile(markdownTplPath, {
      title: input.name,
      styles,
      content: marked(data)
    }, {cache: true}, (err, str) => {
      if (err) return console.error(err)
      fs.writeFile(outputPath, str)
    })

  })
}

function getBucketKey ({bucket, dir, prefix}, f) {
  let key = f.slice(f.indexOf(dir) + dir.length)
  key = path.normalize(`${prefix}${key}`)
  return key.startsWith('/') ? key.slice(1) : key
}

module.exports = {
  getBucketKey,
  markdownToHTML
}