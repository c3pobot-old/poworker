'use strict'
const numJobs = +process.env.NUM_JOBS || 1
const Queue = require('bull')
const SyncShard = require('src/syncShard')
const NotifyBotOwner = async(content)=>{
  try{
    const obj = (await mongo.find('botSettings', {_id: '1'}))[0]
    if(obj && obj.reportSId && obj.reportChId){
      MSG.SendMsg({chId: obj.reportChId}, {content: content})
    }else{
      if(process.env.BOT_OWNER_ID) MSG.SendDM(process.env.BOT_OWNER_ID, {content: content})
    }
  }catch(e){
    console.error(e)
  }
}
const shardQue = new Queue('shardQue', { redis: {
			host: process.env.QUE_SERVER,
			port: +process.env.QUE_PORT,
			password: process.env.QUE_PASS
		}
	})
const syncTime = new Queue('syncTime', { redis: {
  		host: process.env.QUE_SERVER,
  		port: +process.env.QUE_PORT,
  		password: process.env.QUE_PASS
		}
  })
let jobCount = 0
const UpdateUnits = async()=>{
  try{
    await HP.UpdateUnitsList()
    jobCount = 0
  }catch(e){
    console.error(e)
  }
}
const ProcessJob = async(obj)=>{
  try{
    const startTime = Date.now()
    if(obj.firstShard) syncTime.add({type: 'shard', start: startTime, key: obj.key, count: obj.count}, {
      removeOnComplete: true,
      removeOnFail: true,
      timeout: 10 * 1000
    })
    if(obj.firstShard && debugMsg) console.log('First Shard-to-sync')
    await localQue.push(process.env.LOCAL_QUE_KEY, obj)
    await SyncShard(JSON.parse(JSON.stringify(obj)))
    const endTime = Date.now()
    const timeDiff = Math.floor((+endTime - +startTime)/1000)
    await localQue.rem(process.env.LOCAL_QUE_KEY, obj)
    if(debugMsg) console.log('Shard '+obj._id+' took '+timeDiff+' seconds to sync')
    if(timeDiff > 90){
      const msg2send = 'Shard '+obj._id+' took '+timeDiff+' seconds to sync'
      console.log(msg2send)
      NotifyBotOwner(msg2send)
    }
    if(obj.lastShard){
      syncTime.add({type: 'shard', stop: endTime, key: obj.key, count: obj.count}, {
        removeOnComplete: true,
        removeOnFail: true,
        timeout: 10 * 1000
      })
      if(debugMsg) console.log('Last Shard-to-sync')
    }
    jobCount++;
    if(jobCount > 9) UpdateUnits()
  }catch(e){
    console.error(e)
  }
}
const StartUpQue = async()=>{
  try{
    if(apiReady){
      const jobs = await localQue.getList(process.env.LOCAL_QUE_KEY)
      if(jobs && jobs.length > 0){
        for(let i in jobs){
          const tempObj = JSON.parse(jobs[i])
          await SyncShard(JSON.parse(JSON.stringify(tempObj)))
          await localQue.rem(process.env.LOCAL_QUE_KEY, tempObj)
        }
      }
      console.log('poworker '+process.env.SHARD_NUM+' processed '+(jobs ? jobs.length:0)+' jobs left in que')
      StartProcessing()
    }else{
      setTimeout(StartUpQue, 1000)
    }
  }catch(e){
    console.error(e)
    setTimeout(StartUpQue, 500)
  }
}
const StartProcessing = ()=>{
  shardQue.process('*', numJobs, async(job, done)=>{
    try{
      if(job.data) await ProcessJob(job.data)
      done()
    }catch(e){
      console.error(e)
      done()
    }
  })
}
StartUpQue()
