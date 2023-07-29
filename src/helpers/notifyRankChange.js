'use strict'
const GetDiscordId = require('./getDiscordId')
module.exports = async(obj)=>{
  try{
    if(obj.rank > obj.oldRank || obj.climb){
      const discordId = await GetDiscordId(obj)
      if(discordId){
        const embedMsg = {
          color: obj.rank > obj.oldRank ? 15158332 : 3066993,
          description: HP.GetShardName(obj)+' Arena Logs\n'+(obj.emoji ? obj.emoji+' ':'')+'**'+obj.name+'** '
        }
        embedMsg.description += (obj.rank > obj.oldRank ? 'dropped':'climbed')+' from **'+obj.oldRank+'** to **'+obj.rank+'**.\n'
        if(obj.swap){
          embedMsg.description += (obj.rank > obj.oldRank ? 'Bumped by':'Dropped')+' '+(obj.swap.emoji ? obj.swap.emoji+' ':'')+'**'+obj.swap.name+'**'
        }

        //MSG.SendDM(discordId, {embed: embedMsg})
        HP.DiscordMsg({shardId: 0}, {method: 'sendDM', dId: discordId, msg: {embeds: [embedMsg]}})
      }
    }
  }catch(e){
    console.error(obj)
  }
}
