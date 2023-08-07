'use strict'
const log = require('logger')
const mongo = require('mongoapiclient')
const checkRotations = require('./checkRotations')
const syncRanks = require('./syncRanks')
const updateRankMsg = require('./updateRankMsg')
const updatePayoutMsg = require('./updatePayoutMsg')
const swgohClient = require('swgohClient')

const { CheckRules, SendEnemyWatchMsg, SendWatchMsg, SendPayoutMsg, SendStartMsg } = require('helpers')

module.exports = async(data = {})=>{
  try{
    //console.log('Staring Shard sync for '+data.shardId)
    let timeStart = Date.now()
    let shard = (await mongo.find('payoutServers', {_id: data.shardId}))[0]
    let tempRes = {res: 'ok'}
    if(shard && shard.status){
      checkRotations(shard)
      let shardPlayers = await mongo.find('shardPlayers', {shardId: shard._id}, {_id:0})
      if(shardPlayers.length > 0){
        tempRes.res = 'failed'
        let playersFormated = await swgohClient.fetchArenaPlayers({players: shardPlayers})
        //console.log(playersFormated?.length)
        if(playersFormated.length > 0){
          let watchObj = await mongo.find('shardWatch', { shardId: shard._id })
          let ranks = await syncRanks(shardPlayers, playersFormated, shard, watchObj);
          let shardCache = []
          if(ranks && ranks.shard) shardCache = ranks.shard
          updateRankMsg(shard._id, JSON.parse(JSON.stringify(shardCache)))
          updatePayoutMsg(shard._id, JSON.parse(JSON.stringify(shardCache)))
          if(ranks){
            SendWatchMsg(shard.watch, ranks.watch, shard)
            CheckRules(shard._id, ranks.rules, JSON.parse(JSON.stringify(shardCache)))
            SendEnemyWatchMsg(shard.enemyWatch, ranks.enemyWatch, shard)
            if(ranks.start){
              SendStartMsg(shard.logChannel, ranks.start.main, shard)
              SendStartMsg(shard.altChannel, ranks.start.alt, shard)
            }
            if(ranks.po){
              SendPayoutMsg(shard.logChannel, ranks.po.main, shard)
              SendPayoutMsg(shard.altChannel, ranks.po.alt, shard)
            }
          }
        }
        tempRes.res = 'ok'
      }
    }
    let timeFinish = Date.now()
    //console.log('Finished Shard sync for '+data.shardId+' in '+((timeFinish - timeStart)/100)+' seconds')
    return tempRes
  }catch(e){
    throw(e)
  }
}
