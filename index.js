'use strict'

/**
 * Инициализация сервера в зависимости от наличия настроек
 */

const fs = require('fs')
const path = require('path')

global.NODE_ROOT = path.resolve(__dirname)

/**
 * Запуск боевого либо настроечного сервера
 */
fs.access('.env', err => {
  if (err) {
    require(global.NODE_ROOT + '/init/server.js')
  } else {
    require('dotenv').config()
    require(global.NODE_ROOT + '/app/server.js')
  }
})
