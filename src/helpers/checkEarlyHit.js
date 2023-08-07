'use strict'
const timeTillPayout = require('./timeTillPayout')
const mongo = require('mongoapiclient')
module.exports = async(rule = {}, obj, checkEnemy = 2, ranks = [], enemySkips = {})=>{
  try{
    if(rule.status && obj.swap){
      let timeTillPO = await timeTillPayout(obj.swap.poOffSet, obj.type)
      let pTimeTillPO = await timeTillPayout(obj.poOffSet, obj.type)
      if(!rule.closer || (rule.closer && (pTimeTillPO[1] > timeTillPO[1] || obj.swap.poOffSet == obj.poOffSet))){
        let timeNow = Date.now()
        let timeDiff = rule.hour * 3600000
        if((timeTillPO[1] > timeNow) && timeDiff > (timeTillPO[1] - timeNow)){
          let embedMsg = {
            color: 15158332,
            description: '**Early hit** on a friendly within **'+rule.hour+'** hours of payout!\n'+(obj.emoji ? obj.emoji+' ':'')+'**'+obj.name+'** climbed from **'+obj.oldRank+'** to **'+obj.rank+'** and dropped '+(obj.swap.emoji ? obj.swap.emoji+' ':'')+'**'+obj.swap.name+'**\n'
          }
          if(checkEnemy && ranks.length > 0){
            let tempEnemy = 'Possible enemies could have hit :\n'
            for(let i in ranks) tempEnemy += '`'+ranks[i].oldRank.toString().padStart(3, ' ')+'` : '+(ranks[i].emoji)+' '+ranks[i].name+'\n'
            embedMsg.description += tempEnemy
            if(enemySkips.status) mongo.math('shardHitList', {_id: obj.allyCode+'-'+obj.shardId, shardId: obj.shardId}, {enemySkip: 1})
          }
          mongo.math('shardHitList', {_id: obj.allyCode+'-'+obj.shardId, shardId: obj.shardId}, {early: 1})
          return embedMsg
        }
      }
    }
  }catch(e){
    throw(e)
  }
}
