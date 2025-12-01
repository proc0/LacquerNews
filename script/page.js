class Page extends View {
  static TAG = 'app-page'
  static PAYLOAD = 13

  connectedCallback() {
    if (this.classList.contains('active') && location.hash === this.id) {
      this.load()
    }
  }

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

      items.forEach((item) => {
        const normal = View.normalize(item)

        if (!normal) return

        const node = Item.render(normal)

        if (loader) {
          container.insertBefore(node, loader)
        } else {
          container.appendChild(node)
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
