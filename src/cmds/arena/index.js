'use strict'
const log = require('logger')
const SyncPlayers = require('./syncPlayers')
const swgohClient = require('swgohClient')
const mongo = require('mongoapiclient')
module.exports = async(data = {})=>{
  try{
    let patreon, players = [], guilds = [], users = []
    if(data.dId){
      patreon = (await mongo.find('patreon', {_id: data.dId}))[0]
    }
    if(patreon?.guilds) guilds = Object.values(patreon.guilds)
    if(patreon?.users) users = Object.values(patreon.users)
    if(guilds?.length > 0){
      for(let i in guilds){
        //console.log('starting sync for guild '+guilds[i].id)
        let guild = await swgohClient.queryGuild(guilds[i].id)
        if(guild?.guild?.member?.length > 0) await SyncPlayers(guild.guild.member, guilds[i].chId, guilds[i].sId)
      }
    }
    if(users?.length > 0) await SyncPlayers(users, patreon.logChannel, patreon.sId)
  }catch(e){
    throw(e)
  }
}
