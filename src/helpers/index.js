'use strict'
const Cmds = {}
Cmds.CheckRules = require('./checkRules')

Cmds.DeepCopy = require('./deepCopy')
Cmds.DiscordMsg = require('./discordMsg')

Cmds.GetDiscordId = require('./getDiscordId')
Cmds.GetPayouts = require('./getPayouts')
Cmds.GetPOHour = require('./getPOHour')
Cmds.GetRanks = require('./getRanks')
Cmds.GetShard = require('./getShard')
Cmds.GetShardName = require('./getShardName')

Cmds.NotifyPO = require('./notifyPO')
Cmds.NotifyRankChange = require('./notifyRankChange')
Cmds.NotifyStart = require('./notifyStart')
Cmds.NotifyPO = require('./notifyPO')
Cmds.NotifyRankChange = require('./notifyRankChange')
Cmds.NotifyStart = require('./notifyStart')

Cmds.PayoutRotations = require('./payoutRotations')

Cmds.RankWatchNotify = require('./rankWatchNotify')

Cmds.SendAdminMsg = require('./sendAdminMsg')
Cmds.SendEnemyWatchMsg = require('./sendEnemyWatchMsg')
Cmds.SendPayoutMsg = require('./sendPayoutMsg')
Cmds.SendRankChange = require('./sendRankChange')
Cmds.SendStartMsg = require('./sendStartMsg')
Cmds.SendWatchMsg = require('./sendWatchMsg')

Cmds.TimeTillPayout = require('./timeTillPayout')

module.exports = Cmds
