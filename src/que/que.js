'use strict'
const cmdProcessor = require('./cmdProcessor')
const processLocalQue = require('./processLocalQue')
const Queue = require('bull')
const que = new Queue(process.env.CMD_QUE_NAME || 'shardQue', {
  redis: {
    host: process.env.REDIS_SERVER,
    port: +process.env.REDIS_PORT,
    password: process.env.REDIS_PASS
  },
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true
  },
  settings: {
    maxStalledCount: 0
  }
})
module.exports.createListeners = ()=>{
  try{
    require('./createListeners')(que)
  }catch(e){
    throw(e)
  }
}
module.exports.process = ()=>{
  que.process('*', +process.env.NUM_JOBS || 1, cmdProcessor)
}
module.exports.newJob = async(data = {}, jobOpts = {})=>{
  try{
    await que.clean(10000, 'failed');
    return await que.add(data, jobOpts)
  }catch(e){
    throw(e)
  }
}
module.exports.getJobs = async()=>{
  try{
    return await que.getJobs()
  }catch(e){
    throw(e)
  }
}
module.exports.removeJob = async(jobId)=>{
  try{
    let job = await que.getJob(jobId)
    if(job){
      await job.moveToCompleted(null, true, true)
      await job.remove()
    }
  }catch(e){
    return
  }
}
module.exports.start = async()=>{
  try{
    await processLocalQue()
    que.process('*', +process.env.NUM_JOBS || 1, cmdProcessor)
  }catch(e){
    throw(e)
  }
}
