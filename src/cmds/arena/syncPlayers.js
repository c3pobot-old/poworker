'use strict'
const CheckArena = require('./checkArena')
module.exports = async(players = [], chId, sId)=>{
  try{
    let data
    if(players.length > 0) data = await Client.fetchArenaPlayers({players: players})
    if(data?.length > 0) await CheckArena(data, chId, sId)
  }catch(e){
    console.error(e)
  }
}
