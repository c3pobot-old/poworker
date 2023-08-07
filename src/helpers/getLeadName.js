'use strict'
const log = require('logger')
const TruncateString = (str, num)=>{
  let array = str.replace(/[()]/g, '').split(' ')
  if(array.length > 0){
    str = ''
    for(let i in array) str += array[i].charAt(0)
  }else{
    if(str.length > num) str = str.slice(0, num)
  }
  return str
}
module.exports = (uInfo = {}, aliases = [], truncate = false)=>{
  try{
    let res = uInfo.name, alias = aliases.find(x=>x.baseId == uInfo.value)
    if(alias?.alias) res = alias.alias
    if(!alias && truncate && uInfo.name) res = TruncateString(uInfo.name, 4)
    return res
  }catch(e){
    log.error(e)
  }
}
