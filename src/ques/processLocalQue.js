'use strict'
const CmdProcessor = require('./cmdProcessor')
const queName = process.env.CMD_QUE_NAME || 'shardQue'
module.exports = async()=>{
  try{
    if(redis && process.env.LOCAL_QUE_KEY){
      let count = 0, failed = 0
      const jobs = await redis.keys(process.env.LOCAL_QUE_KEY+'-*')
      if(jobs.length > 0){
        let timeNow = Date.now()
        timeNow = +timeNow - 599999
        for(let i in jobs){
          const obj = await redis.get(jobs[i])
          if(obj && obj.timestamp > timeNow){
            count++
            await CmdProcessor(obj.data)
          }else{
            failed++
          }
          await redis.del(jobs[i])
          if(obj.jobId) await redis.del('bull:'+queName+':'+obj.jobId)
        }
      }
      console.log('Processed '+count+' left over in job que. Deleted '+failed+' invalid')
    }
  }catch(e){
    console.error(e);
  }
}
