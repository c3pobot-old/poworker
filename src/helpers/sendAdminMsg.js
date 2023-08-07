'use strict'
const log = require('logger')
const discordMsg = require('./discordMsg')
const timeTillPayout = require('./timeTillPayout')
module.exports = async(data = {}, shard = {})=>{
  try{
    let content
    if(data.oldName != data.newName){
      if(!content) content = ''
      content += 'Player name change '+(data.emoji ? data.emoji+' ':'')+data.oldName+' -> '+(data.emoji ? data.emoji+' ':'')+data.newName+'\n'
    }
    if(data.oldOffSet != data.newOffSet){
      const oldTimeTillPO = timeTillPayout(data.oldOffSet, shard.type)
      const newTimeTillPO = timeTillPayout(data.newOffSet, shard.type)
      if(!content) content = ''
      content += 'Player '+(data.emoji ? data.emoji+' ':'')+data.newName
      if(oldTimeTillPO && newTimeTillPO){
        content += ' time till po change '+oldTimeTillPO[0]+' -> '+newTimeTillPO[0]
      }else{
        content += ' po time change'
      }
      content += '\n'
    }
    if(content && shard.adminMsg == 'channel' && shard.adminChannel) discordMsg({ sId: shard.sId }, {
      chId: shard.adminChannel,
      method: 'sendMsg',
      msg: {content: content}
    })
    if(content && shard.adminMsg == 'dm' && shard.adminUser) discordMsg({sId: shard.sId}, {
      dId: shard.adminUser,
      method: 'sendDM',
      msg: {content: content}
    })
  }catch(e){
    log.error(e)
  }
}
