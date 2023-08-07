'use strict'
const log = require('logger')

const updateQue = require('./updateQue')
const monitorQue = require('./monitorQue')
const ShardQue = require('./que')
const POD_NAME = process.env.POD_NAME || 'poworker-0'
const isOdd = (num)=>{
  return num % 2
}
const StartQues = async()=>{
  try{
    ShardQue.start();
    MonitorQue()
  }catch(e){
    log.error(e);
    setTimeout(StartQues, 5000)
  }
}
const MonitorQue = ()=>{
  try{
    let num = POD_NAME.slice(-1), array = POD_NAME.split('-')
    if(array?.length > 1){
      num = +array.pop()
    }
    if(!isOdd(num)){
      log.info('Starting que update...')
      updateQue()
    }
    if(isOdd(num)){
      log.info('Starting que monitor..')
      monitorQue()
    }
    if(num === 0) ShardQue.createListeners()
  }catch(e){
    log.error(e);
  }
}
module.exports.start = StartQues
