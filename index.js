import Koa from 'koa'
import { Server } from './script/server.js'
import Router from '@koa/router'

const app = new Koa()
const router = new Router()
// const server = new Server()
// logger

// middleware

// app.use(logger())

// app.use(koaBody())

// route definitions

router.get('/upvote/:id', Server.getUpvoteUrl)
// .post('/post', create)

app.use(router.routes())
/**
 * Show post :id.
 */

// async function show(ctx) {
//   const id = ctx.params.id
//   const post = posts[id]
//   if (!post) ctx.throw(404, 'invalid post id')
//   await ctx.render('show', { post: post })
// }

// /**
//  * Create a post.
//  */

// async function create(ctx) {
//   const post = ctx.request.body
//   const id = posts.push(post) - 1
//   post.created_at = new Date()
//   post.id = id
//   ctx.redirect('/')
// }

// listen

app.listen(3000)
