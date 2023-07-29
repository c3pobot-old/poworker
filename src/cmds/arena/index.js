const SyncPlayers = require('./syncPlayers')
const sleep = (ms = 2000)=>{
  return new Promise(resolve=>{
    setTimeout(resolve, ms)
  })
}
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
        let guild = await Client.queryGuild(guilds[i].id)
        if(guild?.guild?.member?.length > 0) await SyncPlayers(guild.guild.member, guilds[i].chId, guilds[i].sId)
      }
    }
    if(users?.length > 0) await SyncPlayers(users, patreon.logChannel, patreon.sId)
    //await sleep()
  }catch(e){
    console.error(e)
  }
}
