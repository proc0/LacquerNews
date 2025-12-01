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
    this.querySelectorAll('a').forEach((a) => this.bindEvent(a))

    if (location.hash.length) {
      this.change(location.hash)
    } else {
      document.querySelector(`${Page.TAG}.active`).load()
    }
  }

  add(id, label) {
    const tab = document.createElement('a')
    tab.setAttribute('href', `#${id}`)
    tab.textContent = label || id
    this.bindEvent(tab)
    this.appendChild(tab)
  }

  bindEvent(tab) {
    tab.addEventListener('click', this.onChange.bind(this))
  }

  onChange(event) {
    event.stopPropagation()
    const tab = event.target.getAttribute('href')
    this.change(tab)
  }

  change(id) {
    // clear active
    document.querySelector('.active')?.classList.remove('active')

    const page = document.querySelector(id)
    if (!page) throw Error('Page does not exist')

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
  if (location.protocol === 'http:') {
    fetch('/user')
      .then((response) => {
        if (!response.ok) throw Error('Server error for /user')

        return response.json()
      })
      .then(({ user }) => {
        HN.user = new HN({ user })
        const userPage = document.createElement(Page.TAG, Page)
        userPage.setAttribute('id', 'user')

        document.querySelector('nav').add('user', user)
        document.querySelector('main').appendChild(userPage)
      })
  }
  document.querySelector('nav').initialize()
}
