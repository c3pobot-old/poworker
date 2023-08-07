'use strict'
module.exports = async(obj = [], notify)=>{
  try{
    let msg2Send = ''
    let count = 1
    for(let i in obj){
      msg2Send += count.toString().padStart(2, ' ')+' '+(obj[i].discord && notify === 'on' ? '<@'+obj[i].discord.replace(/[<@!>]/g, '')+'>':obj[i].name)+'\n'
      count++;
    }
    return msg2Send
  }catch(e){
    throw(e);
  }
}
