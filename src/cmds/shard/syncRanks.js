'use strict'
const {eachLimit} = require('async')
const MAX_SYNC = process.env.MAX_SYNC || 50
const mongo = require('mongoapiclient')

const { GetPOHour, NotifyPO, NotifyRankChange, NotifyStart, RankWatchNotify, SendAdminMsg, SendRankChange } = require('helpers')

const SyncPlayer = async(sObj, shardPlayers = [], aObj, players = [], oldData = null, shard, watchObj, rankObj)=>{
  if(sObj && aObj && shard.type && shard.alt && shard._id){

    let adminMsg = ''
    let pId = sObj.allyCode+'-'+shard._id
    if(!sObj.type) mongo.set('shardPlayers', {_id: pId}, {type:shard.type})
    let dataChange = 0;
    let currentMainRank = (+aObj.arena[shard.type].rank || 0)
    let currentAltRank = (+aObj.arena[shard.alt].rank || 0)
    let poHourMain = GetPOHour(aObj.poOffSet, shard.type)
    let poHourAlt = GetPOHour(aObj.poOffSet, shard.alt)
    if(!oldData){
      oldData = {
        allyCode: +aObj.allyCode,
        playerId: aObj.playerId,
        name: aObj.name,
        poOffSet: aObj.poOffSet,
        shardId: shard._id,
        sId: shard.sId,
        catId: shard.catId,
        emoji: sObj.emoji,
        type: shard.type,
        alt: shard.alt,
        notify:{
          start: (+sObj.notify.start || 0),
          altStart:(+sObj.notify.altStart || 0),
          poNotify: (+sObj.poNotify || 0),
          poNotifyAlt: (+sObj.poNotifyAlt || 0)
        }
      }
      if(sObj.ranks){
        oldData.ranks = sObj.ranks
      }else{
        oldData.ranks = {
          char: {
            newRank: 0,
            oldRank: 0
          },
          ship: {
            newRank: 0,
            oldRank: 0
          }
        }
        oldData.ranks[shard.type].newRank = currentMainRank
        oldData.ranks[shard.alt].newRank = currentAltRank
      }
      dataChange++
    }
    oldData.arena = aObj.arena
    oldData.rank = currentMainRank
    let oldRankMain = (+oldData.ranks[shard.type].newRank || 0);
    let oldRankAlt = (+oldData.ranks[shard.alt].newRank || 0);
    let mainMsg = {
      name: aObj.name,
      emoji: sObj.emoji,
      allyCode: +sObj.allyCode,
      rank: currentMainRank,
      oldRank: oldRankMain,
      poHour: poHourMain,
      method: sObj.notify.method,
      type: shard.type,
      shard: 'main',
      shardId: shard._id,
      sId: shard.sId,
      chId: shard.logChannel,
      dId: sObj.dId,
      poOffSet: aObj.poOffSet,
      poNotify: 0,
      notify: 0
    }
    let altMsg = {
      name: aObj.name,
      emoji: sObj.emoji,
      allyCode: +sObj.allyCode,
      rank: currentAltRank,
      poHour: poHourAlt,
      oldRank: oldRankAlt,
      method: sObj.notify.method,
      type: shard.alt,
      shard: 'alt',
      shardId: shard._id,
      sId: shard.sId,
      chId: shard.altChannel,
      dId: sObj.dId,
      poOffSet: aObj.poOffSet,
      poNotify: 0,
      notify: 0
    }
    if(!mainMsg.dId && sObj.discordId) mainMsg.dId = sObj.discordId
    if(!altMsg.dId && sObj.discordId) altMsg.dId = sObj.discordId
    if(aObj.name != oldData.name || aObj.poOffSet != oldData.poOffSet){
      if(shard.adminMsg) SendAdminMsg({emoji:sObj.emoji, newName: aObj.name, oldName: oldData.name, oldOffSet: oldData.poOffSet, newOffSet: aObj.poOffSet}, shard)
      oldData.name = aObj.name
      oldData.poOffSet = aObj.poOffSet
      mongo.set('shardPlayers', {_id: pId}, {name: aObj.name, poOffSet: aObj.poOffSet})
      dataChange++
    }
    if(sObj.emoji != oldData.emoji){
      oldData.emoji = sObj.emoji;
      dataChange++;
    }
    if(poHourMain == 23 && oldData.notify.poNotify == 0){
      oldData.notify.poNotify = 1
      dataChange++
      if(sObj.notify.status > 0 && sObj.notify.poMsg > 0){
        mainMsg.poNotify = 1
        if(sObj.notify.method == 'dm') NotifyPO(mainMsg)
      }
      rankObj.po.main.push(mainMsg)
    }
    if (poHourAlt == 23 && oldData.notify.poNotifyAlt == 0) {
      oldData.notify.poNotifyAlt = 1
      dataChange++
      if (sObj.notify.status > 0 && sObj.notify.altStatus > 0 && sObj.notify.poMsg > 0){
        altMsg.poNotify = 1
        if(sObj.notify.method == 'dm') NotifyPO(altMsg)
      }
      rankObj.po.alt.push(altMsg)
    }
    if(poHourMain != 23 && oldData.notify.poNotify == 1){
      oldData.notify.poNotify = 0
      dataChange++
    }
    if(poHourAlt != 23 && oldData.notify.poNotifyAlt == 1){
      oldData.notify.poNotifyAlt = 0
      dataChange++
    }
    if(poHourMain < sObj.notify.startTime && oldData.notify.start == 0){
      oldData.notify.start = 1
      dataChange++;
      if(sObj.notify.status > 0){
        if(sObj.notify.method == 'dm'){
          NotifyStart(mainMsg)
        }else{
          rankObj.start.main.push(mainMsg)
        }
      }
    }
    if (poHourAlt < sObj.notify.startTime && oldData.notify.altStart == 0) {
      oldData.notify.altStart = 1
      dataChange++;
      if (sObj.notify.status > 0 && sObj.notify.altStatus > 0){
        if(sObj.notify.method == 'dm'){
          NotifyStart(altMsg)
        }else{
          rankObj.start.alt.push(altMsg)
        }
      }
    }
    if (poHourMain > sObj.notify.startTime && sObj.notify.startTime != 24 && oldData.notify.start == 1) {
      oldData.notify.start = 0
      dataChange++
    }
    if (poHourAlt > sObj.notify.startTime && sObj.notify.startTime != 24 && oldData.notify.altStart == 1) {
      oldData.notify.altStart = 0
      dataChange++
    }
    if (oldRankMain != currentMainRank) {
      oldData.ranks[shard.type].oldRank = oldRankMain;
      oldData.ranks[shard.type].newRank = currentMainRank;
      let tempArenaSwap = players.find(x=>x.arena[shard.type].rank == oldRankMain)
      if(tempArenaSwap){
        let tempShardSwap = shardPlayers.find(x=>x.playerId == tempArenaSwap.playerId)
        if(tempShardSwap) mainMsg.swap = {emoji: tempShardSwap.emoji, name: tempArenaSwap.name, poOffSet: tempArenaSwap.poOffSet}
      }
      if(shard.watch && shard.watch[aObj.allyCode]){
        if(shard.watch[aObj.allyCode].chId == shard.logChannel){
          mainMsg.watch = shard.watch[aObj.allyCode]
        }else{
          rankObj.watch.push(mainMsg)
        }
      }
      if(shard.enemyWatch && (shard.enemyWatch.allyCodes.filter(x=>x == aObj.allyCode).length > 0 || shard.enemyWatch.emoji.filter(x=>x == sObj.emoji).length > 0)){
        if(shard.enemyWatch.chId == shard.logChannel){
          mainMsg.enemyWatch = shard.enemyWatch
        }else{
          rankObj.enemyWatch.push(mainMsg)
        }
      }
      if(watchObj && watchObj.filter(x => x.rank == oldRankMain).length > 0){
        if(watchObj.filter(x => x.rank == oldRankMain && x.method != 'dm').length > 0) mainMsg.rankWatch = watchObj.filter(x => x.rank == oldRankMain && x.method != 'dm')
        if(watchObj.filter(x => x.rank == oldRankMain && x.method == 'dm').length > 0) RankWatchNotify(watchObj.filter(x => x.rank == oldRankMain && x.method == 'dm'))
      }
      if(sObj.notify.status > 0 && sObj.notify.startTime > poHourMain){
        mainMsg.notify = 1
        if(sObj.notify.method == 'dm') NotifyRankChange(mainMsg)
      }
      if(oldRankMain > currentMainRank && mainMsg.swap && shard.rules) rankObj.rules.push(mainMsg)
      SendRankChange(mainMsg)
      dataChange++
    }
    if (oldRankAlt != currentAltRank) {
      oldData.ranks[shard.alt].oldRank = oldRankAlt;
      oldData.ranks[shard.alt].newRank = currentAltRank;
      if(sObj.notify.status > 0 && sObj.notify.altStatus && sObj.notify.startTime > poHourAlt){
        altMsg.notify = 1
        if(sObj.notify.method == 'dm') NotifyRankChange(altMsg)
      }
      SendRankChange(altMsg)
      dataChange++
    }
    if(dataChange > 0){
      oldData.TTL = new Date()
      mongo.set('shardRankCache', {_id: pId}, oldData)
      if(oldData.history){
        delete oldData.history
        mongo.rep('shardRankCache', {_id: pId}, oldData)
      }
    }
    rankObj.shard.push({
      name: oldData.name,
      poOffSet: oldData.poOffSet,
      rank: oldData.rank,
      oldRank: oldRankMain,
      emoji: oldData.emoji,
      arena: oldData.arena,
      allyCode: oldData.allyCode
    })
  }
}
module.exports = async(shardPlayers, playersFormated, shard, watchObj)=>{
  let rankObj = {po: {main: [], alt: []}, start: {main: [], alt: []}, shard: [], watch: [], enemyWatch: [], rules: []}
  let oldPlayers = await mongo.find('shardRankCache', {shardId: shard._id})
  if(oldPlayers){
    await eachLimit(playersFormated, MAX_SYNC, async(p)=>{
      let sObj = shardPlayers.find(x=>x.playerId == p.playerId)
      if(sObj?.allyCode){
        let oldData = oldPlayers.find(x=>x.playerId == p.playerId)
        let playerData = await SyncPlayer(sObj, shardPlayers, p, playersFormated, oldData, shard, watchObj, rankObj)
      }

    })
  }
  return rankObj
}
