import { parse } from 'node-html-parser'

const convertRequestBodyToFormUrlEncoded = (data) => {
  const bodyKeys = Object.keys(data)
  const str = []
  for (let i = 0; i < bodyKeys.length; i += 1) {
    const thisKey = bodyKeys[i]
    const thisValue = data[thisKey]
    str.push(`${encodeURIComponent(thisKey)}=${encodeURIComponent(thisValue)}`)
  }
  return str.join('&')
}

export class Server {
  static BASE_URL = 'https://news.ycombinator.com'

  static async login(username, password) {
    let headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Access-Control-Allow-Origin': '*',
    })

    const request = await fetch(`${Server.BASE_URL}/login`, {
      method: 'POST',
      headers: headers,
      body: convertRequestBodyToFormUrlEncoded({
        acct: username,
        pw: password,
        goto: 'news',
      }),
      mode: 'no-cors',
      credentials: 'include',
    })

    const response = await request.text()

    console.log(request)

    if (response.match(/Bad Login/i)) {
      return false
    } else {
      return true
    }

    // .then((res) => res.text())
    // .then((body) => {
    //   console.log(body)
    //   if (body.match(/Bad Login/i)) {
    //     return false
    //   } else {
    //     return true
    //   }
    // })
  }

  static async getUpvoteUrl(ctx) {
    const options = {
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*',
        // 'Cookie': 'user=proc0&Nwg5zsZJgTWqqYwoIjI9qchA7KaLZXeB',
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

  getHmac(id) {
    return fetch(`${this.BaseURL}/item?id=${id}`, {
      mode: 'no-cors',
      credentials: 'include',
    })
      .then((res) => res.text())
      .then((body) => {
        const doc = cheerio.load(body)

        return doc('input[name=hmac]').attr('value')
      })
  }

  upvote(id) {
    return this.getUpvoteURL(id)
      .then((url) =>
        fetch(`${this.BaseURL}/${url}`, {
          mode: 'no-cors',
          credentials: 'include',
        })
      )
      .then((res) => res.text())
      .then((body) => {
        return true
      })
      .catch((error) => {
        console.log(error)
        return false
      })
  }

  reply(id, text) {
    return this.getHmac(id)
      .then((hmac) => {
        let headers = new Headers({
          'Content-Type': 'application/x-www-form-urlencoded',
          'Access-Control-Allow-Origin': '*',
        })

        return fetch(`${this.BaseURL}/comment`, {
          method: 'POST',
          headers: headers,
          body: convertRequestBodyToFormUrlEncoded({
            parent: id,
            goto: `item?id=${id}`,
            hmac: hmac,
            text: text,
          }),
          mode: 'no-cors',
          credentials: 'include',
        })
      })
      .then((res) => res.text())
      .then((body) => {
        return {
          success: true,
          error: null,
        }
      })
  }
}
