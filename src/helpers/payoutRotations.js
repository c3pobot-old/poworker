'use strict'
module.exports = async(obj = {})=>{
  try{
    const poHour = await HP.GetPOHour(obj.poOffSet, obj.type)
    if(poHour > obj.startTime && obj.notifyStart == 1){
      await mongo.set('shardRotations', {_id: obj.shardId}, {[obj.id+'.notifyStart']: 0})
    }
    if(obj.startTime > poHour && obj.notifyStart == 0){
      const msg2send = await HP.GetRotation(obj)
      if(msg2send){
        const firstPlace = obj.players.shift()
        obj.players.push(firstPlace)
        mongo.set('shardRotations', {_id: obj.shardId}, {[obj.id+'.players']: obj.players, [obj.id+'.notifyStart']: 1})
        //MSG.SendMsg({chId: obj.chId}, {content: msg2send})
        HP.DiscordMsg({sId: obj.sId}, {method: 'sendMsg', chId: obj.chId, msg: {content: msg2send}})
      }
    }
  }catch(e){
    console.error(e)
  }
}
