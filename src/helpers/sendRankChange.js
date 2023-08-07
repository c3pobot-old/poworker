'use strict'
const log = require('logger')
const mongo = require('mongoapiclient')
const discordMsg = require('./discordMsg')
const getDiscordId = require('./getDiscordId')
const getShardName = require('./getShardName')

module.exports = async(obj)=>{
  try{
    if(obj.chId){
      let content, shardName = getShardName(obj)
      let embedMsg = {
        color: obj.rank > obj.oldRank ? 15158332 : 3066993,
        description: shardName+' Arena Logs\n'+(obj.emoji ? obj.emoji+' ':'')+'**'+obj.name+'** '
      }
      embedMsg.description += (obj.rank > obj.oldRank ? 'dropped':'climbed')+' from **'+obj.oldRank+'** to **'+obj.rank+'**.\n'
      if(obj.swap){
        embedMsg.description += (obj.rank > obj.oldRank ? 'Bumped by':'Dropped')+' '+(obj.swap.emoji ? obj.swap.emoji+' ':'')+'**'+obj.swap.name+'**'
      }
      if(obj.notify && obj.method == 'log' && (obj.rank > obj.oldRank || obj.climb)){
        let discordId = await getDiscordId(obj)
        if(discordId){
          if(!content) content = ''
          content += '<@'+discordId+'> '+(obj.rank > obj.oldRank ? 'your rank dropped':'climbed')+' in '+shardName+' arena from **'+obj.oldRank+'** to **'+obj.rank+'**\n'
        }
      }
      if(obj.rankWatch && obj.rankWatch.length > 0){
        if(!content) content = ''
        for(let i in obj.rankWatch){
          content += '<@'+obj.rankWatch[i].dId+'> the player at rank **'+obj.oldRank+'** has moved.\n'
          mongo.del('shardWatch', {_id: obj.rankWatch[i]._id})
        }
      }
      if(obj.enemyWatch && obj.enemyWatch.notify){
        if(obj.rank < obj.enemyWatch.startRank && obj.rank < obj.oldRank && (obj.enemyWatch.status == 'all' || obj.oldRank > obj.enemyWatch.startRank)){
          if(!content) content = ''
          if(obj.enemyWatch.roleId) content += '<@&'+obj.enemyWatch.roleId+'> '
          content += shardName+' Enemy Watch: '
          content += (obj.emoji ? obj.emoji+' ':'')+'**'+obj.name+'** climbed '
          if(obj.enemyWatch.status == 'all'){
            content += 'from **'+obj.oldRank+'** to '
          }else{
            content += ' past **'+obj.enemyWatch.startRank+'**. New rank '
          }
          content += '**'+obj.rank+'**\n'
        }
      }
      if(obj.watch && obj.poHour >= 0){
        if(obj.watch.startTime > obj.poHour || (obj.watch.startRank && obj.watch.startRank > obj.rank)){
          if(obj.watch.moveDir == 'both' || (obj.watch.moveDir == 'up' && obj.oldRank > obj.rank) || (obj.watch.moveDir == 'down' && obj.oldRank < obj.rank)){
            if(!content) content = ''
            content += (obj.watch.roleId ? '<@&'+obj.watch.roleId+'> ':'')+shardName+' Watch : '+(obj.emoji ? obj.emoji+' ':'')+'**'+obj.name+'** '+(obj.rank > obj.oldRank ? 'dropped':'climbed')+' from **'+obj.oldRank+'** to **'+obj.rank+'**\n'
          }
        }
      }
      discordMsg({ sId: obj.sId }, {method: 'sendMsg', chId: obj.chId, msg: {content: content, embeds: [embedMsg]}})
    }
  }catch(e){
    log.error(e)
  }
}
