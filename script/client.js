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
  static base(uri) {
    return `https://hacker-news.firebaseio.com/v0/${uri}.json`
  }

  static fetchBase(uri) {
    return fetch(Client.base(uri)).then(Client.receive).catch(console.error)
  }

  static fetchItems(ids) {
    return Promise.all(
      ids.map((id) =>
        fetch(Client.base(`item/${id}`))
          .then(Client.receive)
          .then(Client.normalize)
      )
    )
  }

  static receive(response) {
    if (!response.ok) {
      throw new Error(`Client Error: ${response.status}`)
    }

    return response.json()
  }

  static normalize(data) {
    return data
  }
}
