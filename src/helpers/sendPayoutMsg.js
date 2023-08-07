'use strict'
const sorter = require('json-array-sorter')
const getDiscordId = require('./getDiscordId')
const getShardName = require('./getShardName')
const discordMsg  = require('./discordMsg')

module.exports = async(chId, obj = [], shard = {})=>{
  try{
    if(chId && obj.length > 0){
      let sortedObj = sorter([{column: 'rank', order: 'ascending'}], obj)
      let content, shardName = getShardName(sortedObj[0])
      let embedMsg = {
        color: 15844367,
        description: shardName + ' Arena Logs Payouts\n'
      }
      for(let i in sortedObj){
        embedMsg.description += '`'+sortedObj[i].rank.toString().padStart(3, ' ')+'` '+(sortedObj[i].emoji ? sortedObj[i].emoji+' ':'')+'**'+sortedObj[i].name+'**\n'
        if(sortedObj[i].poNotify && sortedObj[i].method == 'log'){
          let discordId = await getDiscordId(sortedObj[i])
          if(discordId){
            if(!content) content = ''
            content += '<@'+discordId+'> your payout for '+shardName+' Arena. Rank **'+sortedObj[i].rank+'**\n'
          }
        }
      }
      discordMsg({sId: shard.sId}, {method: 'sendMsg', chId: chId, msg: {content: content, embeds: [embedMsg]}})
    }
  }catch(e){
    throw(e)
  }
}
