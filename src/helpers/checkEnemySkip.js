'use strict'
const mongo = require('mongoapiclient')
module.exports = async(rule = {}, obj, ranks = [], rank = 2)=>{
  try{
    if(rule.status && ranks.length > 0){
      let embedMsg = {
        color: 15158332,
        description: '**Hit on a friendly** when enemy was within **'+rank+'** ranks of friendly!\n'+(obj.emoji ? obj.emoji+' ':'')+'**'+obj.name+'** climbed from **'+obj.oldRank+'** to **'+obj.rank+'** and dropped '+(obj.swap.emoji ? obj.swap.emoji+' ':'')+'**'+obj.swap.name+'**\n'
      }
      embedMsg.description += 'Possible enemies could have hit :\n'
      for(let i in ranks) embedMsg.description += '`'+ranks[i].oldRank.toString().padStart(3, ' ')+'` : '+(ranks[i].emoji)+' '+ranks[i].name+'\n'
      mongo.math('shardHitList', {_id: obj.allyCode+'-'+obj.shardId, shardId: obj.shardId}, {enemySkip: 1})
      return embedMsg
    }
  }catch(e){
    throw(e)
  }
}
