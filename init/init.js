'use strict'

/**
 * Функции проверки конфигурации окружения
 */

const Promise = require('bluebird')
const pg = require('pg')
const fs = require('fs')
const winston = require('winston')
const uuid = require('node-uuid')
const path = require('path')
let sqlAddFiles = fs.readFileSync(path.format({dir: __dirname, base: 'addFiles.sql'}), 'utf8')
let sqlAddFolder = fs.readFileSync(path.format({dir: __dirname, base: 'addFolder.sql'}), 'utf8')
let sqlCreateTables = fs.readFileSync(path.format({dir: __dirname, base: 'init.sql'}), 'utf8')

/**
 * Проверка существования директории окружения
 * откуда беруться первоначальное заполнение базы данных
 * @param  {Object} config конфигурация окружения
 * @return {Object}        конфигурация окружения либо ошибка
 */
module.exports.checkDirectory = config => {
  return new Promise((resolve, reject) => {
    resolve(config)
  })
}

/**
 * Проверка базы данных и создания новой
 * @param  {Object} config конфигурация окружения
 * @return {Object}        конфигурация окружения
 */
module.exports.createDatabase = config => {
  return new Promise((resolve, reject) => {
    let cfg = {
      database: 'postgres'
    }
    if (config.PGUSER) cfg.user = config.PGUSER
    if (config.PGPASSWORD) cfg.password = config.PGPASSWORD
    if (config.PGHOST) cfg.host = config.PGHOST
    let client = new pg.Client(cfg)
    client.connect(err => {
      if (err) return reject(err)
      // Не понял как безопасно подставить переменную в запрос
      // client.query('select 2 as cnt', (err, result) => {
      // client.query('CREATE DATABASE $1', [config.PGDATABASE], (err, result) => {
      client.query('CREATE DATABASE ' + config.PGDATABASE, (err, result) => {
        if (err) return reject(err)
        winston.info('Create database %s SUCCESS: ', config.PGDATABASE)
        resolve(config)
      })
    })
  })
}

/**
 * Подключение к базе данных
 * @param  {Object} config конфигурация окружения
 * @return {Object}        подключение к PostgreSql
 */
module.exports.connectDatabase = config => {
  return new Promise((resolve, reject) => {
    let cfg = {
      database: config.PGDATABASE
    }
    if (config.PGUSER) cfg.user = config.PGUSER
    if (config.PGPASSWORD) cfg.password = config.PGPASSWORD
    if (config.PGHOST) cfg.host = config.PGHOST
    let client = new pg.Client(cfg)
    client.connect(err => {
      if (err) return reject(err)
      resolve(client)
    })
  })
}

/**
 * Создание таблиц, вьюшек и всего остального
 * @param  {Object} client подключение к PostgreSql
 * @return {Object}        подключение к PostgreSql
 */
module.exports.createTables = client => {
  return new Promise((resolve, reject) => {
    client.query(sqlCreateTables, (err, result) => {
      if (err) return reject(err)
      resolve(client)
    })
  })
}

/**
 * Заполнение таблиц списком файлов и папок
 * @param  {Object} client подключение к PostgreSql
 */
module.exports.fillTables = client => readFolder(client, process.env.DIRECTORY)

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
