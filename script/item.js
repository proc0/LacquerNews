class Item {
  static LOAD_COUNT = 3

  static countChildren(node) {
    return node.querySelectorAll('& > details > section > article')?.length || 0
  }

  static getKidsNumber(node) {
    return Number(node.getAttribute('data-kids'))
  }

  static isNodeDead(node) {
    return node.getAttribute('data-dead') === ''
  }

  static queryContainer(node) {
    return node.querySelector('details')
  }

  static queryLoader(node) {
    return node.querySelector('& > details > section > footer > button')
  }

  static openContainer(container) {
    container.setAttribute('open', '')
    return container
  }

  static setKidsNumber(node, kidsNumber) {
    node.setAttribute('data-kids', kidsNumber)
    return node
  }

  static setNodeDead(node) {
    node.setAttribute('data-dead', '')
    return node
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
    const article = event.target.closest('article')

    if (article.getAttribute('id') === 'loader' && article.parentElement instanceof Page) {
      const page = article.parentElement
      const postCount = page.querySelectorAll('& > article')?.length || 0
      const loadEvent = View.getLoadEvent(postCount, Page.LOAD_COUNT, Page.getStory(page))
      return page.dispatchEvent(loadEvent)
    }

    const childCount = Item.countChildren(article)
    const kidsNumber = Item.getKidsNumber(article)
    const kidsLength = kidsNumber > Item.LOAD_COUNT ? kidsNumber - childCount : kidsNumber
    const kidsLeft = kidsLength > Item.LOAD_COUNT ? kidsLength - Item.LOAD_COUNT : 0

    Item.setKidsNumber(article, kidsLeft)

    if (kidsLeft === 0) {
      event.target.parentElement.remove()
    } else {
      // event.target.textContent = `${'✛'.repeat(kidsLeft)}`
      event.target.textContent = `✛${kidsLeft}`
    }

    Item.queryContainer(article).setAttribute('open', '')
    const itemId = article.getAttribute('id')
    const loadEvent = View.getLoadEvent(childCount, Item.LOAD_COUNT, Number(itemId))
    return article.dispatchEvent(loadEvent)
  }

  static onExpand(event) {
    event.stopPropagation()
    const article = event.target.parentElement
    const loader = Item.queryLoader(article)

    Item.toggleContainer(article)

    if (!Item.countChildren(article) && !!loader) {
      loader.click()
    }
  }

  static onReply(event) {
    event.stopPropagation()
    const article = event.target.parentElement
    const id = article.getAttribute('id')

    article.querySelector('& > button').remove()

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
    article.insertBefore(form, article.querySelector('details'))
  }

  static render(item) {
    const article = document.createElement('article')
    article.setAttribute('id', item.id)

    if (item.deleted || item.dead || item.text === '[delayed]') {
      return Item.setNodeDead(article)
    }

    Item.setKidsNumber(article, item.kids?.length || 0)

    const title = document.createElement('h1')
    const subtitle = document.createElement('h2')
    const details = document.createElement('details')
    const summary = document.createElement('summary')
    const section = document.createElement('section')
    const comment = document.createElement('div')

    if (item.title) {
      if (item.url) {
        const link = document.createElement('a')
        link.setAttribute('target', '_blank')
        link.setAttribute('href', item.url)
        link.textContent = item.title
        link.addEventListener('click', View.depropagate)
        title.append(link)
      } else {
        title.textContent = item.title
      }

      title.addEventListener('click', Item.onExpand)
    }

    if (item.by && item.time) {
      const username = document.createElement('span')
      username.textContent = `${item.score || ''} ${item.by} `
      const childCount = item.descendants || item.kids?.length || 0
      const childCountLabel = childCount > 0 ? `🗨 ${childCount}` : ''
      const timeLabel = View.getTimeLabel(item.time * 1000, Date.now())
      subtitle.textContent = `⏲ ${timeLabel} ${childCountLabel} `
      subtitle.prepend(username)
      subtitle.addEventListener('click', Item.onExpand)
    }

    if (item.text) {
      comment.innerHTML = item.text
      const links = comment.querySelectorAll('a')
      if (links?.length) {
        links.forEach((link) => link.setAttribute('target', '_blank'))
      }
    }

    if (item.type === 'comment') {
      article.append(subtitle)
      article.append(comment)
      const replyButton = document.createElement('button')
      replyButton.textContent = 'reply'
      replyButton.addEventListener('click', Item.onReply)
      article.appendChild(replyButton)
    } else {
      article.append(title)
      article.append(subtitle)
      section.append(comment)
    }

    if (item.kids?.length > 0 || (item.type !== 'comment' && item.text)) {
      details.append(summary)
      details.append(section)
      article.append(details)
    }

    if (item.kids?.length > 0) {
      const button = document.createElement('button')
      const footer = document.createElement('footer')
      // button.textContent = `${'✛'.repeat(item.kids.length)}`
      button.textContent = `✛${item.descendants || item.kids?.length || 0}`
      button.addEventListener('click', Item.onLoad)
      footer.append(button)
      section.append(footer)
    }

    return article
  }
}
