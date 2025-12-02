class Page extends View {
  static TAG = 'app-page'
  static PAYLOAD = 13

  load() {
    const postCount = Query.countChildren(this)
    const loadEvent = View.loadEvent(postCount, Page.PAYLOAD, this.id)
    return this.dispatchEvent(loadEvent)
  }

  static onLoad(event) {
    event.stopPropagation()
    const page = event.target.parentElement
    return page.load()
  }

  static render(parent) {
    return (items) => {
      const loader = Query.loader(parent)
      const container = Query.container(parent)
      const isConnected = document.querySelector('main').isConnected
      const isPost = parent.parentElement instanceof Page
      const isFirstPostLoad = isPost && Query.countChildren(parent) === 0

      items.forEach((data) => {
        const item = View.normalize(data, isConnected)

        if (!item) return

        const fragment = Item.render(item)
        if (loader) {
          container.insertBefore(fragment, loader)
        } else {
          container.appendChild(fragment)
        }

        // load sub-comments on first post load
        if (isFirstPostLoad && item.kids.length > 0) {
          Item.onLoad({
            stopPropagation: () => {},
            target: Query.loader(document.getElementById(item.id)),
            payload: item.kids.length > 5 ? 2 : 1,
          })
        }
      })

      if (parent instanceof Page && !loader) {
        const button = document.createElement('button')
        button.textContent = `Load more\n▼`
        button.addEventListener('click', Page.onLoad)
        parent.appendChild(button)
      }
    }
  }
}

customElements.define(Page.TAG, Page)
