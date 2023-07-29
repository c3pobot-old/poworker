'use strict'
module.exports = async(pId, type, rank)=>{
  try{
    const timeNow = new Date()
    const tempName = 'ranks.'+type
    let history = []
    const rankHistory = (await mongo.find('shardRankHist', {_id: pId}))[0]
    if(rankHistory && rankHistory.ranks && rankHistory.ranks[type]) history = rankHistory.ranks[type]
    if(history.length > 19){
      while(history.length > 19) history.shift()
    }
    history.push({rank: rank, time: timeNow, timeInt: timeNow.getTime()})
    await mongo.set('shardRankHist', {_id: pId}, {[tempName]: history})
  }catch(e){
    console.error(e)
  }
}
