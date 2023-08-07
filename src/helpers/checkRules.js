'use strict'
const log = require('logger')
const mongo = require('mongoapiclient')
const checkEarlyHit = require('./checkEarlyHit')
const checkEnemyHit = require('./checkEnemyHit')
const checkEnemySkip = require('./checkEnemySkip')
const getDiscordId = require('./getDiscordId')
const sorter = require('json-array-sorter')
const discordMsg = require('./discordMsg')
const deepCopy = require('./deepCopy')
module.exports = async(shardId, obj = [], ranks = [])=>{
  try{
    let rules
    let shard = (await mongo.find('payoutServers', {_id: shardId}, {rules: 1, sId: 1}))[0]
    if(shard && shard.rules) rules = shard.rules
    if(rules && obj.length > 0){
      let tempEmbeds = {}
      ranks = sorter([{column: 'oldRank', order: 'ascending'}], ranks.filter(x=> rules.enemy.some(r=>r == x.emoji)))
      for(let i in obj){
        if((!obj[i].emoji || rules.enemy.filter(x=>x == obj[i].emoji).length == 0) && obj[i].swap){
          let discordId = await getDiscordId(obj[i])
          if(obj[i].swap && obj[i].swap.emoji && rules.enemy.filter(x=>x == obj[i].swap.emoji).length > 0){
            let enemyHitMsg = await checkEnemyHit(rules.enemyHits, obj[i])
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
                      discordMsg({sId: shard.sId}, {method: 'sendDM', dId: discordId, msg: {embeds:[enemyHitMsg]}})
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
            let earlyHitMsg = await checkEarlyHit(rules.earlyHits, obj[i], (rules['top-rank'] || 2), tempHits, rules.enemySkips)
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
                      discordMsg({sId: shard.sId}, {method: 'sendDM', dId: discordId, msg: {embeds:[earlyHitMsg]}})
                    }
                  }
                }
              }
            }
            if(!earlyHit){
              let enemySkipMsg = await checkEnemySkip(rules.enemySkips, obj[i], tempHits, (rules['top-rank'] || 2))
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
                        DiscordMsg({sId: shard.sId}, {method: 'sendDM', dId: discordId, msg: {embeds:[earlyHitMsg]}})
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      let embeds = Object.values(tempEmbeds)
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
                discordMsg({sId: shard.sId}, { method: 'sendMsg', chId: embeds[i].chId, msg: deepCopy(msg2send) })
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
    log.error(e)
  }
}
