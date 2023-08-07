'use strict'
const log = require('logger')
const mongo = require('mongoapiclient')
const discordMsg = require('./discordMsg')
const getShardName = require('./getShardName')

module.exports = async(obj = [])=>{
  try{
    if(obj.length > 0){
      for(let i in obj){
        let embedMsg = {
          color: 3066993,
          description: getShardName(obj[i])+' Arena Rank Watch\nThe player at rank '+obj[i].rank+' has moved',
        }
        let opts = {}
        if(obj.sId){
          opts.sId = obj.sId
        }else{
          opts.shardId = 0
        }
        getDiscordId(opts, {method: 'sendDM', dId: obj[i].dId, msg: {embeds: [embedMsg]}})
        mongo.del('shardWatch', {_id: obj[i]._id})
      }
    }
  }catch(e){
    log.error(e)
  }
}
