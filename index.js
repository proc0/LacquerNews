import { createReadStream } from 'fs'
import Koa from 'koa'
import Router from '@koa/router'
import { bodyParser } from '@koa/bodyparser'

import { Server } from './script/server.js'

const app = new Koa()
const router = new Router()

// app.use(logger())
// app.use(koaBody())

if (!process.env.HN_COOKIE) {
  console.warn('Login to HN and copy the user cookie into HN_COOKIE env variable')
} else {
  console.log(process.env.HN_COOKIE)
}

app.use(bodyParser())

router
  .get('/', root)
  .get('/script/:file', loadScript)
  .get('/style/:file', loadStyle)
  .get('/upvote/:id', Server.upvote)
  .post('/reply/:id', Server.reply)

app.use(router.routes())

async function root(ctx, next) {
  ctx.type = 'html'
  ctx.cookies.set('user', process.env.HN_COOKIE)
  ctx.body = createReadStream('index.html')
}

async function loadScript(ctx, next) {
  ctx.type = 'html'
  ctx.body = createReadStream(`script/${ctx.params.file}`)
}

async function loadStyle(ctx, next) {
  ctx.type = 'text/css'
  ctx.body = createReadStream(`style/${ctx.params.file}`)
}

app.listen(3000)
