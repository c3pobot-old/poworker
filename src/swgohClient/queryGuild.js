const apiRequest = require('./apiRequest')
module.exports = async(guildId, includeActivity = false)=>{
  try{
    if(guildId) return await apiRequest('guild', {guildId: guildId, includeRecentGuildActivityInfo: includeActivity})
  }catch(e){
    throw(e)
  }
}
