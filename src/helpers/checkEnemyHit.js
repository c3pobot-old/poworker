'use strict'
const mongo = require('mongoapiclient')
module.exports = async(rule = {}, obj)=>{
  try{
    if(rule.status){
      mongo.math('shardHitList', {_id: obj.allyCode+'-'+obj.shardId, shardId: obj.shardId}, {enemy: 1})
      return {color: 3066993, description: 'Good Job!\n'+(obj.emoji ? obj.emoji+' ':'')+obj.name+' climbed from **'+obj.oldRank+'** to **'+obj.rank+'** and dropped '+(obj.swap.emoji ? obj.swap.emoji+' ':'')+obj.swap.name}
    }
  }catch(e){
    throw(e)
  }
}
