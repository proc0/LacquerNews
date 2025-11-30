class Page extends View {
  static PAYLOAD = 5

  connectedCallback() {
    this.dispatchEvent(View.loadEvent(0, Page.PAYLOAD, Page.getStory(this)))
  }

  static countChildNodes(node) {
    return node.querySelectorAll('& > article')?.length || 0
  }

  static queryLoader(node) {
    return node.querySelector('& > button')
  }

  static onLoad(event) {
    event.stopPropagation()
    const page = event.target.parentElement
    const postCount = Page.countChildNodes(page)
    const loadEvent = View.loadEvent(postCount, Page.PAYLOAD, Page.getStory(page))
    return page.dispatchEvent(loadEvent)
  }

  static render(parent) {
    return (items) => {
      const isPage = parent instanceof Page
      const loader = (isPage ? Page : Item).queryLoader(parent)
      const container = isPage ? parent : parent.querySelector('section')

      items.forEach((item) => {
        const post = Item.render(item)

        if (!post) return

        if (loader) {
          container.insertBefore(post, loader)
        } else {
          container.appendChild(post)
        }
      })

      if (isPage && !loader) {
        const button = document.createElement('button')
        button.textContent = `Load more\n▼`
        button.addEventListener('click', Page.onLoad)
        parent.appendChild(button)
      }
    }
  }

  static getStory(page) {
    return Stories[page.getAttribute('data-type')]
  }
}
