'use strict'
const log = require('logger')
const redis = require('helpers/redis')
const LOCAL_QUE_KEY = process.env.LOCAL_QUE_KEY
const deepCopy = require('helpers/deepCopy')
const Cmds = {}
Cmds.shard = require('cmds/shard')
Cmds.arena = require('cmds/arena')
const addtoLocalQue = async(job = {})=>{
  try{
    let obj = deepCopy(job.data)
    obj.timestamp = job.timestamp
    obj.jobId = job?.opts?.jobId
    if(!obj.id) obj.id = obj.jobId
    if(LOCAL_QUE_KEY && redis) await redis.setTTL(`${LOCAL_QUE_KEY}-${obj.jobId}`, obj, 600)
    return obj
  }catch(e){
    throw(e)
  }
}
module.exports = async(job)=>{
  try{
    let res = { status: 'no job data' }
    if(!job?.data) return res
    res.status = 'command not found'
    let obj = await addtoLocalQue(job)
    if(!obj?.jobType) return res
    if(!Cmds[obj.jobType]) return res
    res = await Cmds[obj.jobType](obj.data)
    if(!res) res = {status: 'ok'}
    if(LOCAL_QUE_KEY && redis) await redis.del(`${LOCAL_QUE_KEY}-${obj.jobId}`)
    return res
  }catch(e){
    log.error(e)
  }
}
