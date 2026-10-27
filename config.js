import { createClient } from "redis"

const redisclient = createClient()

export { redisclient }