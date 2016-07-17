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
let sqlSetRandomPermissions = fs.readFileSync(path.format({dir: __dirname, base: 'setRandomPermissions.sql'}), 'utf8')

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
