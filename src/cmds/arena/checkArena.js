'use strict'
const { eachLimit } = require('async')
const mongo = require('mongoapiclient')
const SyncRank = require('./syncRank')
const MAX_SYNC = process.env.MAX_SYNC || 20
module.exports = async(players = [], chId = null, sId)=>{
  try{
    let allyCodes = players.map(u=>u.allyCode)
    let rankCache = await mongo.find('rankCache', {allyCode: {$in: allyCodes}})
    let pSettings = await mongo.find('arena', {allyCode: {$in: allyCodes}})
    if(rankCache && pSettings){
      await eachLimit(players, MAX_SYNC, async(p)=>{
        const oldData = rankCache.find(x=>x._id == p.playerId)
        const pObj = pSettings.find(x=>x._id == p.playerId)
        await SyncRank(p, oldData, pObj, chId, sId)
      })
    }
  }catch(e){
    throw(e)
  }
}
