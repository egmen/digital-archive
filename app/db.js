'use strict'
/**
 * Для работы с базой данных
 */

const Promise = require('bluebird')
const pg = require('pg')
let db
const fs = require('fs')
const path = require('path')
let sqlGetTree = fs.readFileSync(path.format({dir: __dirname, base: 'getTree.sql'}), 'utf8')
let sqlGetFiles = fs.readFileSync(path.format({dir: __dirname, base: 'getFiles.sql'}), 'utf8')
let sqlGetFolderPermissions = fs.readFileSync(path.format({dir: __dirname, base: 'getFolderPermissions.sql'}), 'utf8')
let sqlSetRandomPermissions = fs.readFileSync(path.format({dir: __dirname, base: 'setRandomPermissions.sql'}), 'utf8')
let sqlTogglePermission = fs.readFileSync(path.format({dir: __dirname, base: 'togglePermission.sql'}), 'utf8')
let sqlAddPermission = fs.readFileSync(path.format({dir: __dirname, base: 'addPermission.sql'}), 'utf8')

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

module.exports.getTree = (login) => {
  return new Promise((resolve, reject) => {
    db.query(sqlGetTree, [login], (err, result) => {
      if (err) return reject(err)
      resolve(result.rows)
    })
  })
}

module.exports.getFiles = (FolderId) => {
  return new Promise((resolve, reject) => {
    db.query(sqlGetFiles, [FolderId], (err, result) => {
      if (err) return reject(err)
      resolve(result.rows)
    })
  })
}

module.exports.getFolderPermissions = (FolderId) => {
  return new Promise((resolve, reject) => {
    db.query(sqlGetFolderPermissions, [FolderId], (err, result) => {
      if (err) return reject(err)
      resolve(result.rows)
    })
  })
}

module.exports.getUsers = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM "users"', (err, result) => {
      if (err) return reject(err)
      resolve(result.rows)
    })
  })
}

module.exports.getPermissionsList = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM "permissionTypes"', (err, result) => {
      if (err) return reject(err)
      resolve(result.rows)
    })
  })
}

module.exports.setRandomPermissions = () => {
  return new Promise((resolve, reject) => {
    db.query(sqlSetRandomPermissions, (err, result) => {
      if (err) return reject(err)
      resolve(result.rows)
    })
  })
}

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

function refreshView (resolve, reject) {
  db.query('REFRESH MATERIALIZED VIEW "namedPermissions";', (err, result2) => {
    if (err) return reject(err)
    resolve()
  })
}
