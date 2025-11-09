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
  BaseURL = 'https://news.ycombinator.com'

  logUser(username, password) {
    let headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Access-Control-Allow-Origin': '*',
    })

    return fetch(`${this.BaseURL}/login`, {
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
      .then((res) => res.text())
      .then((body) => {
        console.log(body)
        if (body.match(/Bad Login/i)) {
          return false
        } else {
          return true
        }
      })
  }

  getUpvoteURL(id) {
    let headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Access-Control-Allow-Origin': '*',
      'Cookie': 'user=proc0&Nwg5zsZJgTWqqYwoIjI9qchA7KaLZXeB',
    })

    return fetch(`${this.BaseURL}/item?id=${id}`, {
      headers,
      mode: 'no-cors',
      credentials: 'include',
    })
      .then((res) => res.text())
      .then((body) => {
        const doc = parse(body)
        const upvoteLink = doc.querySelector(`#up_${id}`).getAttribute('href')
        // const doc = cheerio.load(body)
        console.log(upvoteLink)

        return upvoteLink
      })
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
