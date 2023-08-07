'use strict'
module.exports = (array = [], key)=>{
  try{
    return array.reduce((obj, item)=>{
      return{
        ...obj,
        [item[key]]: item
      }
    }, {})
  }catch(e){
    throw(e)
  }
}
