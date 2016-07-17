'use strict'

/**
 * Функции проверки конфигурации окружения
 */

const Promise = require('bluebird')
const pg = require('pg')
const fs = require('fs')
const winston = require('winston')
const path = require('path')
const sqlCreateTables = fs.readFileSync(path.format({dir: __dirname, base: 'createTables.sql'}), 'utf8')

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
    config.PGUSER && (cfg.user = config.PGUSER)
    config.PGPASSWORD && (cfg.password = config.PGPASSWORD)
    config.PGHOST && (cfg.host = config.PGHOST)
    const client = new pg.Client(cfg)
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
    config.PGUSER && (cfg.user = config.PGUSER)
    config.PGPASSWORD && (cfg.password = config.PGPASSWORD)
    config.PGHOST && (cfg.host = config.PGHOST)
    const client = new pg.Client(cfg)
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
