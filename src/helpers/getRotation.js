'use strict'
const log = require('logger')
const timeTillPayout = require('./timeTillPayout')
const getPlayerOrder = require('./getPlayerOrder')
module.exports = async(obj)=>{
  try{
    let notify = obj.notify
    const timeTillPO = timeTillPayout(obj.poOffSet, obj.type)
    let pArray = []
    if(obj.order == 'normal'){
      pArray = obj.players
    }else{
      for(let i=obj.players.length;i>0;i--){
        pArray.push(obj.players[i - 1])
      }
    }
    let msg2Send = '>>> **'+obj.id+'** Payout Rotation\n'
    if(obj.roleId) msg2Send += '<@&'+obj.roleId+'>\n'
    if(obj.roleId) notify = 'off'
    msg2Send += '--------------------------------\n'
    if(timeTillPO && timeTillPO.length > 0) msg2Send += 'Time till payout : **'+timeTillPO[0]+'**\n'
    msg2Send += '--------------------------------\n'
    msg2Send += await getPlayerOrder(pArray, notify)
    return msg2Send
  }catch(e){
    throw(e)
  }
}
