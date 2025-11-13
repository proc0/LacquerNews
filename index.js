import Koa from 'koa'
import { Server } from './script/server.js'
import Router from '@koa/router'
import { createReadStream } from 'fs'

const app = new Koa()
const router = new Router()
// const server = new Server()
// logger

// middleware

// app.use(logger())

// app.use(koaBody())

// route definitions
if (!process.env.HN_COOKIE) {
  console.warn('Login to HN and copy the user cookie into HN_COOKIE env variable')
} else {
  console.log(process.env.HN_COOKIE)
}

router
  .get('/', root)
  .get('/script/:file', loadScript)
  .get('/style/:file', loadStyle)
  .get('/upvote/:id', Server.getUpvoteUrl)
  .get('/login', async (ctx) => {
    const loginRes = await Server.login('proc0', 'Minr11.morgu1')

    ctx.body = loginRes
  })
// .post('/post', create)

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
