class Stories {
  static Top = new Stories('topstories')
  static New = new Stories('newstories')
  static Ask = new Stories('askstories')
  static Job = new Stories('jobstories')
  static Best = new Stories('beststories')
  static Show = new Stories('showstories')

  constructor(url) {
    this.url = url
  }
}

class Client {
  static fetchIds(endpoint) {
    return fetch(Client.getUrl(endpoint)).then(Client.receive).catch(this.logError)
  }

  static fetchItems(ids) {
    return Promise.all(
      ids.map((id) =>
        fetch(Client.getUrl(`item/${id}`))
          .then(Client.receive)
          .then(Client.normalize)
      )
    )
  }

  static getUrl(uri) {
    return `https://hacker-news.firebaseio.com/v0/${uri}.json`
  }

  static receive(response) {
    if (!response.ok) {
      throw new Error(`Item fetch Error: ${response.status}`)
    }

    return response.json()
  }

  static normalize(data) {
    return data
  }

  logError(error) {
    console.error('Client Error:', error)
  }
}
