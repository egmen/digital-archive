'use strict'

/**
 * Проверки конфигурации
 */

const Promise = require('bluebird')
const pg = require('pg')
const winston = require('winston')

module.exports.checkDirectory = config => {
  return new Promise((resolve, reject) => {
    resolve(config)
  })
}

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
      winston.info('Connection SUCCESS')
      // Не понял как безопасно подставить переменную в запрос
      // client.query('CREATE DATABASE $1', [config.PGDATABASE], (err, result) => {
      client.query('CREATE DATABASE ' + config.PGDATABASE, (err, result) => {
        if (err) return reject(err)
        winston.info('Select SUCCESS')
        console.log(result.rows)
        resolve(config)
      })
    })
  })
}
