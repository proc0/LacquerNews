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

        if (post.getAttribute('data-deleted') === '') {
          return parent.setAttribute('data-kids', Number(post.getAttribute('data-kids') - 1))
        }

        if (parent instanceof Page) {
          parent.appendChild(post)
        } else {
          parent.querySelector('section').appendChild(post)
        }
      })
    }
  }

  static getStory(page) {
    return Stories[page.getAttribute('data-type')]
  }
}
