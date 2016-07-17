'use strict'
/**
 * Для работы с базой данных
 */

const Promise = require('bluebird')
const pg = require('pg')
let db
const fs = require('fs')
const path = require('path')
const uuid = require('node-uuid')
let sqlGetTree = fs.readFileSync(path.format({dir: __dirname, base: 'getTree.sql'}), 'utf8')
let sqlGetFiles = fs.readFileSync(path.format({dir: __dirname, base: 'getFiles.sql'}), 'utf8')
let sqlGetFolderPermissions = fs.readFileSync(path.format({dir: __dirname, base: 'getFolderPermissions.sql'}), 'utf8')
let sqlSetRandomPermissions = fs.readFileSync(path.format({dir: __dirname, base: 'setRandomPermissions.sql'}), 'utf8')
let sqlTogglePermission = fs.readFileSync(path.format({dir: __dirname, base: 'togglePermission.sql'}), 'utf8')
let sqlAddPermission = fs.readFileSync(path.format({dir: __dirname, base: 'addPermission.sql'}), 'utf8')
let sqlAddFiles = fs.readFileSync(path.format({dir: __dirname, base: 'addFiles.sql'}), 'utf8')
let sqlAddFolder = fs.readFileSync(path.format({dir: __dirname, base: 'addFolder.sql'}), 'utf8')

/**
 * Подключение к базе данных
 * @param  {Object} config конфигурация окружения
 * @return {Object}        подключение к PostgreSql
 */
function connectDatabase () {
  let cfg = {
    database: process.env.PGDATABASE
  }
  if (process.env.PGUSER) cfg.user = process.env.PGUSER
  if (process.env.PGPASSWORD) cfg.password = process.env.PGPASSWORD
  if (process.env.PGHOST) cfg.host = process.env.PGHOST
  let client = new pg.Client(cfg)
  client.connect(err => {
    if (err) return console.error(err)
    db = client
  })
}
connectDatabase()

/**
 * Дерево папок
 * @param  {String} login Логин пользователя
 * @return {Array}       Список папок, доступных для чтения пользователем
 */
module.exports.getTree = (login) => {
  return new Promise((resolve, reject) => {
    db.query(sqlGetTree, [login], (err, result) => {
      if (err) return reject(err)
      resolve(result.rows)
    })
  })
}

/**
 * Список файлов
 * @param  {Uuid} FolderId Id папки
 * @return {Array}          Список файлов
 */
module.exports.getFiles = (FolderId) => {
  return new Promise((resolve, reject) => {
    db.query(sqlGetFiles, [FolderId], (err, result) => {
      if (err) return reject(err)
      resolve(result.rows)
    })
  })
}

/**
 * Получение всех разрешений которые висят на папке
 * @param  {Uuid} FolderId Id папки
 * @return {Array}          Список разрешений
 */
module.exports.getFolderPermissions = (FolderId) => {
  return new Promise((resolve, reject) => {
    db.query(sqlGetFolderPermissions, [FolderId], (err, result) => {
      if (err) return reject(err)
      resolve(result.rows)
    })
  })
}

/**
 * Получение списка пользователей
 * @return {Array}          Список пользователей
 */
module.exports.getUsers = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM "users"', (err, result) => {
      if (err) return reject(err)
      resolve(result.rows)
    })
  })
}

/**
 * Получение списка возомжных разрешений
 * @return {Array}          Список разрешений
 */
module.exports.getPermissionsList = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM "permissionTypes"', (err, result) => {
      if (err) return reject(err)
      resolve(result.rows)
    })
  })
}

/**
 * Установка случайных разрешений на все папки и файлы
 * @return {Number} Количество установленных разрешений
 */
module.exports.setRandomPermissions = () => {
  return new Promise((resolve, reject) => {
    db.query(sqlSetRandomPermissions, (err, result) => {
      if (err) return reject(err)
      resolve(result.rows)
    })
  })
}

/**
 * Переключение/добавление разрешений
 * @param  {Object} obj Id объекта, номер разрешения, имя группы/юзера
 */
module.exports.togglePermission = (obj) => {
  return new Promise((resolve, reject) => {
    db.query(sqlTogglePermission, [obj.Id, +obj.PermissionId, obj.Name], (err, result) => {
      // console.log(result.rowCount)
      if (err) return reject(err)
      if (result.rowCount) {
        refreshView(resolve, reject)
      } else {
        db.query(sqlAddPermission, [obj.Id, +obj.PermissionId, obj.Name], (err, result) => {
          // console.log(sqlAddPermission)
          if (err) return reject(err)
          refreshView(resolve, reject)
        })
      }
    })
  })
}

/**
 * Удаление разрешения
 * @param  {Object} obj Id объекта, имя группы/юзера
 */
module.exports.deletePermission = (obj) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM "permissions" WHERE "Id" = $1 AND "Name" = $2;', [obj.Id, obj.Name], (err, result) => {
      // console.log(result.rowCount)
      if (err) return reject(err)
      refreshView(resolve, reject)
    })
  })
}

/**
 * Обновление материализованного представления после обновления разрешений
 */
function refreshView (resolve, reject) {
  db.query('REFRESH MATERIALIZED VIEW "namedPermissions";', (err, result2) => {
    if (err) return reject(err)
    resolve()
  })
}

/**
 * Заполнение таблиц списком файлов и папок
 */
module.exports.fillTables = query => {
  return new Promise((resolve, reject) => {
    let folder = query.folder
    if (folder) {
      Promise.resolve()
        .then(() => readFolder(db, folder))
        .then(() => {
          resolve({msg: 'Обработали'})
        })
    } else {
      resolve({msg: 'Папка не найдена'})
    }
  })
}

/**
 * Парсинг папки с передачей в БД
 * @param  {[type]} client   Подключение к базе данных
 * @param  {[type]} folder   Исследуемая папка
 * @param  {[type]} parentId Id родительской папки
 */
function readFolder (client, folder, parentId) {
  return new Promise((resolve, reject) => {
    let items = fs.readdirSync(folder)
    let FolderId = uuid.v4()
    let name = path.basename(folder)
    client.query(sqlAddFolder, [FolderId, parentId, name, folder], (err, result) => {
      if (err) return reject(err)
      Promise.all(items.map(item => {
        let fn = path.format({dir: folder, base: item})
        let stat = fs.statSync(fn)
        if (stat.isFile()) {
          return {
            Id: uuid.v4(),
            Name: item,
            Size: stat.size,
            Ctime: stat.ctime,
            Type: path.extname(fn)
          }
        } else {
          return readFolder(client, fn, FolderId)
        }
      }))
      .then(items => items.filter(item => item))
      .then(res => {
        let filesJson = JSON.stringify(res)
        client.query(sqlAddFiles, [filesJson, FolderId], (err, result) => {
          if (err) return reject(err)
          resolve()
        })
      })
    })
  })
}
