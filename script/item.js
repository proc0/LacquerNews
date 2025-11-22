class Item extends View {
  static LOAD_COUNT = 3

  static onLoadMore(event) {
    event.stopPropagation()
    const article = event.target.parentElement.parentElement
    const childrenLength = Item.queryChildrenLength(article)

    // TODO: abstract this event dispatch
    if (article instanceof Page) {
      return article.dispatchEvent(
        new CustomEvent('load', {
          bubbles: true,
          detail: {
            cursor: childrenLength,
            count: Page.LOAD_COUNT,
            source: Stories[article.getAttribute('data-type')],
          },
        })
      )
    }

    const itemId = article.getAttribute('id')
    const kidsNumber = Number(article.getAttribute('data-kids'))
    const kidsLength = kidsNumber > Item.LOAD_COUNT ? kidsNumber - childrenLength : kidsNumber
    const kidsLeft = kidsLength > Item.LOAD_COUNT ? kidsLength - Item.LOAD_COUNT : 0
    article.setAttribute('data-kids', kidsLeft)

    if (kidsLeft === 0) {
      event.target.parentElement.remove()
    } else {
      event.target.textContent = `${'✛'.repeat(kidsLeft)}`
    }
    article.querySelector('details').setAttribute('open', '')
    return article.dispatchEvent(
      new CustomEvent('load', {
        bubbles: true,
        detail: {
          cursor: childrenLength,
          count: Item.LOAD_COUNT,
          source: Number(itemId),
        },
      })
    )
  }

  static onExpand(event) {
    event.stopPropagation()
    const article = event.target.parentElement
    const loader = Item.queryLoader(article)

    Item.toggleContainer(article)

    if (!Item.queryChildrenLength(article) && !!loader) {
      loader.click()
    }
  }

  static render(item) {
    const article = document.createElement('article')
    article.setAttribute('id', item.id)

    if (item.deleted || item.dead || item.text === '[delayed]') {
      article.setAttribute('data-deleted', '')
      return article
    }

    article.setAttribute('data-kids', item.kids?.length || 0)

    if (item.title && item.url) {
      const link = document.createElement('a')
      link.setAttribute('target', '_blank')
      link.setAttribute('href', item.url)
      link.textContent = item.title
      link.addEventListener('click', this.depropagate)

      const title = document.createElement('h1')
      title.append(link)
      title.addEventListener('click', Item.onExpand)
      article.append(title)
    }

    if (item.text) {
      const username = document.createElement('span')
      username.textContent = item.by

      const subtitle = document.createElement('h2')
      subtitle.textContent = ` ⏲ ${View.getEllapsedText(item.time * 1000, Date.now())} `
      subtitle.prepend(username)
      article.append(subtitle)
      subtitle.addEventListener('click', Item.onExpand)

      const comment = document.createElement('div')
      comment.innerHTML = item.text

      const links = comment.querySelectorAll('a')
      if (links?.length) {
        links.forEach((link) => link.setAttribute('target', '_blank'))
      }

      article.append(comment)
    }

    if (item.kids?.length > 0) {
      const details = document.createElement('details')
      const summary = document.createElement('summary')
      const section = document.createElement('section')

      details.append(summary)
      details.append(section)
      article.append(details)

      const button = document.createElement('button')
      button.textContent = `${'✛'.repeat(item.kids.length)}`
      button.addEventListener('click', Item.onLoadMore)

      const footer = document.createElement('footer')
      footer.append(button)
      article.append(footer)
    }

    return article
  }

  static toggleContainer(item) {
    const container = Item.queryChildrenContainer(item)

    if (!container) return

    if (container.getAttribute('open') === '') {
      container.setAttribute('open', '')
    } else {
      container.removeAttribute('open')
    }
  }

  static queryChildrenContainer(item) {
    return item.querySelector('details')
  }

  static queryLoader(item) {
    return item.querySelector('& > footer button')
  }

  static queryChildrenLength(item) {
    return item.querySelectorAll('details > section > article')?.length || 0
  }
}
