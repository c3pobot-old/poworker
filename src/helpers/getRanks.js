'use strict'
const { configMaps } = require('./configMaps')
const mongo = require('mongoapiclient')
const sorter = require('json-array-sorter')
const timeTillPayout = require('./timeTillPayout')
const getLeadName = require('./getLeadName')
const deepCopy = require('./deepCopy')
module.exports = async(obj, players = [], auto = false) => {
  try{
    if(players.length == 0) players = await mongo.find('shardRankCache', {shardId: obj._id}, {name: 1, poOffSet: 1, rank: 1, emoji: 1, arena: 1, allyCode: 1})
    if(players?.length > 0 ){
      if(auto && obj.rankLimit) players = players.filter(x=>obj.rankLimit >= x.rank)
      players = sorter([{column: 'rank', order: (obj.rankSort ? obj.rankSort:'ascending')}], players)
    }
    if(players?.length > 0){
      let msgFields = []
      let tempObj = {
        name: '---------------------------------',
        value: ''
      }
      let count = 0, msgCount = 0
      for(let p in players){
        tempObj.value +=  '`'+players[p].rank.toString().padStart(2, '0').padEnd(3, ' ')+' : '+(await timeTillPayout(players[p].poOffSet, obj.type))[0]+'` : '+(players[p].emoji ? players[p].emoji:'')+' '
        if(obj.rankLeader && players[p].arena && players[p].arena[obj.type] && players[p].arena[obj.type].squad && players[p].arena[obj.type].squad.length > 0){
          tempObj.value += '**'+players[p].name+'**'
          let lead = players[p].arena[obj.type].squad.find(x=>x.squadUnitType == (obj.type == 'char' ? 2:3))
          if(lead?.unitDefId && configMaps.unitList[lead.unitDefId.split(':')[0]]){
            let uInfo =  configMaps.unitList[lead.unitDefId.split(':')[0]]
            if(uInfo){
              let leadName = getLeadName(uInfo, obj.alias, obj.truncateRankLeader)
              tempObj.value += ' ('+leadName+')'
            }
          }
        }else{
          tempObj.value += players[p].name
        }
        tempObj.value += '\n'
        count++
        if((+p + 1) == players.length && count < 10) count = 10
        if(count == 10){
          msgFields.push(deepCopy(tempObj))
          tempObj.value = ''
          count = 0
        }
      }
      return msgFields
    }
  }catch(e){
    throw(e)
  }
}
