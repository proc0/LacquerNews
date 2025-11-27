import { parse } from 'node-html-parser'

const encode = (data) => {
  const keys = Object.keys(data)
  const params = []
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const value = data[key]
    params.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
  }

  return params.join('&')
}

export class Server {
  static BASE_URL = 'https://news.ycombinator.com'

  // static async login(username, password) {
  //   let headers = new Headers({
  //     'Content-Type': 'application/x-www-form-urlencoded',
  //     'Access-Control-Allow-Credentials': 'true',
  //     'Access-Control-Allow-Origin': '*',
  //     'SameSite': 'none',
  //     'Secure': 'true',
  //   })

  //   const request = await fetch(`${Server.BASE_URL}/login`, {
  //     method: 'POST',
  //     headers: headers,
  //     body: encode({
  //       acct: username,
  //       pw: password,
  //       goto: 'news',
  //     }),
  //     mode: 'no-cors',
  //     credentials: 'include',
  //   })

  //   const response = await request.text()
  //   console.log(response)
  //   console.log(request.headers)

  //   if (response.match(/Bad Login/i)) {
  //     return false
  //   } else {
  //     return true
  //   }

  //   // .then((res) => res.text())
  //   // .then((body) => {
  //   //   console.log(body)
  //   //   if (body.match(/Bad Login/i)) {
  //   //     return false
  //   //   } else {
  //   //     return true
  //   //   }
  //   // })
  // }

  static async upvote(ctx) {
    const options = {
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*',
        'Cookie': `user=${ctx.cookies.get('user')}`,
      }),
      mode: 'no-cors',
      credentials: 'include',
    }
    const id = ctx.params.id
    const request = await fetch(`${Server.BASE_URL}/item?id=${id}`, options)
    const response = await request.text()
    const html = parse(response)
    const upvoteUrl = html.querySelector(`#up_${id}`).getAttribute('href')
    // upvoteUrl.slice(0, upvoteUrl.lastIndexOf('&goto'))
    const upvoteRequest = await fetch(`${Server.BASE_URL}/${upvoteUrl}`, options)
    const upvoteResponse = await upvoteRequest.text()
    console.log(upvoteUrl)
    // ctx.redirect('/')
    ctx.body = { ok: true }
  }

  static async reply(ctx) {
    const options = {
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*',
        'Cookie': `user=${ctx.cookies.get('user')}`,
      }),
      mode: 'no-cors',
      credentials: 'include',
    }
    const id = ctx.params.id
    const text = ctx.request.body.text
    const request = await fetch(`${Server.BASE_URL}/item?id=${id}`, options)
    const response = await request.text()
    const html = parse(response)
    const hmac = html.querySelector('input[name=hmac]').getAttribute('value')
    const commentRequest = await fetch(`${Server.BASE_URL}/comment`, {
      method: 'POST',
      headers: options.headers,
      body: encode({
        parent: id,
        goto: `item?id=${id}`,
        hmac,
        text,
      }),
      mode: 'no-cors',
      credentials: 'include',
    })
    const commentResponse = await commentRequest.text()

    console.log(commentResponse)
    // ctx.redirect('/')
    ctx.body = { ok: true }
  }
}
