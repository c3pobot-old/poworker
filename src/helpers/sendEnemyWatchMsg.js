'use strict'
const log = require('logger')
const discordMsg = require('./discordMsg')
const getShardName = require('./getShardName')

module.exports = async(watch, obj = [], shard = {})=>{
  try{
    if(obj.length > 0 && watch.notify){
      let content
      for(let i in obj){
        if(obj[i].rank < watch.startRank && obj[i].rank < obj[i].oldRank && (watch.status == 'all' || obj[i].oldRank >= watch.startRank)){
          if(!content) content = (watch.roleId ? '<@&'+watch.roleId+'> ':'')+getShardName(obj[i])+' Enemy Watch : \n'
          content += (obj[i].emoji ? obj[i].emoji+' ':'')+'**'+obj[i].name+'** climbed '
          if(watch.status == 'all'){
            content += 'from **'+obj[i].oldRank+'** to '
          }else{
            content += ' past **'+watch.startRank+'**. New rank '
          }
          content += '**'+obj[i].rank+'**\n'
        }
      }
      if(content) discordMsg({sId: shard.sId}, {method: 'sendMsg', chId: watch.chId, msg: {content: content}})
    }
  }catch(e){
    log.error(e)
  }
}
