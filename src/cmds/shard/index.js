'use strict'
const CheckRotations = require('./checkRotations')
const SyncRanks = require('./syncRanks')
const UpdateRankMsg = require('./updateRankMsg')
const UpdatePayoutMsg = require('./updatePayoutMsg')
const UpdateSyncTime = require('./updateSyncTime')
const sleep = (ms = 2000)=>{
  return new Promise(resolve=>{
    setTimeout(resolve, ms)
  })
}
module.exports = async(data = {})=>{
  try{
    //console.log('Staring Shard sync for '+data.shardId)
    const timeStart = Date.now()
    const shard = (await mongo.find('payoutServers', {_id: data.shardId}))[0]
    const tempRes = {res: 'ok'}
    if(shard && shard.status){
      CheckRotations(shard)
      const shardPlayers = await mongo.find('shardPlayers', {shardId: shard._id}, {_id:0})
      if(shardPlayers.length > 0){
        tempRes.res = 'failed'
        const playersFormated = await Client.fetchArenaPlayers({players: shardPlayers})
        //console.log(playersFormated?.length)
        if(playersFormated.length > 0){
          const watchObj = await mongo.find('shardWatch', { shardId: shard._id })
          const ranks = await SyncRanks(shardPlayers, playersFormated, shard, watchObj);
          let shardCache = []
          if(ranks && ranks.shard) shardCache = ranks.shard
          UpdateRankMsg(shard._id, JSON.parse(JSON.stringify(shardCache)))
          UpdatePayoutMsg(shard._id, JSON.parse(JSON.stringify(shardCache)))
          if(ranks){
            HP.SendWatchMsg(shard.watch, ranks.watch, shard)
            HP.CheckRules(shard._id, ranks.rules, JSON.parse(JSON.stringify(shardCache)))
            HP.SendEnemyWatchMsg(shard.enemyWatch, ranks.enemyWatch, shard)
            if(ranks.start){
              HP.SendStartMsg(shard.logChannel, ranks.start.main, shard)
              HP.SendStartMsg(shard.altChannel, ranks.start.alt, shard)
            }
            if(ranks.po){
              HP.SendPayoutMsg(shard.logChannel, ranks.po.main, shard)
              HP.SendPayoutMsg(shard.altChannel, ranks.po.alt, shard)
            }
          }
        }
        tempRes.res = 'ok'
      }
    }
    const timeFinish = Date.now()
    //console.log('Finished Shard sync for '+data.shardId+' in '+((timeFinish - timeStart)/100)+' seconds')
    //await sleep()
    return tempRes
  }catch(e){
    console.log(e)
    return ({res: 'error'})
  }
}
