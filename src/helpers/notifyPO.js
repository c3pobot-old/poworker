'use strict'
const GetDiscordId = require('./getDiscordId')
module.exports = async(obj)=>{
  try{
    const discordId = await GetDiscordId(obj)
    if(discordId){
      const embedMsg = {
        color: 15844367,
        description: HP.GetShardName(obj)+' Arena Logs\n'+(obj.emoji ? obj.emoji:'')+' **'+obj.name+'** payout at Rank **' + obj.rank + '**'
      }
      //MSG.SendDM(discordId, {embed: embedMsg})
      HP.DiscordMsg({shardId: 0}, {method: 'sendDM', dId: discordId, msg: {embeds: [embedMsg]}})
    }
  }catch(e){
    console.error(e)
  }
}
