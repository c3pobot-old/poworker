'use strict'
module.exports = (playerOffset,type)=>{
  try{
    let timeNow = new Date();
    let offSet = (playerOffset)*60000;
    let p = new Date();
    if(type == "char"){
      p.setUTCHours('18', '00', '0', '0')
    }else{
      p.setUTCHours('19', '00', '0', '0')
    }
    let pOffset = p.getTime() - offSet;
    let payoutTime = new Date(pOffset);
    if(payoutTime < timeNow){
      payoutTime.setDate(payoutTime.getDate() + 1);
    }
    let timeUntilPayout = payoutTime.getTime() - timeNow.getTime();
    let dif = new Date(timeUntilPayout);
    let round = dif.getTime() % 60000
    if (round < 30000) {
      dif.setTime(dif.getTime() - round);
    }else{
      dif.setTime(dif.getTime() + 60000 - round);
    }
    let formatPayoutTime = `${String(dif.getUTCHours()).padStart(2, '00')}:${String(dif.getUTCMinutes()).padStart(2, '00')}`;
    return [formatPayoutTime, payoutTime.getTime()]
  }catch(e){
    throw(e)
  }
}
