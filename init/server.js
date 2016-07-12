'use strict'

/**
 * Сервер для генерации файла окружения
 */

const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const generate = require('project-name-generator')
const dotenv = require('dotenv')
const Promise = require('bluebird')
const init = require('./init')

let app = express()
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

/**
 * Выдача странички с настройкой с генерацией названия базы данных
 */
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

/**
 * Приём введённой конфигурации, проверка настроек
 * и создание базы данных с дефолтной информацией
 * @param  {Object}   конфигурация окружение в теле запроса
 * @return {File}     Файл с конфигурацией окружения
 */
app.post('*', (req, res) => {
  let env = Object.keys(req.body)
    .filter(key => req.body[key])
    .map(key => key + '=' + req.body[key])
    .join('\n')
  let config = dotenv.parse(env)
  Promise.resolve(config)
    .then(init.checkDirectory)
    .then(init.checkDatabase)
    .then(console.log)
    .then(() => {
      res.send(env)
      res.end()
    })
    .catch(err => {
      console.error(err)
      res.json(err)
    })
})

app.listen(8080)
