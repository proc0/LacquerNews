class App extends HTMLElement {
  static TAG = 'app-main'
  #_isConnected = false

  constructor() {
    super()
  }

  get isConnected() {
    return this.#_isConnected
  }

  set isConnected(value) {
    this.#_isConnected = value
  }

  initialize() {
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

          const tabs = document.querySelector('nav')
          tabs.add('user', user)
          const app = document.querySelector('main')
          app.isConnected = true
          // remove login tab
          app.querySelector('aside').remove()
          tabs.querySelector('a[href="#login"]').remove()

          app.appendChild(userPage)
          tabs.initialize()
        })
    } else {
      document.querySelector('nav').initialize()
    }

    return this
  }
}

customElements.define(App.TAG, App, { extends: 'main' })

window.onload = function () {
  document.querySelector('main').initialize()
}
