class View extends HTMLElement {
  static model = new Model()
  static EVENT_LOAD = 'load'

  constructor() {
    super()

    this.addEventListener(View.EVENT_LOAD, ({ detail, target }) => {
      const loading = View.render(target)
      View.model
        .load(detail)
        .then((result) => {
          loading.setAttribute('value', '90')
          return result
        })
        .then(Page.render(target))
        .then(View.finish(target))
    })
  }

  static render(parent) {
    const container = Query.container(parent)

    const loading = document.createElement('progress')
    loading.setAttribute('max', '100')
    loading.setAttribute('value', '30')
    container.insertAdjacentElement('afterbegin', loading)

    return loading
  }

  static finish(parent) {
    return () => {
      const loading = parent.querySelector('progress')
      loading.setAttribute('value', '100')
      loading.setAttribute('style', 'visibility: hidden')
      setTimeout(() => parent.querySelector('progress').remove(), 100)
    }
  }

  static stopEvent(event) {
    event.stopPropagation()
  }

  static loadEvent(cursor, count, id) {
    return new CustomEvent(View.EVENT_LOAD, {
      bubbles: true,
      detail: {
        cursor,
        count,
        id,
      },
    })
  }

  static normalize(item, isConnected = false) {
    if (item.deleted || item.dead || item.text === '[delayed]') {
      return null
    }

    if (!item.kids) {
      item.kids = []
    }

    if (item.type === 'job') {
      item.upvote = false
      item.downvote = false
      item.reply = false
      delete item.score
      delete item.by
    } else if (item.type === 'comment') {
      item.upvote = isConnected
      item.downvote = isConnected
      item.reply = isConnected
    } else {
      // posts
      item.upvote = isConnected
      item.downvote = false
      item.reply = isConnected
    }

    return item
  }
}
