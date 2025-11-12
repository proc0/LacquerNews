class App extends HTMLElement {
  constructor() {
    super()
  }

  initialize() {
    const loginButton = document.createElement('button')
    loginButton.textContent = 'login'

    loginButton.addEventListener('click', () => {
      const headers = new Headers({
        'Access-Control-Allow-Origin': '*',
      })
      fetch('http://localhost:3000/login', {
        credentials: 'include',
        mode: 'no-cors',
      }).then((res) => {
        console.log(res.headers)
        res.headers.getSetCookie()
      })
    })
    this.append(loginButton)
    const TAG_PAGE = 'app-page'
    customElements.define(TAG_PAGE, Page)
    const page = document.createElement(TAG_PAGE)
    page.setAttribute('data-type', 'Top')
    this.appendChild(page)

    // const page2 = document.createElement(TAG_PAGE)
    // page2.setAttribute('data-type', 'Ask')
    // this.appendChild(page2)

    return this
  }
}

window.onload = function () {
  const TAG_APP = 'app-main'
  customElements.define(TAG_APP, App, { extends: 'main' })
  const main = document.createElement('main', { is: TAG_APP }).initialize()

  document.querySelector('body').prepend(main)
}
