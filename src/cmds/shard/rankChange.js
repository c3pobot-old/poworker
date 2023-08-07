module.exports = async(oldData, sObj, shard, type, poHour)=>{
  let tempObj = {
    name: oldData.name,
    allyCode: +oldData.allyCode,
    emoji: sObj.emoji,
    sId: shard.sId,
    dId: sObj.dId,
    notifyStart: 0,
    notifyMethod: sObj.notify.method
  }
  if(!tempObj.dId && sObj.discordId) tempObj.dId = sObj.discordId
  if(type == 'main'){
    tempObj.newRank = oldData.ranks[shard.type].newRank
    tempObj.oldRank = oldData.ranks[shard.type].oldRank
    tempObj.chId = shard.logChannel
    tempObj.type = shard.type
    if(shard.logWebHook) tempObj.webHookId = shard.logWebHook
    if(sObj.notify) tempObj.notifyStatus = (+sObj.notify.status || 0);
    tempObj.shard = 'main'
    if(oldData.notify) tempObj.notifyStart = (+oldData.notify.start || 0)
    if(poHour >= 0 && shard.watch && shard.watch[tempObj.allyCode]){
      if(shard.watch[tempObj.allyCode].startTime > poHour || (shard.watch[tempObj.allyCode].startRank && shard.watch[tempObj.allyCode].startRank > tempObj.newRank)){
        if(shard.watch[tempObj.allyCode].moveDir == 'both') tempObj.watch = shard.watch[tempObj.allyCode]
        if(shard.watch[tempObj.allyCode].moveDir == 'up' && tempObj.oldRank > tempObj.newRank) tempObj.watch = shard.watch[tempObj.allyCode]
        if(shard.watch[tempObj.allyCode].moveDir == 'down' && tempObj.oldRank < tempObj.newRank) tempObj.watch = shard.watch[tempObj.allyCode]
      }
    }
    if(shard.enemyWatch && shard.enemyWatch.notify != 0){
      if(tempObj.newRank < shard.enemyWatch.startRank && tempObj.newRank < tempObj.oldRank){
        if(shard.enemyWatch.allyCodes.filter(x=>x == tempObj.allyCode).length > 0 || shard.enemyWatch.emoji.filter(x=>x == tempObj.emoji).length > 0){
          if(shard.enemyWatch.status == 'all' ) tempObj.enemyWatch = shard.enemyWatch
          if(shard.enemyWatch.status == 'once' && tempObj.oldRank > shard.enemyWatch.startRank) tempObj.enemyWatch = shard.enemyWatch
        }
      }
    }
  }
  if(type == 'alt'){
    tempObj.newRank = oldData.ranks[shard.alt].newRank
    tempObj.oldRank = oldData.ranks[shard.alt].oldRank
    tempObj.chId = shard.altChannel
    tempObj.type = shard.alt
    if(shard.altWebHook) tempObj.webHookId = shard.altWebHook
    if(sObj.notify && sObj.notify.status > 0) tempObj.notifyStatus = (+sObj.notify.altStatus || 0);
    tempObj.shard = 'alt'
    if(oldData.notify) tempObj.notifyStart = (+oldData.notify.altStart || 0);
  }
  return(tempObj)
}
