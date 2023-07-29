'use strict'
module.exports = async(data, shard)=>{
  try{
    let content
    if(data.oldName != data.newName){
      if(!content) content = ''
      content += 'Player name change '+(data.emoji ? data.emoji+' ':'')+data.oldName+' -> '+(data.emoji ? data.emoji+' ':'')+data.newName+'\n'
    }
    if(data.oldOffSet != data.newOffSet){
      const oldTimeTillPO = await HP.TimeTillPayout(data.oldOffSet, shard.type)
      const newTimeTillPO = await HP.TimeTillPayout(data.newOffSet, shard.type)
      if(!content) content = ''
      content += 'Player '+(data.emoji ? data.emoji+' ':'')+data.newName
      if(oldTimeTillPO && newTimeTillPO){
        content += ' time till po change '+oldTimeTillPO[0]+' -> '+newTimeTillPO[0]
      }else{
        content += ' po time change'
      }
      content += '\n'
    }
    //if(content && shard.adminMsg == 'channel' && shard.adminChannel) MSG.SendMsg({chId: shard.adminChannel}, {content: content})
    //if(content && shard.adminMsg == 'dm' && shard.adminUser) MSG.SendDM(shard.adminUser, {content: content})
    if(content && shard.adminMsg == 'channel' && shard.adminChannel) HP.DiscordMsg({ sId: shard.sId }, {
      chId: shard.adminChannel,
      method: 'sendMsg',
      msg: {content: content}
    })
    if(content && shard.adminMsg == 'dm' && shard.adminUser) HP.DiscordMsg({shardId: 0}, {
      dId: shard.adminUser,
      method: 'sendDM',
      msg: {content: content}
    })
  }catch(e){
    console.error(e)
  }
}
