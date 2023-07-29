'use strict'
const Cmds = {}
Cmds.shard = require('src/cmds/shard')
Cmds.arena = require('src/cmds/arena')

module.exports = async(job)=>{
  try{
    if(job.jobType === 'shard' || job.jobType === 'arena'){
      let res
      if(redis && process.env.LOCAL_QUE_KEY && job?.jobId && job.data) await redis.setTTL(process.env.LOCAL_QUE_KEY+'-'+job.jobId, job)
      //await HP.AddJob(job)
      if(Cmds[job?.jobType]) res = await Cmds[job.jobType](job.data);
      //await HP.RemoveJob(job.jobId)
      if(redis && process.env.LOCAL_QUE_KEY && job?.jobId) await redis.del(process.env.LOCAL_QUE_KEY+'-'+job.jobId)
      return res
    }else{
      return {res: 'ok'}
    }
  }catch(e){
    console.error(e);
  }
}
