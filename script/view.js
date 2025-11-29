class View extends HTMLElement {
  static model = new Model()
  static EVENT_LOAD = 'load'

  constructor() {
    super()

    this.addEventListener(View.EVENT_LOAD, ({ detail, target }) => {
      View.render(target)
      View.model.load(detail).then(Page.render(target)).then(View.clean(target))
    })
  }

  static render(parent) {
    const isPage = parent instanceof Page
    const loader = (isPage ? Page : Item).queryLoader(parent)
    const container = isPage ? parent : parent.querySelector('section')

    const loadingText = document.createElement('span')
    loadingText.setAttribute('data-loading', '')
    loadingText.textContent = 'Loading...'

    if (loader) {
      container.insertBefore(loadingText, loader)
    } else {
      container.appendChild(loadingText)
    }
  }

  static clean(parent) {
    return () => parent.querySelector('span[data-loading]').remove()
  }

  static labelTime(begin, end) {
    const ellapsed = end - begin
    const seconds = Math.floor(ellapsed / 1000)
    const minutes = Math.floor(ellapsed / 60000)
    const hours = Math.floor(ellapsed / 3600000)
    const days = Math.floor(ellapsed / 86400000)

    let timeLabel = ''
    if (seconds < 60) {
      const label = seconds === 1 ? 'second' : 'seconds'
      timeLabel = `${seconds} ${label}`
    } else if (minutes < 60) {
      const label = minutes === 1 ? 'minute' : 'minutes'
      timeLabel = `${minutes} ${label}`
    } else if (hours < 24) {
      const label = hours === 1 ? 'hour' : 'hours'
      timeLabel = `${hours} ${label}`
    } else {
      const label = days === 1 ? 'day' : 'days'
      timeLabel = `${days} ${label}`
    }

    return timeLabel
  }

  static stopEvent(event) {
    event.stopPropagation()
  }

  static loadEvent(cursor, count, source) {
    return new CustomEvent(View.EVENT_LOAD, {
      bubbles: true,
      detail: {
        cursor,
        count,
        source,
      },
    })
  }
}
