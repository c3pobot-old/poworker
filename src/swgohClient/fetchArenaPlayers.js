'use strict'
const apiRequest = require('./apiRequest')
const formatArenaPlayer = require('./formatArenaPlayer')
const getArenaPlayer = async(payload = {})=>{
  try{
    if(payload.playerId) delete payload.allyCode
    let obj = await apiRequest('playerArena', payload)
    if(obj?.allyCode) return formatArenaPlayer(obj)
  }catch(e){
    throw(e);
  }
}
module.exports = async(opts = { players: []})=>{
  try{
    let array = [], res = [], i = opts.players.length
    const getPlayer = async(payload = {})=>{
      try{
        let player = await getArenaPlayer(payload)
        if(player?.allyCode) res.push(player)
      }catch(e){
        throw(e)
      }
    }
    while(i--) array.push(getPlayer({allyCode: opts.players[i]?.allyCode?.toString(), playerId: opts.players[i]?.playerId}))
    await Promise.all(array)
    return res
  }catch(e){
    throw(e);
  }
}
