'use strict'
const QueWrapper = require('quewrapper')
const CmdProcessor = require('./cmdProcessor')
const shardCmdQueOptions = {
  queName: process.env.CMD_QUE_NAME || 'shardQue',
  numJobs: +process.env.NUM_JOBS || 1,
  queOptions: {
    redis: {
      host: process.env.REDIS_SERVER,
      port: +process.env.REDIS_PORT,
      password: process.env.REDIS_PASS
    }
  },
  cmdProcessor: CmdProcessor,
  localQue: redis,
  localQueKey: process.env.LOCAL_QUE_KEY
}
const ShardQue = new QueWrapper(shardCmdQueOptions)
module.exports.process = ()=>{
  ShardQue.process()
}
module.exports.newJob = async(data = {}, opts = {})=>{
  try{
    return await ShardQue.newJob(data, opts)
  }catch(e){
    throw(e)
  }
}
module.exports.getJobs = async()=>{
  try{
    return await ShardQue.getJobs()
  }catch(e){
    throw(e)
  }
}
module.exports.start = ()=>{
  ShardQue.start()
}
