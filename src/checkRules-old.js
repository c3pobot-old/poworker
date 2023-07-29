Cmds.CheckRules = async(rules, obj = [], ranks = [])=>{
  try{
    let embeds = []
    if(obj.length > 0 && rules.chId && rules.status){
      const timeNow = Date.now()
      for(let i in obj){
        if(rules.enemy.filter(x=>x == obj[i].emoji).length == 0 && obj[i].swap){
          if(obj[i].swap.emoji && rules.enemy.filter(x=>x == obj[i].swap.emoji).length > 0){
            if(rules.enemyHits){
              embeds.push({color: 3066993, description: 'Good Job!\n'+(obj[i].emoji ? obj[i].emoji+' ':'')+obj[i].name+' dropped '+(obj[i].swap.emoji ? obj[i].swap.emoji+' ':'')+obj[i].swap.name+' from **'+obj[i].rank+'** to **'+obj[i].oldRank+'**'})
              mongo.math('shardHitList', {_id: obj[i].allyCode+'-'+obj[i].shardId, shardId: obj[i].shardId}, {enemy: 1})
            }
          }else{
            const timeTillPO = await HP.TimeTillPayout(obj[i].swap.poOffSet, obj[i].type)
            let tempHits = await sorter([{column: 'oldRank', order: 'ascending'}], ranks.filter(x=>x.oldRank > obj[i].rank && x.oldRank < obj[i].oldRank))
            if(rules.earlyHits){
              if(timeTillPO && timeTillPO.length > 0){
                const timeDiff = rules.hour * 3600000
                if((timeTillPO[1] > timeNow) && timeDiff > (timeTillPO[1] - timeNow)){
                  const embedMsg = {
                    color: 15158332,
                    description: '**Early hit** on a friendly within **'+rules.hour+'** hours of payout!\n'+(obj[i].emoji ? obj[i].emoji+' ':'')+'**'+obj[i].name+'** dropped '+(obj[i].swap.emoji ? obj[i].swap.emoji+' ':'')+obj[i].swap.name+' from **'+obj[i].rank+'** to **'+obj[i].oldRank+'**\n'
                  }
                  let tempEnemy = 'Possible enemies could have hit :\n', count = 0
                  for(let e in tempHits){
                    if(rules.enemy.filter(x=>x == tempHits[e].emoji).length > 0){
                      count++
                      tempEnemy += '`'+tempHits[e].oldRank.toString().padStart(3, ' ')+'` : '+(tempHits[e].emoji)+' '+tempHits[e].name+'\n'
                    }
                  }
                  if(count) embedMsg.description += tempEnemy
                  mongo.math('shardHitList', {_id: obj[i].allyCode+'-'+obj[i].shardId, shardId: obj[i].shardId}, {early: 1})
                  embeds.push(embedMsg)
                }
              }
            }
            if(rules.enemySkips){
              const skippedEnemy = []
              for(let e in tempHits){
                if(rules.enemy.filter(x=>x == tempHits[e].emoji).length > 0 && (obj[i].rank + 2) >= tempHits[e].oldRank) skippedEnemy.push(tempHits[e])
              }
              if(skippedEnemy.length > 0){
                const embedMsg = {
                  color: 15158332,
                  description: '**Hit on a friendly** when enemy was within **2** ranks of friendly!\n'+(obj[i].emoji ? obj[i].emoji+' ':'')+'**'+obj[i].name+'** dropped '+(obj[i].swap.emoji ? obj[i].swap.emoji+' ':'')+obj[i].swap.name+' from **'+obj[i].rank+'** to **'+obj[i].oldRank+'**\n'
                }
                embedMsg.description += 'Possible enemies could have hit :\n'
                for(let e in skippedEnemy) embedMsg.description += '`'+skippedEnemy[e].oldRank.toString().padStart(3, ' ')+'` : '+(skippedEnemy[e].emoji)+' '+skippedEnemy[e].name+'\n'
                mongo.math('shardHitList', {_id: obj[i].allyCode+'-'+obj[i].shardId, shardId: obj[i].shardId}, {enemySkip: 1})
                embeds.push(embedMsg)
              }
            }
          }
        }
      }
    }
    if(embeds.length > 0 && rules.chId){
      let msg2Send = {embeds: []}, count = 0
      for(let i in embeds){
        if(msg2Send.embeds.length < 10) msg2Send.embeds.push(embeds[i])
        count++
        if(+i + 1 == embeds.length) count = 10
        if(count == 10){
          MSG.SendMsg({chId: rules.chId}, JSON.parse(JSON.stringify(msg2Send)))
          msg2Send.embeds = []
          count = 0
        }
      }
    }
  }catch(e){
    console.error(e)
  }
}
