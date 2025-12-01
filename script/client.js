class HN {
  static BASE = 'https://hacker-news.firebaseio.com/v0'
  static top = new HN('top')
  static new = new HN('new')
  static ask = new HN('ask')
  static job = new HN('job')
  static best = new HN('best')
  static show = new HN('show')

  constructor(id) {
    if (id.user) {
      this.id = 'user'
    } else {
      this.id = id
    }
    this.url = HN.getURL(id)
  }

  static getURI(id) {
    switch (typeof id) {
      case 'string':
        return `${id}stories.json`
      case 'number':
        return `item/${id}.json`
      case 'object':
        if (id.user) {
          return `user/${id.user}.json`
        }
      default:
        throw new Error('Invalid URI id')
    }
  }

  static getURL(id) {
    return `${HN.BASE}/${HN.getURI(id)}`
  }
}

class Client {
  static fetchPosts(id) {
    return fetch(HN[id].url).then(Client.receive).catch(console.error)
  }

  static fetchItems(ids) {
    return Promise.all(ids.map((id) => fetch(HN.getURL(id)).then(Client.receive)))
  }

  static receive(response) {
    if (!response.ok) {
      throw new Error(`Client Error: ${response.status}`)
    }

    return response.json()
  }
}
