const log = require('logger')
const queName = process.env.CMD_QUE_NAME || 'shardQue'
module.exports = (que)=>{
  try{
    log.info('Creating '+queName+' que listeners...')
    que.on('global:failed', function (jobId, err) {
			log.error(`Job ${jobId} failed with reason: ${err}`)
			// A job failed with reason `err`!
		})
		que.on('global:error', (error)=>{
			log.error(error);
		})
    que.on('global:cleaned', function (jobs, type) {
      log.info('Cleaned %s %s jobs', jobs?.length, type);
    });
  }catch(e){
    log.error(e);
  }
}
