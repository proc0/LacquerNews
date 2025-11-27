class View extends HTMLElement {
  static model = new Model()

  constructor() {
    super()

    this.addEventListener('load', ({ detail, target }) => {
      View.renderLoading(target)
      View.model
        .getItems(detail)
        .then(Page.render(target))
        .then(() => View.removeLoading(target))
    })
  }

  static renderLoading(parent) {
    const loadingText = document.createElement('span')
    loadingText.setAttribute('data-loading', '')
    loadingText.textContent = 'Loading...'

    parent.append(loadingText)
  }

  static removeLoading(parent) {
    parent.querySelector('span[data-loading]').remove()
  }

  static getTimeLabel(begin, end) {
    const ellapsed = end - begin
    const seconds = Math.floor(ellapsed / 1000)
    const minutes = Math.floor(ellapsed / 60000)
    const hours = Math.floor(ellapsed / 3600000)
    const days = Math.floor(ellapsed / 86400000)

    let ellapsedText = ''
    if (seconds < 60) {
      const label = seconds === 1 ? 'second' : 'seconds'
      ellapsedText = `${ellapsed} ${label}`
    } else if (minutes < 60) {
      const label = minutes === 1 ? 'minute' : 'minutes'
      ellapsedText = `${minutes} ${label}`
    } else if (hours < 24) {
      const label = hours === 1 ? 'hour' : 'hours'
      ellapsedText = `${hours} ${label}`
    } else {
      const label = days === 1 ? 'day' : 'days'
      ellapsedText = `${days} ${label}`
    }

    return ellapsedText
  }

  static depropagate(event) {
    event.stopPropagation()
  }

  static getLoadEvent(cursor, count, source) {
    return new CustomEvent('load', {
      bubbles: true,
      detail: {
        cursor,
        count,
        source,
      },
    })
  }
}
