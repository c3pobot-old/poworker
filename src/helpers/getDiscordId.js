'use strict'
const mongo = require('mongoapiclient')
module.exports = async(obj = {})=>{
  try{
    let discordId = obj.dId, dObj
    if(!discordId && obj.allyCode) dObj = (await mongo.find('discordId', {'allyCodes.allyCode': +obj.allyCode}))[0]
    if(dObj) discordId = dObj._id
    return discordId
  }catch(e){
    throw(e)
  }
}
