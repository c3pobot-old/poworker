'use strict'
const {eachLimit} = require('async')
const MAX_SYNC = process.env.MAX_SYNC || 50
const SendWatchMsg = require('./sendWatch')
module.exports = async(players = [])=>{
  const watchMsg = {watch: [], enemy: []}
  await eachLimit(players, MAX_SYNC, async(player)=>{
    let tempEnemy
    let content = ''
    const rankMsg = {
      color: player.newRank > player.oldRank ? 15158332 : 3066993,
      description: HP.GetShardName(player)+' Arena Logs\n'+(player.emoji ? player.emoji:'')+' **'+player.name+'**'
    }
    if(player.newRank > player.oldRank){
      rankMsg.description +=' dropped from **'+player.oldRank+'** to **'+player.newRank+'**'
    }else{
      rankMsg.description +=' climbed from **'+player.oldRank+'** to **'+player.newRank+'**'
    }
    if(player.shard == 'main') tempEnemy = players.find(x=>x.oldRank === player.newRank && x.shard == 'main')
    if(tempEnemy && tempEnemy.name){
      if(player.newRank > player.oldRank ){
        rankMsg.description += '\nBumped by'+(tempEnemy.emoji ? ' '+tempEnemy.emoji:'')+' **'+tempEnemy.name+'**'
      }else{
        rankMsg.description += '\nDropped'+(tempEnemy.emoji ? ' '+tempEnemy.emoji:'')+' **'+tempEnemy.name+'**'
      }
    }
    if(player.dId){
      if(player.notifyStatus > 0 && player.newRank > player.oldRank && player.notifyStart > 0 && +player.dId > 0){
        if(player.notifyMethod == 'dm'){
          if(debugMsg) console.log('Sending DM to '+player.name)
          MSG.SendDM(player.dId, {embed: rankMsg})
        }
        if(player.notifyMethod == 'log' && player.chId){
          content += '<@'+player.dId+'> your rank dropped in **'+player.type+'** arena from **'+player.oldRank+'** to **'+player.newRank+'**\n'
          if(debugMsg) console.log('Sending Ping to '+player.name)
        }
      }
    }
    if(player.rankWatch && player.rankWatch.length > 0){
      for(let i in player.rankWatch){
        if(player.rankWatch[i].method == 'dm'){
          MSG.SendDM(player.rankWatch[i].dId, {embed: {color: 0x00AE86, description: HP.GetShardName(player.rankWatch[i])+' Arena Rank Watch\nThe player at rank '+player.rankWatch[i].rank+' has moved'}})
        }else{
          content += '<@'+player.rankWatch[i].dId+'> the player at rank '+player.rankWatch[i].rank+' has moved\n'
        }
        mongo.del('shardWatch', {_id: player.rankWatch[i]._id})
      }
    }
    if(player.enemyWatch && player.enemyWatch.chId){
      let enemyMsg = HP.GetShardName(player)+' Enemy Watch: '
      if(player.enemyWatch.roleId) enemyMsg += '<@&'+player.enemyWatch.roleId+'> '
      enemyMsg += (player.emoji ? player.emoji:'')+' **'+player.name+'** '
      if(player.enemyWatch.status == 'all'){
        enemyMsg += 'climbed from **'+player.oldRank+'** to **'+player.newRank+'**. '
      }else{
        enemyMsg += 'climbed past rank **'+player.enemyWatch.startRank+'**. New Rank **'+player.newRank+'**.'
      }
      enemyMsg += '\n'
      if(player.enemyWatch.chId == player.chId){
        content += enemyMsg
      }else{
        watchMsg.enemy.push({chId: player.enemyWatch.chId, msg: enemyMsg})
      }
    }
    if(player.watch && player.watch.chId){
      let roleMsg = HP.GetShardName(player)+' Watch '+(player.watch.roleId ? '<@&'+player.watch.roleId+'> ':'')+(player.emoji ? player.emoji+' ':'')+'**'+player.name+'**'
      if(player.newRank > player.oldRank){
        roleMsg +=  ' dropped from **'+player.oldRank+'** to **'+player.newRank+'**.'
      }else{
        roleMsg +=  ' climbed from **'+player.oldRank+'** to **'+player.newRank+'**.'
      }
      roleMsg += '\n'
      if(player.watch.chId == player.chId){
        content += roleMsg
      }else{
        watchMsg.watch.push({chId: player.watch.chId, msg: roleMsg})
      }
    }
    if(player.chId){
      const embedMsg = {
        embed: rankMsg
      }
      if(content != '') embedMsg.content = content
      MSG.SendMsg({chId: player.chId}, embedMsg)
    }
  })
  SendWatchMsg(watchMsg)
}
