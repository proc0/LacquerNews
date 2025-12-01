class Page extends View {
  static PAYLOAD = 5

  connectedCallback() {
    const loadEvent = View.loadEvent(0, Page.PAYLOAD, this.id)
    this.dispatchEvent(loadEvent)
  }

  static onLoad(event) {
    event.stopPropagation()
    const page = event.target.parentElement
    const postCount = Query.countChildren(page)
    const loadEvent = View.loadEvent(postCount, Page.PAYLOAD, page.id)
    return page.dispatchEvent(loadEvent)
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
