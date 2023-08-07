'use strict'
const log = require('logger')
const discordMsg = require('./discordMsg')
const getDiscordId = require('./getDiscordId')
const getShardName = require('./getShardName')

module.exports = async(obj = {})=>{
  try{
    let discordId = await getDiscordId(obj)
    if(discordId){
      let embedMsg = {
        color: 15844367,
        description: 'Starting notifications of rank drops in **'+getShardName(obj)+'**.\nCurrent Rank **'+obj.rank+'**'
      }
      //MSG.SendDM(discordId, {embed: embedMsg})
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
