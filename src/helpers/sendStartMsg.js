'use strict'
const GetDiscordId = require('./getDiscordId')
module.exports = async(chId, obj = [], shard)=>{
  try{
    if(chId && obj.length > 0){
      let content
      for(let i in obj){
        const discordId = await GetDiscordId(obj[i])
        if(discordId){
          if(!content) content = ''
          content += '<@' + discordId + '> Starting notifications of rank drops in **' + (obj[i].type == 'char' ? 'Squad':'Fleet') + '** arena. Current Rank **' + obj[i].rank + '**\n'
        }
      }
      //MSG.SendMsg({chId: chId}, {content: content})
      HP.DiscordMsg({sId: shard.sId}, {method: 'sendMsg', chId: chId, msg: {content: content}})
    }
  }catch(e){
    console.error(e)
  }
}
