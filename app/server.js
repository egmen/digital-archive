'use strict'

/**
 * Сервер для генерации файла окружения
 */

const express = require('express')
const bodyParser = require('body-parser')
const db = require('./db')
// const Promise = require('bluebird')

let app = express()
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(require('serve-static')(global.NODE_ROOT + '/public'))

/**
 * Приём введённой конфигурации, проверка настроек
 * и создание базы данных с дефолтной информацией
 * @param  {Object}   конфигурация окружение в теле запроса
 * @return {File}     Файл с конфигурацией окружения
 */
app.get('/tree', (req, res) => {
  Promise.resolve()
    .then(db.getTree)
    .then(parseTree)
    .then(result => res.json(result))
    .catch(console.error)
})

app.get('/files', (req, res) => {
  Promise.resolve(req.query.FolderId)
    .then(db.getFiles)
    .then(result => res.json(result))
    .catch(console.error)
})

app.get('/users', (req, res) => {
  Promise.resolve(req.query.FolderId)
    .then(db.getUsers)
    .then(result => res.json(result))
    .catch(console.error)
})

app.listen(3000)

function parseTree (tree) {
  let newTree = {
    root: []
  }
  tree.forEach(item => {
    newTree[item.Id] = {
      ParentId: item.ParentId,
      Name: item.Name,
      Childs: item.Childs
    }
    if (!item.ParentId) newTree.root.push(item.Id)
  })
  return newTree
}
