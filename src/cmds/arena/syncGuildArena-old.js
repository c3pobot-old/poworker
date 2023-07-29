'use strict'
const CheckArena = require('./checkArena')
module.exports = async(obj)=>{
  try{
    if(obj._id){
      const players = await Client.post('fetchGuildArena', {guildId: obj._id}, null)
      if(players && players.length > 0) await CheckArena(players, obj.chId);
    }
  }catch(e){
    console.error(e)
  }
}
