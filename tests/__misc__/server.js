const express = require('express')
const cacheMiddlewares = require('../../lib')

const { LARGE_PAYLOAD } = require('./payloads')

const init = async (config, redisClient) => {
  const { readCache } = await cacheMiddlewares(config, redisClient)

  const app = express().use(express.urlencoded({ extended: true }))

  app.use(/^\/cache/, readCache)

  app.get('/cache/get', (req, res, next) => {
    res.status(200).json(LARGE_PAYLOAD)
    next()
  })

  app.post('/cache/post', (req, res, next) => {
    res.status(200).json(LARGE_PAYLOAD)
    next()
  })

  app.get('/no-cache/test', (req, res, next) => {
    res.status(200).json(LARGE_PAYLOAD)
    next()
  })

  app.get('/isolate/path/1', readCache, (req, res, next) => {
    res.status(200).json(LARGE_PAYLOAD)
    next()
  })

  app.get('/isolate/path/2', (req, res, next) => {
    res.status(200).json(LARGE_PAYLOAD)
    next()
  })

  // app.use(/^\/cache/, writeCache)

  return app
}

module.exports = init
