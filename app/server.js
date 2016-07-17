'use strict'

/**
 * Сервер для генерации файла окружения
 */

const express = require('express')
const bodyParser = require('body-parser')
const db = require('./db')
const Promise = require('bluebird')

const app = express()
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(require('serve-static')(global.NODE_ROOT + '/public'))
app.disable('etag')

/**
 * Запрос дерева папок по имени пользователя
 * отдаются только доступные для чтения
 */
app.get('/tree', (req, res) => {
  Promise.resolve(req.query.user)
    .then(db.getTree)
    .then(parseTree)
    .then(result => res.json(result))
    .catch(console.error)
})

/**
 * Список файлов конкретной директории
 */
app.get('/files', (req, res) => {
  Promise.resolve(req.query.FolderId)
    .then(db.getFiles)
    .then(result => res.json(result))
    .catch(console.error)
})

/**
 * Полный список пользователей для выпадающего меню
 */
app.get('/users', (req, res) => {
  Promise.resolve()
    .then(db.getUsers)
    .then(result => res.json(result))
    .catch(console.error)
})

/**
 * Установка случайных разрешений на все папки и файлы
 */
app.post('/randomPermissions', (req, res) => {
  Promise.resolve()
    .then(db.setRandomPermissions)
    .then(result => res.json(result))
    .catch(console.error)
})

/**
 * Получение списка возомжных разрешений
 */
app.get('/permissionsList', (req, res) => {
  Promise.resolve()
    .then(db.getPermissionsList)
    .then(result => res.json(result))
    .catch(console.error)
})

/**
 * Получение всех разрешений которые висят на папке
 */
app.get('/folderPermissions', (req, res) => {
  Promise.resolve(req.query.FolderId)
    .then(db.getFolderPermissions)
    .then(result => res.json(result))
    .catch(console.error)
})

/**
 * Переключение/добавление разрешений
 */
app.post('/togglePermission', (req, res) => {
  Promise.resolve(req.query)
    .then(db.togglePermission)
    .then(result => res.json(result))
    .catch(console.error)
})

/**
 * Удаление разрешения
 */
app.post('/deletePermission', (req, res) => {
  Promise.resolve(req.query)
    .then(db.deletePermission)
    .then(result => res.json(result))
    .catch(console.error)
})

/**
 * Заполнение таблиц списком файлов и папок
 */
app.post('/addDirectory', (req, res) => {
  Promise.resolve(req.query)
    .then(db.fillTables)
    .then(result => res.json(result))
    .catch(console.error)
})

/**
 * При любой непонятке отдавай index.html (вдруг это react-router развлекается)
 */
app.use((req, res) => {
  return res.sendFile(global.NODE_ROOT + '/public/index.html')
})

console.log('Server listening 3000 port')
app.listen(3000)

/**
 * Подготовка дерева папок для фронта и определение root папок
 * @param  {Array} tree Дерево папок от SQL-запроса
 * @return {Object}     Дерево папок как объект
 */
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
