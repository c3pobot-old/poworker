'use strict'
const log = require('logger')
const botRequest = require('botrequest')
module.exports = async(opts = {}, data = {})=>{
  try{
    let payload = {...opts,...data}
    if(payload.shardId >= 0) payload.podName = 'bot-'+payload.shardId
    delete payload.shardId
    return await botRequest(payload.method, payload)
  }catch(e){
    log.error(e)
  }
}
