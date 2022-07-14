const init = async (config = {}, client) => {
  if (!config.debug) console.info = () => {}
  console.info('Warming up the cache...')

  if (config.flushAtInit) {
    console.info('FLushing all the cash...')
    await client.FLUSHALL()
  }
  /**
   * Override res.send behaviour to store body.
   */
  const resOverride = function _res(req, res, next) {
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

  return { readCache: [resOverride, getCache] }
}

module.exports = init
