/**
 * Init function to create the Express middleware responsible for cache management.
 * @param {object} config The module config object
 * @param {*} client node-redis client
 * @returns {*} An express middleware to enable caching for routes.
 */
const init = (config = {}, client) => {
  if (config.debug) console.info('Warming up the cache...')

  /**
   * Override res.send behaviour to store body.
   */
  const sendOverride = function _res(req, res, next) {
    if (req.method !== 'GET') return next()

    const { send } = res

    res.send = function _send(body) {
      res._body = body
      send.call(this, body)

      client.set(req.originalUrl, res._body)
    }

    return next()
  }

  /**
   * Middleware to retrieve cache and send it if exists
   */
  const getCache = async (req, res, next) => {
    if (req.method !== 'GET') return next()

    const cache = await client.get(req.originalUrl)
    if (cache) return res.json(JSON.parse(cache))

    return next()
  }

  return { cacheMiddleware: [sendOverride, getCache] }
}

module.exports = init
