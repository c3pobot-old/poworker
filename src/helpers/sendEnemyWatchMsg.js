'use strict'
module.exports = async(watch, obj = [], shard = {})=>{
  try{
    if(obj.length > 0 && watch.notify){
      let content
      for(let i in obj){
        if(obj[i].rank < watch.startRank && obj[i].rank < obj[i].oldRank && (watch.status == 'all' || obj[i].oldRank >= watch.startRank)){
          if(!content) content = (watch.roleId ? '<@&'+watch.roleId+'> ':'')+HP.GetShardName(obj[i])+' Enemy Watch : \n'
          content += (obj[i].emoji ? obj[i].emoji+' ':'')+'**'+obj[i].name+'** climbed '
          if(watch.status == 'all'){
            content += 'from **'+obj[i].oldRank+'** to '
          }else{
            content += ' past **'+watch.startRank+'**. New rank '
          }
          content += '**'+obj[i].rank+'**\n'
        }
      }
      //if(content) MSG.SendMsg({chId: watch.chId}, {content: content})
      if(content) HP.DiscordMsg({sId: shard.sId}, {method: 'sendMsg', chId: watch.chId, msg: {content: content}})
    }
  }catch(e){
    console.error(e)
  }
}
