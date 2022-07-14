const request = require('supertest')
const redis = require('./__misc__/redis')
const server = require('./__misc__/server')

const { LARGE_PAYLOAD } = require('./__misc__/payloads')

let agent
let client

beforeAll(async () => {
  const config = { flushAtInit: true }
  client = await redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    database: 1,
  })

  const app = await server(config, client)

  agent = request(app)
})

afterAll(async () => {
  await client.quit()
})

describe('Express - General routing', () => {
  test('GET - Response in cache', async () => {
    // 1st call, the endpoint returns its json, and is supposed to be cached.
    let res = await agent.get('/cache/get')

    expect(res.headers['content-type']).toMatch(/json/)
    expect(res.body.length).toEqual(LARGE_PAYLOAD.length)
    expect(res.body[0]._id).toEqual(LARGE_PAYLOAD[0]._id)

    const cache = await client.get('/cache/get')
    expect(JSON.parse(cache)).toMatchObject(LARGE_PAYLOAD)

    // 2nd Call to retrieve from cache and ccheck content-type and body
    res = await agent.get('/cache/get')

    expect(res.headers['content-type']).toMatch(/json/)
    expect(res.body.length).toEqual(LARGE_PAYLOAD.length)
    expect(res.body[0]._id).toEqual(LARGE_PAYLOAD[0]._id)
  })

  test('GET - Response in cache with Params', async () => {
    // 1st call, the endpoint returns its json, and is supposed to be cached.
    const url = '/cache/get?a=1&b=2'
    let res = await agent.get(url)

    expect(res.headers['content-type']).toMatch(/json/)
    expect(res.body.length).toEqual(LARGE_PAYLOAD.length)
    expect(res.body[0]._id).toEqual(LARGE_PAYLOAD[0]._id)

    const cache = await client.get(url)
    expect(JSON.parse(cache)).toMatchObject(LARGE_PAYLOAD)

    // 2nd Call to retrieve from cache and ccheck content-type and body
    res = await agent.get(url)

    expect(res.headers['content-type']).toMatch(/json/)
    expect(res.body.length).toEqual(LARGE_PAYLOAD.length)
    expect(res.body[0]._id).toEqual(LARGE_PAYLOAD[0]._id)
  })

  test('POST - Response NOT in cache', async () => {
    // 1st call, the endpoint returns its json, and is not supposed to be cached.
    const res = await agent.post('/cache/post')

    expect(res.headers['content-type']).toMatch(/json/)
    expect(res.body.length).toEqual(LARGE_PAYLOAD.length)
    expect(res.body[0]._id).toEqual(LARGE_PAYLOAD[0]._id)

    // Get cached content in redis.
    const cache = await client.get('/cache/post')
    expect(cache).toBeNull()
  })

  test('GET - Response NOT in cache', async () => {
    // 1st call, the endpoint returns its json, and is not supposed to be cached.
    const res = await agent.get('/no-cache/test')

    expect(res.headers['content-type']).toMatch(/json/)
    expect(res.body.length).toEqual(LARGE_PAYLOAD.length)
    expect(res.body[0]._id).toEqual(LARGE_PAYLOAD[0]._id)

    // Get cached content in redis.
    const cache = await client.get('/no-cache/test')
    expect(cache).toBeNull()
  })
})

describe('Express - Specific mw chaining', () => {
  test('GET - Isolated path NOT in cache', async () => {
    // 1st call, the endpoint returns its json, and is not supposed to be cached.
    const res = await agent.get('/isolate/path/2')

    expect(res.headers['content-type']).toMatch(/json/)
    expect(res.body.length).toEqual(LARGE_PAYLOAD.length)
    expect(res.body[0]._id).toEqual(LARGE_PAYLOAD[0]._id)

    // Get cached content in redis.
    const cache = await client.get('/isolate/path/2')
    expect(cache).toBeNull()
  })

  test('GET - Isolated path in cache', async () => {
    // 1st call, the endpoint returns its json, and is supposed to be cached.
    const url = '/isolate/path/1'
    let res = await agent.get(url)

    expect(res.headers['content-type']).toMatch(/json/)
    expect(res.body.length).toEqual(LARGE_PAYLOAD.length)
    expect(res.body[0]._id).toEqual(LARGE_PAYLOAD[0]._id)

    const cache = await client.get(url)
    expect(JSON.parse(cache)).toMatchObject(LARGE_PAYLOAD)

    // 2nd Call to retrieve from cache and ccheck content-type and body
    res = await agent.get(url)

    expect(res.headers['content-type']).toMatch(/json/)
    expect(res.body.length).toEqual(LARGE_PAYLOAD.length)
    expect(res.body[0]._id).toEqual(LARGE_PAYLOAD[0]._id)
  })
})
