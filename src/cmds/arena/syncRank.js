'use strict'
module.exports = async(obj, oldData = null, pObj = null, chId = null, sId = null)=>{
  try{
    let dataChange = 0
    const currentShipRank = (obj.arena.ship.rank || 0);
    const currentCharRank = (obj.arena.char.rank || 0);
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
    const charPOhour = HP.GetPOHour(obj.poOffSet, 'char');
    const shipPOhour = HP.GetPOHour(obj.poOffSet, 'ship');
    const oldCharRank = oldData.char.currentRank
    const oldShipRank = oldData.ship.currentRank
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
      HP.UpdatePayHistory(obj.playerId, 'char', currentCharRank)
      oldData.notify.charPO = 1
      dataChange++
      if(pObj && pObj.notify.status && pObj.notify.poNotify){
        charObj.poNotify = 1
        if(pObj.notify.method != 'log') HP.NotifyPO(charObj)
      }
      if(chId) HP.SendPayoutMsg(chId, [charObj], {sId: sId})
    }
    if (shipPOhour == 23 && oldData.notify.shipPO == 0) {
      HP.UpdatePayHistory(obj.playerId, 'ship', currentShipRank)
      oldData.notify.shipPO = 1
      dataChange++
      if(pObj && pObj.notify.status && pObj.notify.poNotify){
        shipObj.poNotify = 1
        if(pObj.notify.method != 'log') HP.NotifyPO(shipObj)
      }
      if(chId) HP.SendPayoutMsg(chId, [shipObj], {sId: sId})
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
             HP.NotifyStart(charObj);
          }else{
            if(chId) HP.SendStartMsg(chId, [charObj], {sId: sId});
          }

        }
      }
      if (oldData.notify.shipStart == 0 && pObj.notify.timeBeforePO > shipPOhour) {
        oldData.notify.shipStart = 1
        dataChange++
        if(pObj.notify.status  && (!pObj.type || pObj.type === 2)){
          if(pObj.notify.method != 'log'){
            HP.NotifyStart(shipObj)
          }else{
            if(chId) HP.SendStartMsg(chId, [shipObj], {sId: sId});
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
      HP.UpdateRankHistory(obj.playerId, 'char', currentCharRank)
      oldData.char.currentRank = currentCharRank
      dataChange++
      if(pObj && pObj.notify.status && pObj.notify.timeBeforePO > charPOhour){
        if(debugMsg) console.log('Send Char Rank Change for ' + obj.name)
        if(!pObj.type || pObj.type === 1){
          charObj.notify = 1
          if(pObj.notify.method != 'log') HP.NotifyRankChange(charObj)
        }
      }
      if(chId) HP.SendRankChange(charObj)
    }
    if (currentShipRank > 0 && currentShipRank != oldShipRank) {
      HP.UpdateRankHistory(obj.playerId, 'ship', currentShipRank);
      oldData.ship.currentRank = currentShipRank
      dataChange++
      if(pObj && pObj.notify.status && pObj.notify.timeBeforePO > shipPOhour){
        if(debugMsg) console.log('Send Ship Rank Change for ' + obj.name)
        if(!pObj.type || pObj.type === 2) {
          shipObj.notify = 1
          if(pObj.notify.method != 'log') HP.NotifyRankChange(shipObj)
        }
      }
      if(chId) HP.SendRankChange(shipObj)
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
    console.error(e)
  }
}
