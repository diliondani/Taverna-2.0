module.exports = {
    content: ['templates/index.gohtml'],
    css: ['public/css/main.css'],
    extractors: [
      {
        extractor: class {
          static extract(content) {
            return content.match(/[A-z0-9-:\/]+/g) || []
          }
        },
        extensions: ['html', 'gohtml', 'js']
      }
    ]
  }