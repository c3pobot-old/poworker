'use strict'
module.exports = async(startTime, endTime, shardId)=>{
  try{
    if(startTime && endTime && shardId){
      const timeDiff = Math.round((+endTime - +startTime)/1000)
      if(timeDiff) syncTime.shard[shardId] = timeDiff
    }
  }catch(e){
    console.error(e);
  }
}
