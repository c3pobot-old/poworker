'use strict'
//const ProcessLocalQue = require('./processLocalQue')
const updateQue = require('./updateQue')
const monitorQue = require('./monitorQue')
const ShardQue = require('./que')
const POD_NAME = process.env.POD_NAME || 'poworker-0'
const isOdd = (num)=>{
  return num % 2
}
const StartQues = async()=>{
  try{
    if(apiReady && CmdMap){
      //await ProcessLocalQue()
      ShardQue.start();
      MonitorQue()
    }else{
      setTimeout(StartQues, 5000)
    }
  }catch(e){
    console.error(e);
    setTimeout(StartQues, 5000)
  }
}
const MonitorQue = ()=>{
  try{
    let num = POD_NAME.slice(-1)
    if(!isOdd(num)){
      console.log('Starting que update...')
      updateQue()
    }
    if(isOdd(num)){
      console.log('Starting que monitor..')
      monitorQue()
    }
  }catch(e){
    console.error(e);
  }
}
module.exports.start = StartQues
