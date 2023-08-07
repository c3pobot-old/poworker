'use strict'
const log = require('logger')
const RedisWrapper = require('rediswrapper')
let redisReady = false
const redisOpts = {
  host: process.env.REDIS_SERVER,
  port: process.env.REDIS_PORT
}
if(process.env.REDIS_PASS) redisOpts.passwd = process.env.REDIS_PASS
const redis = new RedisWrapper(redisOpts)
const initRedis = async()=>{
  try{
    await redis.init()
    let status = await redis.ping()
    if(status === 'PONG'){
      redisReady = true
      log.info('redis connection successful...')
    }else{
      log.error('redis connection error. Will try again in 5 seconds...')
      setTimeout(initRedis, 5000)
    }
  }catch(e){
    log.error(e);
    setTimeout(initRedis, 5000)
  }
}
initRedis()
module.exports = redis
module.exports.redisStatus = ()=>{
  return redisReady
}
