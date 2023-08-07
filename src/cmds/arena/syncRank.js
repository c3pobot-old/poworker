'use strict'
const log = require('logger')
const mongo = require('mongoapiclient')
const { GetPOHour, NotifyPO, NotifyRankChange, NotifyStart, SendPayoutMsg, SendRankChange, SendStartMsg } = require('helpers')
module.exports = async(obj, oldData = null, pObj = null, chId = null, sId = null)=>{
  try{
    let dataChange = 0
    let currentShipRank = (obj.arena.ship.rank || 0);
    let currentCharRank = (obj.arena.char.rank || 0);
    if(!oldData) dataChange++
    if(!oldData) oldData  = {
       char: {
         currentRank: currentCharRank
       },
       ship: {
         currentRank: currentShipRank
       },
       notify: {
         charPO: 0,
         shipPO: 0,
         charStart: 0,
         shipStart: 0
       }
     };
    if(!pObj){
      pObj = {
        allyCode: obj.allyCode,
        playerId: obj.playerId,
        name: obj.name,
        notify: {
          status: 0,
          poNotify: 0,
          timeBeforePO: 24,
          climb: 0,
          method: 'dm',
          type: 0
        }
      }
      //await mongo.set('arena', {_id: obj.playerId}, pObj)
    }
    if(oldData.name != obj.name){
      oldData.name = obj.name
      dataChange++;
    }
    if(oldData.offSet != obj.offSet){
      oldData.offSet = obj.offSet;
      dataChange++;
    }
    if(+oldData.allyCode != +obj.allyCode){
      oldData.allyCode = +obj.allyCode
      dataChange++
    }
    let charPOhour = GetPOHour(obj.poOffSet, 'char');
    let shipPOhour = GetPOHour(obj.poOffSet, 'ship');
    let oldCharRank = oldData.char.currentRank
    let oldShipRank = oldData.ship.currentRank
    let charObj, shipObj
    if(pObj){
      charObj = {
        name: obj.name,
        allyCode: obj.allyCode,
        rank: currentCharRank,
        oldRank: oldCharRank,
        poHour: charPOhour,
        method: pObj.notify.method,
        type: 'char',
        chId: chId,
        sId: sId,
        dId: pObj.dId,
        climb: pObj.notify.climb,
        poNotify: 0,
        notify: 0
      }
      shipObj = {
        name: obj.name,
        allyCode: obj.allyCode,
        dId: pObj.dId,
        rank: currentShipRank,
        oldRank: oldShipRank,
        poHour: shipPOhour,
        method: pObj.notify.method,
        type: 'ship',
        chId: chId,
        sId: sId,
        climb: pObj.notify.climb,
        poNotify: 0,
        notify: 0
      }
    }
    if (charPOhour == 23 && oldData.notify.charPO == 0) {
      oldData.notify.charPO = 1
      dataChange++
      if(pObj && pObj.notify.status && pObj.notify.poNotify){
        charObj.poNotify = 1
        if(pObj.notify.method != 'log') NotifyPO(charObj)
      }
      if(chId) SendPayoutMsg(chId, [charObj], {sId: sId})
    }
    if (shipPOhour == 23 && oldData.notify.shipPO == 0) {
      oldData.notify.shipPO = 1
      dataChange++
      if(pObj && pObj.notify.status && pObj.notify.poNotify){
        shipObj.poNotify = 1
        if(pObj.notify.method != 'log') NotifyPO(shipObj)
      }
      if(chId) SendPayoutMsg(chId, [shipObj], {sId: sId})
    }
    if (charPOhour != 23 && oldData.notify.charPO == 1) {
      oldData.notify.charPO = 0
      dataChange++
    }
    if (shipPOhour != 23 && oldData.notify.shipPO == 1) {
      oldData.notify.shipPO = 0
      dataChange++
    }
    if(pObj){
      if (oldData.notify.charStart == 0 && pObj.notify.timeBeforePO > charPOhour) {
        oldData.notify.charStart = 1
        dataChange++
        if(pObj.notify.status && (!pObj.type || pObj.type === 1)){
          if(pObj.notify.method != 'log'){
             NotifyStart(charObj);
          }else{
            if(chId) SendStartMsg(chId, [charObj], {sId: sId});
          }

        }
      }
      if (oldData.notify.shipStart == 0 && pObj.notify.timeBeforePO > shipPOhour) {
        oldData.notify.shipStart = 1
        dataChange++
        if(pObj.notify.status  && (!pObj.type || pObj.type === 2)){
          if(pObj.notify.method != 'log'){
            NotifyStart(shipObj)
          }else{
            if(chId) SendStartMsg(chId, [shipObj], {sId: sId});
          }
        }
      }
      if (pObj.notify.timeBeforePO != 24 && oldData.notify.charStart == 1 && charPOhour > pObj.notify.timeBeforePO) {
        oldData.notify.charStart = 0
        dataChange++
      }
      if (pObj.notify.timeBeforePO != 24 && oldData.notify.shipStart == 1 && shipPOhour > pObj.notify.timeBeforePO) {
        oldData.notify.shipStart = 0
        shipObj.notifyStart = 0
        dataChange++
      }
    }
    if (currentCharRank > 0 && currentCharRank != oldCharRank) {
      oldData.char.currentRank = currentCharRank
      dataChange++
      if(pObj && pObj.notify.status && pObj.notify.timeBeforePO > charPOhour){
        if(debugMsg) console.log('Send Char Rank Change for ' + obj.name)
        if(!pObj.type || pObj.type === 1){
          charObj.notify = 1
          if(pObj.notify.method != 'log') NotifyRankChange(charObj)
        }
      }
      if(chId) SendRankChange(charObj)
    }
    if (currentShipRank > 0 && currentShipRank != oldShipRank) {
      oldData.ship.currentRank = currentShipRank
      dataChange++
      if(pObj && pObj.notify.status && pObj.notify.timeBeforePO > shipPOhour){
        if(debugMsg) console.log('Send Ship Rank Change for ' + obj.name)
        if(!pObj.type || pObj.type === 2) {
          shipObj.notify = 1
          if(pObj.notify.method != 'log') NotifyRankChange(shipObj)
        }
      }
      if(chId) SendRankChange(shipObj)
    }
    if(dataChange > 0){
      if(debugMsg > 0) console.log(oldData.name +' has new player rank data.')
      oldData.TTL = new Date()
      mongo.set('rankCache', {_id: obj.playerId}, oldData)
      if(oldData.history){
        delete oldData.history
        mongo.rep('rankCache', {_id: obj.playerId}, oldData)
      }
    }
  }catch(e){
    log.error(e)
  }
}
