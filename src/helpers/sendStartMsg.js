'use strict'
const log = require('logger')
const discordMsg = require('./discordMsg')
const getDiscordId = require('./getDiscordId')

module.exports = async(chId, obj = [], shard)=>{
  try{
    if(chId && obj.length > 0){
      let content
      for(let i in obj){
        let discordId = await getDiscordId(obj[i])
        if(discordId){
          if(!content) content = ''
          content += '<@' + discordId + '> Starting notifications of rank drops in **' + (obj[i].type == 'char' ? 'Squad':'Fleet') + '** arena. Current Rank **' + obj[i].rank + '**\n'
        }
      }
      discordMsg({sId: shard.sId}, {method: 'sendMsg', chId: chId, msg: {content: content}})
    }
  }catch(e){
    log.error(e)
  }
}
