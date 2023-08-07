'use strict'
const log = require('logger')
const mongo = require('mongoapiclient')
let botSettings = { map: {} }
const update = async(notify = false)=>{
  try{
    let checkTime = 60, notifyUpdate = false
    let obj = (await mongo.find('botSettings', {_id: "1"}))[0]
    if(obj){
      botSettings.map = obj
      if(notify) log.debug('botSettings updated...')
    }else{
      if(notify) notifyUpdate = true
      checkTime = 5
    }
    setTimeout(()=>update(notifyUpdate), checkTime * 1000)
  }catch(e){
    log.error(e);
    setTimeout(()=>update(notify), 5000)
  }
}
const checkMongo = ()=>{
  try{
    let status = mongo.mongoStatus()
    if(status){
      update(true)
    }else{
      setTimeout(checkMongo, 5000)
    }
  }catch(e){
    log.error(e)
    setTimeout(checkMongo, 5000)
  }
}
checkMongo()
module.exports = { botSettings }
