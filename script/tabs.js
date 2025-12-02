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
    event.preventDefault()
    const id = event.target.getAttribute('href')
    if (location.hash !== id) {
      location.hash = id
      this.change(id)
    }
    scrollTo(0, 0)
  }

  change(id) {
    // clear active
    document.querySelector('nav .active')?.classList.remove('active')
    document.querySelector('main > .active')?.classList.remove('active')

    const page = document.querySelector(id)
    const tab = document.querySelector(`nav a[href="${id}"]`)
    tab.classList.add('active')
    page.classList.add('active')

    if (id === '#login') return

    if (!page) throw Error('Page does not exist')

    if (!Query.countChildren(page)) {
      page.load()
    }
  }
}

customElements.define(Tabs.TAG, Tabs, { extends: 'nav' })
