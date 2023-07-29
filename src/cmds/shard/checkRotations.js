'use strict'
module.exports = async(shard)=>{
  const obj = (await mongo.find('shardRotations', {_id: shard._id}, {_id: 0, TTL: 0}))[0]
  if(obj){
    for(let i in obj){
      if(obj[i] && obj[i].players && obj[i].players.length > 0 && obj[i].poOffSet && obj[i].chId) await HP.PayoutRotations(obj[i])
    }
  }
}
