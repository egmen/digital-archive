'use strict'

/**
 * Сервер для вывода единственной странички с генерацией настроек
 */

const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const generate = require('project-name-generator')

let app = express()
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.get('*', (req, res) => {
  fs.readFile('./init/index.html', 'utf8', (err, content) => {
    if (err) {
      res.send(err)
    } else {
      let dbName = generate().raw.join('')
      res.send(content.replace(/{{dbName}}/, dbName))
    }
  })
})

app.listen(8080)
