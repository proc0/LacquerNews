class View extends HTMLElement {
  static model = new Model()

  constructor() {
    super()

    this.addEventListener('load', ({ detail, target }) => {
      View.model.getItems(detail).then(Page.render(target))
    })
  }

  static getEllapsedText(begin, end) {
    const ellapsed = end - begin
    const minutes = Math.floor(ellapsed / 60000)
    const hours = Math.floor(ellapsed / 3600000)
    const days = Math.floor(ellapsed / 86400000)

    let ellapsedText = ''
    if (minutes < 60) {
      ellapsedText = `${minutes} minutes`
    } else if (hours < 24) {
      ellapsedText = `${hours} hours`
    } else {
      ellapsedText = `${days} days`
    }

    return ellapsedText
  }
}
