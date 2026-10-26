const Redis = require("redis")
const redisclient = Redis.createClient()



module.exports = {
    Redis:Redis,
    redisclient:redisclient
}