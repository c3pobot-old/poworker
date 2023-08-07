'use strict'
const timeTillPayout = require('./timeTillPayout')
module.exports = (offset, type)=>{
  try{
    let res = timeTillPayout(offset, type)
    if(res && res.length > 0){
      let poTime = res[0].split(":");
      if(poTime && poTime.length > 0) return +poTime[0]
    }
  }catch(e){
    console.log(e)
    return 24
  }
}
