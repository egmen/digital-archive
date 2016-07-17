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
const init = require('./index')

const app = express()
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

/**
 * Выдача странички с настройкой с генерацией названия базы данных
 */
app.get('*', (req, res) => {
  fs.readFile('./init/index.html', 'utf8', (err, content) => {
    if (err) {
      return res.send(err)
    } else {
      const dbName = generate().raw.join('')
      return res.send(content.replace(/{{dbName}}/, dbName))
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
  // Создание файла из объекта конфигурации
  const env = Object.keys(req.body)
    .filter(key => req.body[key])
    .map(key => key + '=' + req.body[key])
    .join('\n')
  const config = dotenv.parse(env)
  // Инициализация
  Promise.resolve(config)
    .then(init.createDatabase)
    .then(init.connectDatabase)
    .then(init.createTables)
    // .then(console.log)
    .then(() => {
      fs.writeFileSync('./.env', env)
      res.redirect('http://localhost:3000')
      process.exit()
    })
    .catch(err => {
      console.error(err)
      res.json(err)
    })
})

console.log('Server listening 8080 port')
app.listen(8080)
