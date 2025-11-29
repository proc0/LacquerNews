class Item {
  static LOAD_COUNT = 3

  static countChildren(node) {
    return node.querySelectorAll('& > details > section > article')?.length || 0
  }

  static queryLoader(node) {
    return node.querySelector('& > details > section > button')
  }

  static queryContainer(node) {
    return node.querySelector('details')
  }

  static getKidsNumber(node) {
    return Number(node.getAttribute('data-kids'))
  }

  static setKidsNumber(node, kidsNumber) {
    node.setAttribute('data-kids', kidsNumber)

    return node
  }

  static isContainerOpen(node) {
    const container = Item.queryContainer(node)

    if (!container) return false

    return container.getAttribute('open') === ''
  }

  static openContainer(node) {
    const container = Item.queryContainer(node)

    if (!container) return

    container.setAttribute('open', '')

    return container
  }

  static toggleContainer(node) {
    const container = Item.queryContainer(node)

    if (!container) return

    if (container.getAttribute('open') === '') {
      container.removeAttribute('open')
    } else {
      container.setAttribute('open', '')
    }

    return container
  }

  static onLoad(event) {
    event.stopPropagation()
    const button = event.target
    const article = button.closest('article')

    const loadCount = Item.LOAD_COUNT
    const childCount = Item.countChildren(article)
    const kidsNumber = Item.getKidsNumber(article)
    const kidsLength = kidsNumber > loadCount ? kidsNumber - childCount : kidsNumber
    const kidsLeft = kidsLength > loadCount ? kidsLength - loadCount : 0

    Item.setKidsNumber(article, kidsLeft)

    if (kidsLeft === 0) {
      button.remove()
    } else {
      button.textContent = `✛${kidsLeft}`
    }

    Item.openContainer(article)
    const itemId = article.getAttribute('id')
    const loadEvent = View.getLoadEvent(childCount, loadCount, Number(itemId))

    return article.dispatchEvent(loadEvent)
  }

  static onExpand(event) {
    event.stopPropagation()
    const article = event.target.closest('article')
    const loader = Item.queryLoader(article)

    Item.toggleContainer(article)

    if (!Item.countChildren(article) && !!loader) {
      loader.click()
    }
  }

  static onReply(event) {
    event.stopPropagation()
    const article = event.target.closest('article')
    const id = article.getAttribute('id')

    if (!Item.isContainerOpen(article)) {
      Item.onExpand(event)
    }

    const form = document.createElement('form')
    form.setAttribute('action', `/reply/${id}`)
    form.setAttribute('method', 'post')
    const textarea = document.createElement('textarea')
    textarea.setAttribute('name', 'text')
    const submitButton = document.createElement('button')
    submitButton.textContent = 'submit'
    submitButton.setAttribute('type', 'submit')

    form.appendChild(textarea)
    form.appendChild(submitButton)
    article.querySelector('div').insertAdjacentElement('afterend', form)
  }

  static render(item) {
    if (item.deleted || item.dead || item.text === '[delayed]') return

    const node = document.getElementById('item').content.cloneNode(true)
    const article = node.querySelector('article')
    article.setAttribute('id', item.id)

    // set kid count in attribute
    const kidCount = item.kids?.length || 0
    Item.setKidsNumber(article, kidCount)

    if (item.title) {
      const title = node.querySelector('h1')
      if (item.url) {
        const link = node.querySelector('a')
        link.setAttribute('href', item.url)
        link.textContent = item.title
        link.addEventListener('click', View.depropagate)
      } else {
        title.textContent = item.title
      }
      // expand details
      title.addEventListener('click', Item.onExpand)
    }

    const subtitle = node.querySelector('h2')

    if (item.by && item.time) {
      // score and username
      subtitle.querySelector('span').textContent = `${item.score || ''} ${item.by} `
      // time of post and comment count
      const childCount = item.descendants || kidCount
      const childCountLabel = childCount > 0 ? `🗨 ${childCount}` : ''
      const timeLabel = View.getTimeLabel(item.time * 1000, Date.now())
      subtitle.querySelector('time').textContent = `⏲ ${timeLabel} ${childCountLabel} `
      // expand details
      subtitle.addEventListener('click', Item.onExpand)
    }

    // reply button click event
    subtitle.querySelector('button').addEventListener('click', Item.onReply)
    const section = node.querySelector('section')

    if (item.text) {
      const comment = document.createElement('div')
      comment.innerHTML = item.text
      // process comment links
      comment.querySelectorAll('a')?.forEach((a) => a.setAttribute('target', '_blank'))
      if (item.type === 'comment') {
        subtitle.insertAdjacentElement('afterend', comment)
      } else {
        section.insertAdjacentElement('afterbegin', comment)
      }
    }

    if (kidCount > 0) {
      const button = section.querySelector('button')
      button.textContent = `✛${kidCount}`
      button.addEventListener('click', Item.onLoad)
      section.insertAdjacentElement('beforeend', button)
    } else {
      node.querySelector('details').remove()
    }

    return node
  }
}
