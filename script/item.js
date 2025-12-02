class Item {
  static PAYLOAD = 3

  static close(node) {
    const details = node.querySelector('details')
    details?.removeAttribute('open')
    return details
  }

  static isOpen(node) {
    const details = node.querySelector('details')
    return details?.getAttribute('open') === ''
  }

  static open(node) {
    const details = node.querySelector('details')
    details?.setAttribute('open', '')
    return details
  }

  static toggleOpen(node) {
    return Item.isOpen(node) ? Item.close(node) : Item.open(node)
  }

  static onLoad(event) {
    event.stopPropagation()
    const loader = event.target
    const article = loader.closest('article')

    const payload = Item.PAYLOAD
    const current = Query.countChildren(article)
    const available = article.getAttribute('data-kids')
    const requested = available > payload ? available - current : available
    const remaining = requested > payload ? requested - payload : 0

    article.setAttribute('data-kids', remaining)

    if (remaining > 0) {
      loader.textContent = `✛${remaining}`
    } else {
      loader.remove()
    }

    Item.open(article)
    const id = Number(article.getAttribute('id'))
    const loadEvent = View.loadEvent(current, payload, id)

    return article.dispatchEvent(loadEvent)
  }

  static onExpand(event) {
    event.stopPropagation()
    const article = event.target.closest('article')
    const loader = Query.loader(article)

    Item.toggleOpen(article)

    if (!Query.countChildren(article) && loader) {
      loader.click()
    }
  }

  static onReply(event) {
    event.stopPropagation()
    const article = event.target.closest('article')

    // remove if exists
    const reply = Query.reply(article)
    if (reply) return reply.remove()

    // render
    const template = document.getElementById('reply')
    const node = template.content.cloneNode(true)
    const form = node.querySelector('form')
    const id = article.getAttribute('id')
    form.setAttribute('action', `/reply/${id}`)

    // attach
    const text = Query.text(article)
    const isPost = article.parentElement instanceof Page
    if (isPost && !text) {
      // when post has no text, prepend to section top
      let section = article.querySelector('& > details > section')
      if (!section) {
        // first!
        const details = document.createElement('details')
        const summary = document.createElement('summary')
        section = document.createElement('section')
        details.appendChild(summary)
        details.appendChild(section)
        article.appendChild(details)
      }
      section.insertAdjacentElement('afterbegin', form)
    } else {
      text.insertAdjacentElement('afterend', form)
    }

    if (isPost && !Item.isOpen(article)) {
      Item.open(article)
    }
  }

  static onVote(event) {
    event.stopPropagation()
    const button = event.target
    const article = button.closest('article')
    const isPost = article.parentElement instanceof Page
    const vote = button.getAttribute('name')
    const id = article.getAttribute('id')

    fetch(`/${vote}/${id}`).then((response) => {
      if (response.ok) {
        if (!isPost) {
          if (vote === 'upvote') {
            button.nextElementSibling.remove()
          } else {
            button.previousElementSibling.remove()
          }
        }
        button.remove()
      }
    })
  }

  static render(item) {
    const template = document.getElementById('item')
    const node = template.content.cloneNode(true)

    const article = node.querySelector('article')
    article.setAttribute('id', item.id)
    article.setAttribute('data-kids', item.kids.length)

    const title = node.querySelector('h1')
    if (item.title) {
      const link = node.querySelector('a')
      if (item.url) {
        link.setAttribute('href', item.url)
        link.textContent = item.title
        link.addEventListener('click', View.stopEvent)
      } else {
        link.remove()
        title.textContent = item.title
      }
      title.addEventListener('click', Item.onExpand)
    } else {
      title.remove()
    }

    const subtitle = node.querySelector('h2')

    const upvote = subtitle.querySelector('button[name="upvote"]')
    if (item.upvote) {
      upvote.addEventListener('click', Item.onVote)
    } else {
      upvote.remove()
    }

    const downvote = subtitle.querySelector('button[name="downvote"]')
    if (item.downvote) {
      downvote.addEventListener('click', Item.onVote)
    } else {
      downvote.remove()
    }

    const score = subtitle.querySelector('b')
    if (item.score) {
      score.textContent = `${item.score}`
    } else {
      score.remove()
    }

    const username = subtitle.querySelector('i')
    if (item.by) {
      username.textContent = `${item.by}`
    } else {
      username.remove()
    }

    const childCount = item.descendants || item.kids.length
    const labelCount = subtitle.querySelector('span')
    if (childCount) {
      labelCount.textContent = `🗨 ${childCount}`
    } else {
      labelCount.remove()
    }

    const age = subtitle.querySelector('time')
    if (item.time) {
      age.textContent = `⏲${Item.renderAge(item.time * 1000, Date.now())} `
      subtitle.addEventListener('click', Item.onExpand)
    } else {
      age.remove()
    }

    const reply = subtitle.querySelector('button[name="reply"]')
    if (item.reply) {
      reply.addEventListener('click', Item.onReply)
    } else {
      reply.remove()
    }

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

    if (item.kids.length) {
      const loader = section.querySelector('button')
      loader.textContent = `✛${item.kids.length}`
      loader.addEventListener('click', Item.onLoad)
      section.insertAdjacentElement('beforeend', loader)
    } else if (item.type === 'comment' || (item.type !== 'comment' && !item.text)) {
      node.querySelector('details').remove()
    }

    return node
  }

  static renderAge(begin, end) {
    const ellapsed = end - begin
    const seconds = Math.floor(ellapsed / 1000)
    const minutes = Math.floor(ellapsed / 60000)
    const hours = Math.floor(ellapsed / 3600000)
    const days = Math.floor(ellapsed / 86400000)

    let ageText = ''
    if (seconds < 60) {
      const label = seconds === 1 ? 'second' : 'seconds'
      ageText = `${seconds} ${label}`
    } else if (minutes < 60) {
      const label = minutes === 1 ? 'minute' : 'minutes'
      ageText = `${minutes} ${label}`
    } else if (hours < 24) {
      const label = hours === 1 ? 'hour' : 'hours'
      ageText = `${hours} ${label}`
    } else {
      const label = days === 1 ? 'day' : 'days'
      ageText = `${days} ${label}`
    }

    return ageText
  }
}
