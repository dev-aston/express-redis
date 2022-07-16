const DEFAULT_CONFIG = {
  ttl: 1 * 24 * 60 * 60, // 1 day,
  debug: false,
}

/**
 * Init function to create the Express middleware responsible for cache management.
 * @param {object} config The module config object
 * @param {*} client node-redis client
 * @returns {*} An express middleware to enable caching for routes.
 */
const init = (config = {}, client) => {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  if (cfg.debug) console.info('Warming up the cache...')

  /**
   * Override res.send behaviour to store body.
   */
  const sendOverride = function _res(req, res, next) {
    if (req.method !== 'GET') return next()

    const { send } = res

    res.send = function _send(body) {
      res._body = body
      send.call(this, body)

      if (!req._foundInCache) {
        console.info(`Writing cache entry for ${req.originalUrl} !`)
        client.set(req.originalUrl, res._body)
      }

      console.info(
        `Setting ttl to ${cfg.ttl} seconds for  ${req.originalUrl} !`
      )
      client.expire(req.originalUrl, cfg.ttl)
    }

    return next()
  }

  /**
   * Middleware to retrieve cache and send it if exists
   */
  const getCache = async (req, res, next) => {
    if (req.method !== 'GET') return next()

    const cache = await client.get(req.originalUrl)
    if (cache) {
      console.info(`Cache entry found for ${req.originalUrl} !`)
      req._foundInCache = true

      return res.json(JSON.parse(cache))
    }
    return next()
  }

  return { cacheMiddleware: [sendOverride, getCache] }
}

module.exports = init
