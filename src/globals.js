'use strict';
const RedisWrapper = require('rediswrapper')
global.sorter = require('json-array-sorter')

global.apiReady = 0
global.botSettings = {}
global.debugMsg = +process.env.DEBUG || 0
global.CmdMap = require('./cmdMap')

global.mongo = require('mongoapiclient')

const redisOpts = {
  host: process.env.REDIS_SERVER,
  port: process.env.REDIS_PORT
}
if(process.env.REDIS_PASS) redisOpts.passwd = process.env.REDIS_PASS
global.redis = new RedisWrapper(redisOpts)

global.HP = require('./helpers')
global.MSG = require('discordmsg')
global.Client = require('./client')
global.syncTime = {shard: {}, arena: {}}
global.reportError = (e, cmd)=>{
  let msg = cmd
  if(!msg) msg = ''
  msg += '\n'
  if(e?.name){
    msg += e.name+'\n'+e.message+'\n'+e.type
  }else{
    msg += e
  }
}
