'use strict'
const Cmds = require('./modules/utils/helper')
const CheckEnemyHit = async(rule = {}, obj)=>{
  try{
    if(rule.status){
      mongo.math('shardHitList', {_id: obj.allyCode+'-'+obj.shardId, shardId: obj.shardId}, {enemy: 1})
      return {color: 3066993, description: 'Good Job!\n'+(obj.emoji ? obj.emoji+' ':'')+obj.name+' climbed from **'+obj.oldRank+'** to **'+obj.rank+'** and dropped '+(obj.swap.emoji ? obj.swap.emoji+' ':'')+obj.swap.name}
    }
  }catch(e){
    console.error(e)
  }
}
const CheckEarlyHit = async(rule = {}, obj, checkEnemy = 2, ranks = [], enemySkips = {})=>{
  try{
    if(rule.status && obj.swap){
      const timeTillPO = await HP.TimeTillPayout(obj.swap.poOffSet, obj.type)
      const pTimeTillPO = await HP.TimeTillPayout(obj.poOffSet, obj.type)
      if(!rule.closer || (rule.closer && (pTimeTillPO[1] > timeTillPO[1] || obj.swap.poOffSet == obj.poOffSet))){
        const timeNow = Date.now()
        const timeDiff = rule.hour * 3600000
        if((timeTillPO[1] > timeNow) && timeDiff > (timeTillPO[1] - timeNow)){
          const embedMsg = {
            color: 15158332,
            description: '**Early hit** on a friendly within **'+rule.hour+'** hours of payout!\n'+(obj.emoji ? obj.emoji+' ':'')+'**'+obj.name+'** climbed from **'+obj.oldRank+'** to **'+obj.rank+'** and dropped '+(obj.swap.emoji ? obj.swap.emoji+' ':'')+'**'+obj.swap.name+'**\n'
          }
          if(checkEnemy && ranks.length > 0){
            let tempEnemy = 'Possible enemies could have hit :\n'
            for(let i in ranks) tempEnemy += '`'+ranks[i].oldRank.toString().padStart(3, ' ')+'` : '+(ranks[i].emoji)+' '+ranks[i].name+'\n'
            embedMsg.description += tempEnemy
            if(enemySkips.status) mongo.math('shardHitList', {_id: obj.allyCode+'-'+obj.shardId, shardId: obj.shardId}, {enemySkip: 1})
          }
          mongo.math('shardHitList', {_id: obj.allyCode+'-'+obj.shardId, shardId: obj.shardId}, {early: 1})
          return embedMsg
        }
      }
    }
  }catch(e){
    console.error(e)
  }
}
const CheckEnemySkip = async(rule = {}, obj, ranks = [], rank = 2)=>{
  try{
    if(rule.status && ranks.length > 0){
      const embedMsg = {
        color: 15158332,
        description: '**Hit on a friendly** when enemy was within **'+rank+'** ranks of friendly!\n'+(obj.emoji ? obj.emoji+' ':'')+'**'+obj.name+'** climbed from **'+obj.oldRank+'** to **'+obj.rank+'** and dropped '+(obj.swap.emoji ? obj.swap.emoji+' ':'')+'**'+obj.swap.name+'**\n'
      }
      embedMsg.description += 'Possible enemies could have hit :\n'
      for(let i in ranks) embedMsg.description += '`'+ranks[i].oldRank.toString().padStart(3, ' ')+'` : '+(ranks[i].emoji)+' '+ranks[i].name+'\n'
      mongo.math('shardHitList', {_id: obj.allyCode+'-'+obj.shardId, shardId: obj.shardId}, {enemySkip: 1})
      return embedMsg
    }
  }catch(e){
    console.error(e)
  }
}
Cmds.CheckRules = async(shardId, obj = [], ranks = [])=>{
  try{
    let rules
    const shard = (await mongo.find('payoutServers', {_id: shardId}, {rules: 1}))[0]
    if(shard && shard.rules) rules = shard.rules
    if(rules && obj.length > 0){
      const tempEmbeds = {}
      ranks = await sorter([{column: 'oldRank', order: 'ascending'}], ranks.filter(x=> rules.enemy.some(r=>r == x.emoji)))
      for(let i in obj){
        if((!obj[i].emoji || rules.enemy.filter(x=>x == obj[i].emoji).length == 0) && obj[i].swap){
          const discordId = await HP.GetDiscordId(obj[i])
          if(obj[i].swap && obj[i].swap.emoji && rules.enemy.filter(x=>x == obj[i].swap.emoji).length > 0){
            const enemyHitMsg = await CheckEnemyHit(rules.enemyHits, obj[i])
            if(enemyHitMsg && enemyHitMsg.color && rules.enemyHits && rules.enemyHits.chId){
              if(!tempEmbeds[rules.enemyHits.chId]) tempEmbeds[rules.enemyHits.chId] = {chId: rules.enemyHits.chId, msgs: []}
              if(tempEmbeds[rules.enemyHits.chId]){
                tempEmbeds[rules.enemyHits.chId].msgs.push(enemyHitMsg)
                if(rules.enemyHits && rules.enemyHits.roleId){
                  if(!tempEmbeds[rules.enemyHits.chId].content) tempEmbeds[rules.enemyHits.chId].content = ''
                  tempEmbeds[rules.enemyHits.chId].content += '<@&'+rules.enemyHits.roleId+'> '
                }
                if(rules.enemyHits.notify && rules.enemyHits.notify != 'disabled'){
                  if(discordId){
                    if(rules.enemyHits.notify == 'channel'){
                      if(!tempEmbeds[rules.enemyHits.chId].content) tempEmbeds[rules.enemyHits.chId].content = ''
                      tempEmbeds[rules.enemyHits.chId].content += '<@'+discordId+'> '
                    }else{
                      MSG.SendDM(discordId, {embeds:[enemyHitMsg]})
                    }
                  }
                }
              }
            }
          }else{
            let tempHits = ranks.filter(x=>x.oldRank > obj[i].rank && x.oldRank < obj[i].oldRank)
            tempHits = tempHits.filter(x=>((rules['top-rank'] ? rules['top-rank']:2) + obj[i].rank) >= x.oldRank)
            if(rules['bottom-rank'] && (obj[i].oldRank -  rules['bottom-rank']) > 0) tempHits = tempHits.filter(x=>(obj[i].oldRank -  rules['bottom-rank']) > x.oldRank)
            let earlyHit = 0
            const earlyHitMsg = await CheckEarlyHit(rules.earlyHits, obj[i], (rules['top-rank'] || 2), tempHits, rules.enemySkips)
            if(earlyHitMsg && earlyHitMsg.color && rules.earlyHits && rules.earlyHits.chId){
              earlyHit++
              if(!tempEmbeds[rules.earlyHits.chId]) tempEmbeds[rules.earlyHits.chId] = {chId: rules.earlyHits.chId, msgs: []}
              if(tempEmbeds[rules.earlyHits.chId]){
                tempEmbeds[rules.earlyHits.chId].msgs.push(earlyHitMsg)
                if(rules.earlyHits && rules.earlyHits.roleId){
                  if(!tempEmbeds[rules.earlyHits.chId].content) tempEmbeds[rules.earlyHits.chId].content = ''
                  tempEmbeds[rules.earlyHits.chId].content += '<@&'+rules.earlyHits.roleId+'> '
                }
                if(rules.earlyHits.notify && rules.earlyHits.notify != 'disabled'){
                  if(discordId){
                    if(rules.earlyHits.notify == 'channel'){
                      if(!tempEmbeds[rules.earlyHits.chId].content) tempEmbeds[rules.earlyHits.chId].content = ''
                      tempEmbeds[rules.earlyHits.chId].content += '<@'+discordId+'> '
                    }else{
                      MSG.SendDM(discordId, {embeds:[earlyHitMsg]})
                    }
                  }
                }
              }
            }
            if(!earlyHit){
              const enemySkipMsg = await CheckEnemySkip(rules.enemySkips, obj[i], tempHits, (rules['top-rank'] || 2))
              if(enemySkipMsg && enemySkipMsg.color && rules.enemySkips && rules.enemySkips.chId){
                if(!tempEmbeds[rules.enemySkips.chId]) tempEmbeds[rules.enemySkips.chId] = {chId: rules.enemySkips.chId, msgs: []}
                if(tempEmbeds[rules.enemySkips.chId]){
                  tempEmbeds[rules.enemySkips.chId].msgs.push(enemySkipMsg)
                  if(rules.enemySkips && rules.enemySkips.roleId){
                    if(!tempEmbeds[rules.enemySkips.chId].content) tempEmbeds[rules.enemySkips.chId].content = ''
                    tempEmbeds[rules.enemySkips.chId].content += '<@&'+rules.enemySkips.roleId+'> '
                  }
                  if(rules.enemySkips.notify && rules.enemySkips.notify != 'disabled'){
                    if(discordId){
                      if(rules.enemySkips.notify == 'channel'){
                        if(!tempEmbeds[rules.enemySkips.chId].content) tempEmbeds[rules.enemySkips.chId].content = ''
                        tempEmbeds[rules.enemySkips.chId].content += '<@'+discordId+'> '
                      }else{
                        MSG.SendDM(discordId, {embeds:[earlyHitMsg]})
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      const embeds = Object.values(tempEmbeds)
      if(embeds.length > 0){
        for(let i in embeds){
          if(embeds[i].chId && embeds[i].msgs && embeds[i].msgs.length > 0){
            let msg2send = {embeds: []}, count = 0
            if(embeds[i].content) msg2send.content = embeds[i].content
            for(let m in embeds[i].msgs){
              if(msg2send.embeds.length < 10) msg2send.embeds.push(embeds[i].msgs[m])
              count++;
              if(+m + 1 == embeds[i].msgs.length && count < 10) count = 10
              if(count == 10){
                MSG.SendMsg({chId: embeds[i].chId}, JSON.parse(JSON.stringify(msg2send)))
                delete msg2send.content
                msg2send.embeds = []
                count = 0
              }
            }
          }
        }
      }
    }
  }catch(e){
    console.error(e)
  }
}
Cmds.debugMsg = (obj)=>{
  try{
    const tempObj = {status: 'failed'}
    if(obj && obj.debugMsg >= 0){
      debugMsg = +obj.debugMsg
      console.log('debug has been turned '+(debugMsg == 1 ? 'on':'off'))
      tempObj.status = 'ok'
    }
    return tempObj
  }catch(e){
    console.error(e)
    return({status: 'error'})
  }
}
Cmds.GetDiscordId = async(obj)=>{
  try{
    let discordId = obj.dId, dObj
    if(!discordId && obj.allyCode) dObj = (await mongo.find('discordId', {'allyCodes.allyCode': +obj.allyCode}))[0]
    if(dObj) discordId = dObj._id
    return discordId
  }catch(e){
    console.error(e)
  }
}
Cmds.GetShard = async(shardId)=>{
  if(shardId) return (await mongo.find('payoutServers', {_id: shardId}))[0]
}
Cmds.PayoutRotations = async(obj)=>{
  try{
    const poHour = await HP.GetPOHour(obj.poOffSet, obj.type)
    if(poHour > obj.startTime && obj.notifyStart == 1){
      await mongo.set('shardRotations', {_id: obj.shardId}, {[obj.id+'.notifyStart']: 0})
    }
    if(obj.startTime > poHour && obj.notifyStart == 0){
      const msg2send = await HP.GetRotation(obj)
      if(msg2send){
        const firstPlace = obj.players.shift()
        obj.players.push(firstPlace)
        mongo.set('shardRotations', {_id: obj.shardId}, {[obj.id+'.players']: obj.players, [obj.id+'.notifyStart']: 1})
        MSG.SendMsg({chId: obj.chId}, {content: msg2send})
      }
    }
  }catch(e){
    console.error(e)
  }
}
Cmds.RankWatchNotify = async(obj = [])=>{
  try{
    if(obj.length > 0){
      for(let i in obj){
        const embedMsg = {
          color: 3066993,
          description: HP.GetShardName(obj[i])+' Arena Rank Watch\nThe player at rank '+obj[i].rank+' has moved',
        }
        MSG.SendDM(obj[i].dId, {embed: embedMsg})
        mongo.del('shardWatch', {_id: obj[i]._id})
      }
    }
  }catch(e){
    console.error(e)
  }
}
Cmds.NotifyPO = async(obj)=>{
  try{
    const discordId = await HP.GetDiscordId(obj)
    if(discordId){
      const embedMsg = {
        color: 15844367,
        description: HP.GetShardName(obj)+' Arena Logs\n'+(obj.emoji ? obj.emoji:'')+' **'+obj.name+'** payout at Rank **' + obj.rank + '**'
      }
      MSG.SendDM(discordId, {embed: embedMsg})
    }
  }catch(e){
    console.error(e)
  }
}
Cmds.NotifyRankChange = async(obj)=>{
  try{
    if(obj.rank > obj.oldRank || obj.climb){
      const discordId = await HP.GetDiscordId(obj)
      if(discordId){
        const embedMsg = {
          color: obj.rank > obj.oldRank ? 15158332 : 3066993,
          description: HP.GetShardName(obj)+' Arena Logs\n'+(obj.emoji ? obj.emoji+' ':'')+'**'+obj.name+'** '
        }
        embedMsg.description += (obj.rank > obj.oldRank ? 'dropped':'climbed')+' from **'+obj.oldRank+'** to **'+obj.rank+'**.\n'
        if(obj.swap){
          embedMsg.description += (obj.rank > obj.oldRank ? 'Bumped by':'Dropped')+' '+(obj.swap.emoji ? obj.swap.emoji+' ':'')+'**'+obj.swap.name+'**'
        }
        MSG.SendDM(discordId, {embed: embedMsg})
      }
    }
  }catch(e){
    console.error(obj)
  }
}
Cmds.NotifyStart = async(obj)=>{
  try{
    const discordId = await HP.GetDiscordId(obj)
    if(discordId){
      const embedMsg = {
        color: 15844367,
        description: 'Starting notifications of rank drops in **'+HP.GetShardName(obj)+'**.\nCurrent Rank **'+obj.rank+'**'
      }
      MSG.SendDM(discordId, {embed: embedMsg})
    }
  }catch(e){
    console.error(e)
  }
}
Cmds.SendAdminMsg = async(data, shard)=>{
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
    if(content && shard.adminMsg == 'channel' && shard.adminChannel) MSG.SendMsg({chId: shard.adminChannel}, {content: content})
    if(content && shard.adminMsg == 'dm' && shard.adminUser) MSG.SendDM(shard.adminUser, {content: content})
  }catch(e){
    console.error(e)
  }
}
Cmds.SendEnemyWatchMsg = async(watch, obj = [])=>{
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
      if(content) MSG.SendMsg({chId: watch.chId}, {content: content})
    }
  }catch(e){
    console.error(e)
  }
}
Cmds.SendWatchMsg = async(watch, obj = [])=>{
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
        MSG.SendMsg({chId: i}, {content: watchObj[i]})
      }
    }
  }catch(e){
    console.error(e)
  }
}
Cmds.SendPayoutMsg = async(chId, obj = [])=>{
  try{
    if(chId && obj.length > 0){
      const sortedObj = await sorter([{column: 'rank', order: 'ascending'}], obj)
      let content, shardName = HP.GetShardName(sortedObj[0])
      const embedMsg = {
        color: 15844367,
        description: shardName + ' Arena Logs Payouts\n'
      }
      for(let i in sortedObj){
        embedMsg.description += '`'+sortedObj[i].rank.toString().padStart(3, ' ')+'` '+(sortedObj[i].emoji ? sortedObj[i].emoji+' ':'')+'**'+sortedObj[i].name+'**\n'
        if(sortedObj[i].poNotify && sortedObj[i].method == 'log'){
          const discordId = await HP.GetDiscordId(sortedObj[i])
          if(discordId){
            if(!content) content = ''
            content += '<@'+discordId+'> your payout for '+shardName+' Arena. Rank **'+sortedObj[i].rank+'**\n'
          }
        }
      }
      MSG.SendMsg({chId: chId}, {content: content, embed: embedMsg})
    }
  }catch(e){
    console.error(e)
  }
}
Cmds.SendStartMsg = async(chId, obj = [])=>{
  try{
    if(chId && obj.length > 0){
      let content
      for(let i in obj){
        const discordId = await HP.GetDiscordId(obj[i])
        if(discordId){
          if(!content) content = ''
          content += '<@' + discordId + '> Starting notifications of rank drops in **' + (obj[i].type == 'char' ? 'Squad':'Fleet') + '** arena. Current Rank **' + obj[i].rank + '**\n'
        }
      }
      MSG.SendMsg({chId: chId}, {content: content})
    }
  }catch(e){
    console.error(e)
  }
}
Cmds.SendRankChange = async(obj)=>{
  try{
    if(obj.chId){
      let content, shardName = HP.GetShardName(obj)
      const embedMsg = {
        color: obj.rank > obj.oldRank ? 15158332 : 3066993,
        description: shardName+' Arena Logs\n'+(obj.emoji ? obj.emoji+' ':'')+'**'+obj.name+'** '
      }
      embedMsg.description += (obj.rank > obj.oldRank ? 'dropped':'climbed')+' from **'+obj.oldRank+'** to **'+obj.rank+'**.\n'
      if(obj.swap){
        embedMsg.description += (obj.rank > obj.oldRank ? 'Bumped by':'Dropped')+' '+(obj.swap.emoji ? obj.swap.emoji+' ':'')+'**'+obj.swap.name+'**'
      }
      if(obj.notify && obj.method == 'log' && (obj.rank > obj.oldRank || obj.climb)){
        const discordId = await HP.GetDiscordId(obj)
        if(discordId){
          if(!content) content = ''
          content += '<@'+discordId+'> '+(obj.rank > obj.oldRank ? 'your rank dropped':'climbed')+' in '+shardName+' arena from **'+obj.oldRank+'** to **'+obj.rank+'**\n'
        }
      }
      if(obj.rankWatch && obj.rankWatch.length > 0){
        if(!content) content = ''
        for(let i in obj.rankWatch){
          content += '<@'+obj.rankWatch[i].dId+'> the player at rank **'+obj.oldRank+'** has moved.\n'
          mongo.del('shardWatch', {_id: obj.rankWatch[i]._id})
        }
      }
      if(obj.enemyWatch && obj.enemyWatch.notify){
        if(obj.rank < obj.enemyWatch.startRank && obj.rank < obj.oldRank && (obj.enemyWatch.status == 'all' || obj.oldRank > obj.enemyWatch.startRank)){
          if(!content) content = ''
          if(obj.enemyWatch.roleId) content += '<@&'+obj.enemyWatch.roleId+'> '
          content += shardName+' Enemy Watch: '
          content += (obj.emoji ? obj.emoji+' ':'')+'**'+obj.name+'** climbed '
          if(obj.enemyWatch.status == 'all'){
            content += 'from **'+obj.oldRank+'** to '
          }else{
            content += ' past **'+obj.enemyWatch.startRank+'**. New rank '
          }
          content += '**'+obj.rank+'**\n'
        }
      }
      if(obj.watch && obj.poHour >= 0){
        if(obj.watch.startTime > obj.poHour || (obj.watch.startRank && obj.watch.startRank > obj.rank)){
          if(obj.watch.moveDir == 'both' || (obj.watch.moveDir == 'up' && obj.oldRank > obj.rank) || (obj.watch.moveDir == 'down' && obj.oldRank < obj.rank)){
            if(!content) content = ''
            content += (obj.watch.roleId ? '<@&'+obj.watch.roleId+'> ':'')+shardName+' Watch : '+(obj.emoji ? obj.emoji+' ':'')+'**'+obj.name+'** '+(obj.rank > obj.oldRank ? 'dropped':'climbed')+' from **'+obj.oldRank+'** to **'+obj.rank+'**\n'
          }
        }
      }
      MSG.SendMsg({chId: obj.chId}, {content: content, embed: embedMsg})
    }
  }catch(e){
    console.error(e)
  }
}
Cmds.UpdateUnitsList = async()=>{
  try{
    const units = await redis.get('bot-units')
    if(units && units.length > 0) unitList = units
  }catch(e){
    console.error(e)
  }
}
Cmds.UpdatePayHistory = async(pId, type, rank)=>{
  try{
    const timeNow = new Date()
    const tempName = 'po.'+type
    let history = []
    const rankHistory = (await mongo.find('shardRankHist', {_id: pId}))[0]
    if(rankHistory && rankHistory.po && rankHistory.po[type]) history = rankHistory.po[type]
    if(history.length > 19){
      while(history.length > 19) history.shift()
    }
    history.push({rank: rank, time: timeNow, timeInt: timeNow.getTime()})
    await mongo.set('shardRankHist', {_id: pId}, {[tempName]: history})
  }catch(e){
    console.error(e)
  }
}
Cmds.UpdateRankHistory = async(pId, type, rank)=>{
  try{
    const timeNow = new Date()
    const tempName = 'ranks.'+type
    let history = []
    const rankHistory = (await mongo.find('shardRankHist', {_id: pId}))[0]
    if(rankHistory && rankHistory.ranks && rankHistory.ranks[type]) history = rankHistory.ranks[type]
    if(history.length > 19){
      while(history.length > 19) history.shift()
    }
    history.push({rank: rank, time: timeNow, timeInt: timeNow.getTime()})
    await mongo.set('shardRankHist', {_id: pId}, {[tempName]: history})
  }catch(e){
    console.error(e)
  }
}
module.exports = Cmds
