class App extends HTMLElement {
  static TAG = 'app-main'

  constructor() {
    super()
  }

  // initialize() {
  //   customElements.define(Page.TAG, Page)
  //   const page = document.createElement(Page.TAG)
  //   page.setAttribute('id', HN.top.id)
  //   this.appendChild(page)

  //   // const page2 = document.createElement(TAG_PAGE)
  //   // page2.setAttribute('data-tab', 'Ask')
  //   // this.appendChild(page2)

  //   return this
  // }
}

class Tabs extends HTMLElement {
  static TAG = 'app-nav'

  constructor() {
    super()
  }

  initialize() {
    this.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', this.onTabClick.bind(this))
    )

    if (location.hash.length) {
      this.change(location.hash)
    } else {
      document.querySelector(`${Page.TAG}.active`).load()
    }
  }

  onTabClick(event) {
    event.stopPropagation()
    const tab = event.target.getAttribute('href')
    this.change(tab)
  }

  change(id) {
    document.querySelector('.active').classList.remove('active')

    const page = document.querySelector(id)
    if (!Query.countChildren(page)) {
      page.load()
    }

    page.classList.add('active')
  }
}

customElements.define(App.TAG, App, { extends: 'main' })
customElements.define(Tabs.TAG, Tabs, { extends: 'nav' })

window.onload = function () {
  // const main = document.createElement('main', { is: App.TAG }).initialize()
  document.querySelector('nav').initialize()
}
