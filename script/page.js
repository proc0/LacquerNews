class Page extends View {
  static LOAD_COUNT = 5
  #SOURCE

  connectedCallback() {
    this.SOURCE = Stories[this.getAttribute('data-type')]
    this.dispatchEvent(
      new CustomEvent('load', {
        bubbles: true,
        detail: { cursor: 0, count: Page.LOAD_COUNT, source: this.SOURCE },
      })
    )
  }

  static render(parent) {
    return (items) => {
      items.forEach((item) => {
        const post = Item.render(item)
        if (parent instanceof Page) {
          parent.appendChild(post)
        } else {
          parent.querySelector('section').appendChild(post)
        }
      })
    }
  }
}
