'use strict'
const log = require('logger')
const mongo = require('mongoapiclient')
const ShardQue = require('./que')

const syncShard = async()=>{
  try{
    let shards = await mongo.find('payoutServers', {status: 1}, {_id: 1, status: 1, type: 1})
    for(let i in shards){
      const opts = {jobId: shards[i]._id}
      if(shards.length < 11) opts.delay = (11 - shards.length) * 1000
      if(shards[i].status) await ShardQue.newJob({jobType: 'shard', data: {shardId: shards[i]._id}}, opts)
    }
  }catch(e){
    log.error(e);
  }
}
const syncArena = async()=>{
  try{
    let patreons = await mongo.find('patreon', {status: 1}, {_id: 1, status: 1})
    if(patreons?.length > 0){
      for(let i in patreons){
        const opts = {jobId: patreons[i]._id}
        if(patreons.length < 11) opts.delay = (11 - patreons.length) * 1000
        if(patreons[i].status) await ShardQue.newJob({jobType: 'arena', data: {dId: patreons[i]._id }}, opts)
      }
    }
  }catch(e){
    log.error(e);
  }
}
const Sync = async()=>{
  try{
    await syncShard()
    await syncArena()
    setTimeout(Sync, 5000)
  }catch(e){
    log.error(e);
    setTimeout(Sync, 5000)
  }
}
module.exports = Sync
