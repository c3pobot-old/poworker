'use strict'
const log = require('logger')
const mongo = require('mongoapiclient')
const discordMsg = require('./discordMsg')
const getPOHour = require('./getPOHour')
const getRotation = require('./getRotation')

module.exports = async(obj = {})=>{
  try{
    const poHour = await getPOHour(obj.poOffSet, obj.type)
    if(poHour > obj.startTime && obj.notifyStart == 1){
      await mongo.set('shardRotations', {_id: obj.shardId}, {[obj.id+'.notifyStart']: 0})
    }
    if(obj.startTime > poHour && obj.notifyStart == 0){
      const msg2send = await getRotation(obj)
      if(msg2send){
        const firstPlace = obj.players.shift()
        obj.players.push(firstPlace)
        mongo.set('shardRotations', {_id: obj.shardId}, {[obj.id+'.players']: obj.players, [obj.id+'.notifyStart']: 1})
        discordMsg({sId: obj.sId}, {method: 'sendMsg', chId: obj.chId, msg: {content: msg2send}})
      }
    }
  }catch(e){
    log.error(e)
  }
}
