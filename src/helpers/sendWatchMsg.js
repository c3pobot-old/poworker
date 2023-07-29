'use strict'
module.exports = async(watch, obj = [], shard = {})=>{
  try{
    if(obj.length > 0){
      const watchObj = {}
      const shardName = HP.GetShardName(obj[0])
      for(let i in obj){
        if(watch[obj[i].allyCode] && obj[i].poHour >= 0){
          const tempWatch = watch[obj[i].allyCode]
          if(tempWatch.startTime > obj[i].poHour || (tempWatch.startRank && tempWatch.startRank > obj[i].rank)){
            if(tempWatch.moveDir == 'both' || (tempWatch.moveDir == 'up' && obj[i].oldRank > obj[i].rank) || (tempWatch.moveDir == 'down' && obj[i].oldRank < obj[i].rank)){
              if(!watchObj[tempWatch.chId]) watchObj[tempWatch.chId] = ''
              watchObj[tempWatch.chId] += (tempWatch.roleId ? '<@&'+tempWatch.roleId+'> ':'')+shardName+' Watch : '+(obj[i].emoji ? obj[i].emoji+' ':'')+'**'+obj[i].name+'** '+(obj[i].rank > obj[i].oldRank ? 'dropped':'climbed')+' from **'+obj[i].oldRank+'** to **'+obj[i].rank+'**\n'
            }
          }
        }
      }
      for(let i in watchObj){
        //MSG.SendMsg({chId: i}, {content: watchObj[i]})
        HP.DiscordMsg({sId: shard.sId}, {method: 'sendMsg', chId: i, msg: {content: watchObj[i]}})
      }
    }
  }catch(e){
    console.error(e)
  }
}
