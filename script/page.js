class Page extends View {
  static LOAD_COUNT = 5
  #SOURCE

  connectedCallback() {
    this.SOURCE = Stories[this.getAttribute('data-type')]
    this.dispatchEvent(View.getLoadEvent(0, Page.LOAD_COUNT, this.SOURCE))
  }

  static render(parent) {
    return (items) => {
      items.forEach((item) => {
        const post = Item.render(item)
        if (Item.isNodeDead(post)) {
          return
        }

        if (parent instanceof Page) {
          const loader = parent.querySelector('article#loader')
          if (loader) {
            parent.insertBefore(post, loader)
          } else {
            parent.appendChild(post)
          }
        } else {
          const loader = Item.queryLoader(parent)
          const section = parent.querySelector('section')
          if (loader) {
            section.insertBefore(post, loader.parentElement)
          } else {
            section.appendChild(post)
          }
        }
      })

      if (parent instanceof Page && !parent.querySelector('article#loader')) {
        const loader = Item.render({ kids: items.map((i) => i.id), id: 'loader' })
        Item.openContainer(Item.queryContainer(loader))
        parent.appendChild(loader)
      }
    }
  }

  static getStory(page) {
    return Stories[page.getAttribute('data-type')]
  }
}
