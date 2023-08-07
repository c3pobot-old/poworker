const log = require('logger')
const mongo = require('mongoapiclient')
const arrayToObject = require('./arrayToObject')
let configMaps = { unitList: {} }
const syncConfigMap = async()=>{
  try{
    let units = (await mongo.find('autoComplete', {_id: 'unit'}, {data: {value: 0}}))[0]
    if(units?.data?.length > 0){
      let tempUnits = arrayToObject(units.data, 'baseId')
      if(Object.values(tempUnits)?.length > 0){
        //console.log('Updated unitList')
        configMaps.unitList = tempUnits
      }
    }
    setTimeout(syncConfigMap, 3600000)
  }catch(e){
    log.error(e)
    setTimeout(syncConfigMap, 5000)
  }
}
module.exports = {
  configMaps
}
