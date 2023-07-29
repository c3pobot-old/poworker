'use strict'
module.exports = async(obj = [])=>{
  try{
    if(obj.length > 0){
      for(let i in obj){
        const embedMsg = {
          color: 3066993,
          description: HP.GetShardName(obj[i])+' Arena Rank Watch\nThe player at rank '+obj[i].rank+' has moved',
        }
        //MSG.SendDM(obj[i].dId, {embed: embedMsg})
        HP.DiscordMsg({shardId: 0}, {method: 'sendDM', dId: obj[i].dId, msg: {embeds: [embedMsg]}})
        mongo.del('shardWatch', {_id: obj[i]._id})
      }
    }
  }catch(e){
    console.error(e)
  }
}
