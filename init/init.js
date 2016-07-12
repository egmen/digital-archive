'use strict'

/**
 * Функции проверки конфигурации окружения
 */

const Promise = require('bluebird')
const pg = require('pg')
const fs = require('fs')
const winston = require('winston')

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
    fs.readFile(global.NODE_ROOT + '/init/init.sql', 'utf8', (err, sql) => {
      if (err) return reject(err)
      client.query(sql, (err, result) => {
        if (err) return reject(err)
        console.log(result.rows)
        resolve(client)
      })
    })
  })
}

/**
 * Заполнение таблиц списком файлов
 * @param  {Object} client подключение к PostgreSql
 */
module.exports.fillTables = client => {
  return new Promise((resolve, reject) => {
    client.query('SELECT 4444 AS super', (err, result) => {
      if (err) return reject(err)
      // console.log(result.rows[0])
      resolve(result.rows[0])
    })
  })
}
