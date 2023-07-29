'use strict'
const CheckEarlyHit = require('./checkEarlyHit')
const CheckEnemyHit = require('./checkEnemyHit')
const CheckEnemySkip = require('./checkEnemySkip')
const GetDiscordId = require('./getDiscordId')
module.exports = async(shardId, obj = [], ranks = [])=>{
  try{
    let rules
    const shard = (await mongo.find('payoutServers', {_id: shardId}, {rules: 1, sId: 1}))[0]
    if(shard && shard.rules) rules = shard.rules
    if(rules && obj.length > 0){
      const tempEmbeds = {}
      ranks = await sorter([{column: 'oldRank', order: 'ascending'}], ranks.filter(x=> rules.enemy.some(r=>r == x.emoji)))
      for(let i in obj){
        if((!obj[i].emoji || rules.enemy.filter(x=>x == obj[i].emoji).length == 0) && obj[i].swap){
          const discordId = await GetDiscordId(obj[i])
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
                      //MSG.SendDM(discordId, {embeds:[enemyHitMsg]})
                      HP.DiscordMsg({shardId: 0}, {method: 'sendDM', dId: discordId, msg: {embeds:[enemyHitMsg]}})
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
                      //MSG.SendDM(discordId, {embeds:[earlyHitMsg]})
                      HP.DiscordMsg({shardId: 0}, {method: 'sendDM', dId: discordId, msg: {embeds:[earlyHitMsg]}})
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
                        //MSG.SendDM(discordId, {embeds:[earlyHitMsg]})
                        HP.DiscordMsg({shardId: 0}, {method: 'sendDM', dId: discordId, msg: {embeds:[earlyHitMsg]}})
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
                //MSG.SendMsg({chId: embeds[i].chId}, JSON.parse(JSON.stringify(msg2send)))
                HP.DiscordMsg({sId: shard.sId}, {method: 'sendMsg', chId: embeds[i].chId, msg: JSON.parse(JSON.stringify(msg2send))})
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
