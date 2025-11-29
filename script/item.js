class Item {
  static PAYLOAD = 3

  static countChildNodes(node) {
    return node.querySelectorAll('& > details > section > article')?.length || 0
  }

  static queryLoader(node) {
    return node.querySelector('& > details > section > button')
  }

  static queryReplyForm(node) {
    const form =
      node.parentElement instanceof Page
        ? node.querySelector('& > details > section > form')
        : node.querySelector('& > form')

    return form
  }

  static queryComment(node) {
    const comment =
      node.parentElement instanceof Page
        ? node.querySelector('& > details > section > div')
        : node.querySelector('& > div')

    return comment
  }

  static getKidData(node) {
    return Number(node.getAttribute('data-kids'))
  }

  static setKidData(node, count) {
    node.setAttribute('data-kids', count)

    return node
  }

  static isContainerOpen(node) {
    const container = node.querySelector('details')

    if (!container) return false

    return container.getAttribute('open') === ''
  }

  static openContainer(node) {
    const container = node.querySelector('details')

    if (!container) return

    container.setAttribute('open', '')

    return container
  }

  static toggleContainer(node) {
    const container = node.querySelector('details')

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

    const payload = Item.PAYLOAD
    const current = Item.countChildNodes(article)
    const available = Item.getKidData(article)
    const requested = available > payload ? available - current : available
    const remaining = requested > payload ? requested - payload : 0
    Item.setKidData(article, remaining)

    if (remaining > 0) {
      button.textContent = `✛${remaining}`
    } else {
      button.remove()
    }

    Item.openContainer(article)
    const id = Number(article.getAttribute('id'))
    const loadEvent = View.loadEvent(current, payload, id)

    return article.dispatchEvent(loadEvent)
  }

  static onExpand(event) {
    event.stopPropagation()
    const article = event.target.closest('article')
    const loader = Item.queryLoader(article)

    Item.toggleContainer(article)

    if (!Item.countChildNodes(article) && !!loader) {
      loader.click()
    }
  }

  static onReply(event) {
    event.stopPropagation()
    const article = event.target.closest('article')

    // return and remove form, if it exists
    const replyForm = Item.queryReplyForm(article)
    if (replyForm) return replyForm.remove()

    // render form template
    const temp = document.getElementById('reply').content.cloneNode(true)
    const form = temp.querySelector('form')
    const id = article.getAttribute('id')
    form.setAttribute('action', `/reply/${id}`)

    const comment = Item.queryComment(article)
    const isPost = article.parentElement instanceof Page
    if (isPost && !comment) {
      // when post has no text, prepend to section top
      const section = article.querySelector('& > details > section')
      section.insertAdjacentElement('afterbegin', form)
    } else {
      comment.insertAdjacentElement('afterend', form)
    }

    if (isPost && !Item.isContainerOpen(article)) {
      Item.openContainer(article)
    }
  }

  static render(item) {
    if (item.deleted || item.dead || item.text === '[delayed]') return

    const node = document.getElementById('item').content.cloneNode(true)
    const article = node.querySelector('article')
    article.setAttribute('id', item.id)

    // set kid count in data attribute
    const kidCount = item.kids?.length || 0
    Item.setKidData(article, kidCount)

    if (item.title) {
      const title = node.querySelector('h1')
      if (item.url) {
        const link = node.querySelector('a')
        link.setAttribute('href', item.url)
        link.textContent = item.title
        link.addEventListener('click', View.stopEvent)
      } else {
        title.textContent = item.title
      }
      // expand details
      title.addEventListener('click', Item.onExpand)
    }

    const subtitle = node.querySelector('h2')

    if (item.by && item.time) {
      // score and username
      subtitle.querySelector('b').textContent = `${item.score || ''}`
      subtitle.querySelector('i').textContent = `${item.by}`
      // time of post and comment count
      const childCount = item.descendants || kidCount
      const childLabel = childCount > 0 ? `🗨 ${childCount}` : ''
      subtitle.querySelector('span').textContent = `${childLabel}`
      const timeLabel = View.labelTime(item.time * 1000, Date.now())
      subtitle.querySelector('time').textContent = `⏲ ${timeLabel} `
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
      // attach post body in section to collapse it
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
