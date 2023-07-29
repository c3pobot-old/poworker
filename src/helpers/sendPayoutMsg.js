'use strict'
const GetDiscordId = require('./getDiscordId')
module.exports = async(chId, obj = [], shard = {})=>{
  try{
    if(chId && obj.length > 0){
      const sortedObj = await sorter([{column: 'rank', order: 'ascending'}], obj)
      let content, shardName = HP.GetShardName(sortedObj[0])
      const embedMsg = {
        color: 15844367,
        description: shardName + ' Arena Logs Payouts\n'
      }
      for(let i in sortedObj){
        embedMsg.description += '`'+sortedObj[i].rank.toString().padStart(3, ' ')+'` '+(sortedObj[i].emoji ? sortedObj[i].emoji+' ':'')+'**'+sortedObj[i].name+'**\n'
        if(sortedObj[i].poNotify && sortedObj[i].method == 'log'){
          const discordId = await GetDiscordId(sortedObj[i])
          if(discordId){
            if(!content) content = ''
            content += '<@'+discordId+'> your payout for '+shardName+' Arena. Rank **'+sortedObj[i].rank+'**\n'
          }
        }
      }
      //MSG.SendMsg({chId: chId}, {content: content, embed: embedMsg})
      HP.DiscordMsg({sId: shard.sId}, {method: 'sendMsg', chId: chId, msg: {content: content, embeds: [embedMsg]}})
    }
  }catch(e){
    console.error(e)
  }
}
