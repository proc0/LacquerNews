class View extends HTMLElement {
  static model = new Model()
  static EVENT_LOAD = 'load'

  constructor() {
    super()

    this.addEventListener(View.EVENT_LOAD, ({ detail, target }) => {
      View.render(target)
      View.model.load(detail).then(Page.render(target)).then(View.clean(target))
    })
  }

  static render(parent) {
    const loader = Query.loader(parent)
    const container = Query.container(parent)

    const loading = document.createElement('span')
    loading.setAttribute('data-loading', '')
    loading.textContent = 'Loading...'

    if (loader) {
      container.insertBefore(loading, loader)
    } else {
      container.appendChild(loading)
    }
  }

  static clean(parent) {
    return () => parent.querySelector('span[data-loading]').remove()
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

  static normalize(item) {
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
      item.upvote = true
      item.downvote = true
      item.reply = true
    } else {
      item.upvote = true
      item.downvote = false
      item.reply = true
    }

    return item
  }
}
