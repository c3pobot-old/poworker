'use strict'
const path = require('path')
const bottleneck = require('bottleneck')
const fetch = require('node-fetch')
const parseResoponse = require('./parseResoponse')
const CLIENT_URI = process.env.CLIENT_URL || 'http://localhost:3000'
const limiter = new bottleneck({
  minTime: 20,
  maxConcurrent: 10
})

const fetchRequest = async(uri, opts = {})=>{
  try{
    let res = await fetch(uri, opts)
    return await parseResoponse(res)
  }catch(e){
    if(e?.name) return {error: e.name, message: e.message, type: e.type}
    if(e?.status) return await parseResoponse(e)
    throw(e)
  }
}
const requestWithRetry = async(uri, opts = {}, count = 0)=>{
  try{
    let res = await fetchRequest(uri, opts)
    if((res?.body?.code === 6 && count < 11) || (res?.error === 'FetchError' && count < 11) || (res?.status === 400 && res?.body?.message && !res?.body?.code && count < 11)){
      count++
      return await requestWithRetry(uri, opts, count)
    }
    return res
  }catch(e){
    throw(e);
  }
}
module.exports = async(uri, payload)=>{
  try{
    let opts = { headers: { "Content-Type": "application/json" }, timeout: 10000, method: 'POST', compress: true, body: JSON.stringify({ payload: payload}) }
    let res = await limiter.schedule(()=>requestWithRetry(path.join(CLIENT_URI, uri), opts))
    //console.log(res?.body)
    if(res?.body?.code !== 5 && res?.body?.message) throw(uri+' : Code : '+res.body.code+' : Msg : '+res.body.message)
    if(res?.body) return res.body
    if(res?.error) throw(uri+' : '+res.error+' '+res.type)
  }catch(e){
    throw(e);
  }
}
