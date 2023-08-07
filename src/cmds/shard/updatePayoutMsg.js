'use strict'
const log = require('logger')
const mongo = require('mongoapiclient')
const { DeepCopy, DiscordMsg, GetPayouts, GetShardName } = require('helpers')
module.exports = async(shardId, shardCache = [])=>{
  try{
    const shard = (await mongo.find('payoutServers', {_id: shardId}))[0]
    if(shard && shard.payChannel){
      const payMsg = await GetPayouts(shard, shardCache, true)
      if(payMsg && payMsg.length > 0){
        if(!shard.payMsgs){
          const payMsgInfo = (await mongo.find('shardMessages', {_id: shard.sId+'-'+shard.payChannel}))[0]
          if(payMsgInfo && payMsgInfo.msgId){
            shard.payMsgs = [payMsgInfo.msgId]
            await mongo.set('payoutServers', {_id: shard._id}, {payMsgs: shard.payMsgs})
          }
        }
        if(shard.payMsgs && shard.payMsgs.length > 0){
          const defaultMsg = 'List should update about every 2 minutes\n:rage: is enemy :shrug: is unknown.\nThe bot could stall so if it looks like it is not updating tag scuba\n'
          let fieldLength = +payMsg.length, numMsgs = +shard.payMsgs.length
          if(fieldLength > 25 && numMsgs == 1) numMsgs = Math.round( +fieldLength / 25)
          if(fieldLength > 25 && numMsgs == 1) numMsgs = 2
          if(numMsgs > 1) fieldLength = Math.round( +payMsg.length / numMsgs)
          const embeds = []
          const embedMsg = {
            color: 15844367,
            fields: []
          }
          let count = 0
          for(let i in payMsg){
            if(i == 0){
              embedMsg.title = GetShardName(shard)+' Arena Payouts'
              embedMsg.description = (shard.message == 'default' ? defaultMsg:shard.message.replace('<br>', '\n'))
            }
            embedMsg.fields.push(payMsg[i])
            count++
            if(+i + 1 == payMsg.length && count < fieldLength) count = +fieldLength
            if(+i + 1 == payMsg.length){
              embedMsg.timestamp = new Date()
              embedMsg.footer = {text: 'Updated'}
            }
            if(count == fieldLength){
              embeds.push(JSON.parse(JSON.stringify(embedMsg)))
              delete embedMsg.title
              delete embedMsg.description
              embedMsg.fields = []
              count = 0
            }
          }
          DiscordMsg({sId: shard.sId}, {method: 'editMsg', chId: shard.payChannel, msgId: shard.payMsgs[0], msg: {embeds: embeds}})
        }
      }
    }
  }catch(e){
    log.error(e)
  }
}
