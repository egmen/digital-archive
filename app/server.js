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
  Promise.resolve(req.query.user)
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
  Promise.resolve()
    .then(db.getUsers)
    .then(result => res.json(result))
    .catch(console.error)
})

app.post('/randomPermissions', (req, res) => {
  Promise.resolve()
    .then(db.setRandomPermissions)
    .then(result => res.json(result))
    .catch(console.error)
})

app.get('/permissionsList', (req, res) => {
  Promise.resolve()
    .then(db.getPermissionsList)
    .then(result => res.json(result))
    .catch(console.error)
})

app.get('/folderPermissions', (req, res) => {
  Promise.resolve(req.query.FolderId)
    .then(db.getFolderPermissions)
    .then(result => res.json(result))
    .catch(console.error)
})

app.post('/togglePermission', (req, res) => {
  Promise.resolve(req.query)
    .then(db.togglePermission)
    .then(result => res.json(result))
    .catch(console.error)
})

app.use((req, res) => {
  return res.sendFile(global.NODE_ROOT + '/public/index.html')
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
      Childs: item.Childs,
      Permission: item.Permission,
      permName: item.permName
    }
    if (!item.ParentId) newTree.root.push(item.Id)
  })
  return newTree
}
