class Page extends View {
  static LOAD_COUNT = 5

  connectedCallback() {
    this.dispatchEvent(View.getLoadEvent(0, Page.LOAD_COUNT, Page.getStory(this)))
  }

  static countChildren(node) {
    return node.querySelectorAll('& > article')?.length || 0
  }

  static queryLoader(node) {
    return node.querySelector('& > button')
  }

  static onLoad(event) {
    event.stopPropagation()
    const page = event.target.parentElement
    const postCount = Page.countChildren(page)
    const loadEvent = View.getLoadEvent(postCount, Page.LOAD_COUNT, Page.getStory(page))
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
        button.textContent = `Load more`
        button.addEventListener('click', Page.onLoad)
        parent.appendChild(button)
      }
    }
  }

  static getStory(page) {
    return Stories[page.getAttribute('data-type')]
  }
}
