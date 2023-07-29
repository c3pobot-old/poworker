'use strict'
const queName = process.env.CMD_QUE_NAME || 'shardQue'
module.exports = async(jobId)=>{
  try{
    if(cmdQue?.name){
      let jobs = await redis.keys('bull:'+queName+':'+jobId+'*')
      for(let i in jobs) await redis.del(jobs[i])
    }
  }catch(e){
    console.error(e);
  }
}
