'use strict'
const log = require('logger')
const discordMsg = require('./discordMsg')
const getDiscordId = require('./getDiscordId')
const getShardName = require('./getShardName')

module.exports = async(obj = {})=>{
  try{
    const discordId = await getDiscordId(obj)
    if(discordId){
      let embedMsg = {
        color: 15844367,
        description: getShardName(obj)+' Arena Logs\n'+(obj.emoji ? obj.emoji:'')+' **'+obj.name+'** payout at Rank **' + obj.rank + '**'
      }
      let opts = {}
      if(obj.sId){
        opts.sId = obj.sId
      }else{
        opts.shardId = 0
      }
      discordMsg(opts, {method: 'sendDM', dId: discordId, msg: {embeds: [embedMsg]}})
    }
  }catch(e){
    log.error(e)
  }
}
