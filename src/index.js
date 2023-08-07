'use strict'
const log = require('logger')
let logLevel = process.env.LOG_LEVEL || log.Level.INFO;
log.setLevel(logLevel);
const mongo = require('mongoapiclient')
const swgohClient = require('./swgohClient')
const { redisStatus } = require('./helpers/redis')
const { botSettings } = require('./helpers/botSettings')
const { configMaps } = require('./helpers/configMaps')

let Ques = require('./que')
const CheckRedis = async()=>{
  try{
    let status = redisStatus()
    if(status){
      CheckAPIReady()
    }else{
      setTimeout(CheckRedis, 5000)
    }
  }catch(e){
    log.error(e);
    setTimeout(CheckRedis, 5000)
  }
}
const CheckAPIReady = async()=>{
  try{
    let obj = await swgohClient.metadata()
    if(obj?.latestGamedataVersion){
      log.info('API is ready ..')
      StartQue()
    }else{
      log.info('API is not ready. Will try again in 5 seconds')
      setTimeout(()=>CheckAPIReady(), 5000)
    }
  }catch(e){
    log.error(e)
    setTimeout(()=>CheckAPIReady(), 5000)
  }
}
const StartQue = ()=>{
  try{
    Ques.start()
  }catch(e){
    log.error(e);
    setTimeout(StartQue, 5000)
  }
}
CheckRedis()
