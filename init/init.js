'use strict'

/**
 * Функции проверки конфигурации окружения
 */

const Promise = require('bluebird')
const pg = require('pg')
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
 * @return {Object}        конфигурация окружения либо ошибка
 */
module.exports.checkDatabase = config => {
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
      // client.query('CREATE DATABASE $1', [config.PGDATABASE], (err, result) => {
      client.query('CREATE DATABASE ' + config.PGDATABASE, (err, result) => {
        if (err) return reject(err)
        winston.info('Create database SUCCESS')
        resolve(config)
      })
    })
  })
}
