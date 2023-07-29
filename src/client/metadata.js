const apiRequest = require('./apiRequest')
module.exports = async()=>{
  try{
    return await apiRequest('metadata', {})
  }catch(e){
    console.error(e)
  }
}
