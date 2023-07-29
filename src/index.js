'use strict'
require('./globals')
require('./expressServer')
let Ques = require('./ques')
const InitRedis = async()=>{
  try{
    await redis.init()
    const redisStatus = await redis.ping()
    if(redisStatus == 'PONG'){
      console.log('redis connection successful...')
      StartServices()
    }else{
      console.log('redis connection error. Will try again in 5 seconds...')
      setTimeout(InitRedis, 5000)
    }
  }catch(e){
    console.error('redis connection error. Will try again in 5 seconds...')
    setTimeout(InitRedis, 5000)
  }
}
const StartServices = async()=>{
  try{
    await UpdateBotSettings()
    await UpdateUnits()
    await CheckAPIReady()
    StartQue()
  }catch(e){
    console.error(e);
    setTimeout(StartServices, 5000)
  }
}
const CheckAPIReady = async()=>{
  const obj = await Client.metadata()
  if(obj?.latestGamedataVersion){
    console.log('API is ready ..')
    apiReady = 1
  }else{
    console.log('API is not ready. Will try again in 5 seconds')
    setTimeout(()=>CheckAPIReady(), 5000)
  }
}
const StartQue = ()=>{
  try{
    Ques.start()
  }catch(e){
    console.error(e);
    setTimeout(StartQue, 5000)
  }
}
const UpdateBotSettings = async()=>{
  try{
    const obj = (await mongo.find('botSettings', {_id: "1"}))[0]
    if(obj) botSettings = obj
    setTimeout(UpdateBotSettings, 60000)
  }catch(e){
    setTimeout(UpdateBotSettings, 5000)
    console.error(e)
  }
}
const UpdateUnits = async()=>{
  try{
    await HP.UpdateUnitsList()
    setTimeout(UpdateUnits, 3600000)
  }catch(e){
    console.error(e);
    setTimeout(UpdateUnits, 5000)
  }
}

InitRedis()
