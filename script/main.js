class App extends HTMLElement {
  constructor() {
    super()
  }

  initialize() {
    const TAG_PAGE = 'phreak-page'
    customElements.define(TAG_PAGE, Page)
    const page = document.createElement(TAG_PAGE)
    page.setAttribute('data-type', 'New')
    this.appendChild(page)

    // const page2 = document.createElement(TAG_PAGE)
    // page2.setAttribute('data-type', 'Ask')
    // this.appendChild(page2)

    return this
  }
}

window.onload = function () {
  const TAG_APP = 'phreak-app'
  customElements.define(TAG_APP, App, { extends: 'main' })
  const main = document.createElement('main', { is: TAG_APP }).initialize()

  document.querySelector('body').prepend(main)
}
