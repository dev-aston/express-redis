const express = require('express')
const expressRedis = require('../../lib')

const { LARGE_PAYLOAD } = require('./payloads')

const init = (config, redisClient) => {
  const { cacheMiddleware } = expressRedis(config, redisClient)

  const app = express().use(express.urlencoded({ extended: true }))

  app.use(/^\/cache/, cacheMiddleware)

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

  app.get('/isolate/path/1', cacheMiddleware, (req, res, next) => {
    res.status(200).json(LARGE_PAYLOAD)
    next()
  })

  app.get('/isolate/path/2', (req, res, next) => {
    res.status(200).json(LARGE_PAYLOAD)
    next()
  })

  return app
}

module.exports = init
