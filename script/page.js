class Page extends View {
  static BATCH_KIDS = 3
  static BATCH_POSTS = 5
  #RESOURCE

  connectedCallback() {
    this.RESOURCE = Resource[this.getAttribute('data-type')]
    this.dispatchEvent(
      new CustomEvent('load', {
        bubbles: true,
        detail: { cursor: 0, count: Page.BATCH_POSTS, resource: this.RESOURCE },
      })
    )
  }

  static onLoadMore(event) {
    event.stopPropagation()
    const details = event.target.parentElement.parentElement
    const parent = details.parentElement
    const childrenLength = Page.queryChildrenLength(parent)

    if (parent instanceof Page) {
      return parent.dispatchEvent(
        new CustomEvent('load', {
          bubbles: true,
          detail: {
            cursor: childrenLength,
            count: Page.BATCH_POSTS,
            resource: Resource[parent.getAttribute('data-type')],
          },
        })
      )
    }

    const itemId = parent.getAttribute('id')
    const kidsNumber = Number(parent.getAttribute('data-kids'))
    const kidsLength = kidsNumber > Page.BATCH_KIDS ? kidsNumber - childrenLength : kidsNumber
    const kidsLeft = kidsLength > Page.BATCH_KIDS ? kidsLength - Page.BATCH_KIDS : 0
    parent.setAttribute('data-kids', kidsLeft)

    if (kidsLeft === 0) {
      details.remove()
    } else {
      event.target.textContent = `${'✛'.repeat(kidsLeft)}`
    }

    return parent.dispatchEvent(
      new CustomEvent('load', {
        bubbles: true,
        detail: {
          cursor: childrenLength,
          count: Page.BATCH_KIDS,
          resource: Number(itemId),
        },
      })
    )
  }

  static onExpand(event) {
    // event.stopImmediatePropagation()
    const details = event.currentTarget
    const loader = Page.queryLoader(details)
    if (!details.open && !Page.queryChildrenLength(details) && !!loader) {
      loader.click()
    }
  }

  static renderLoader(item) {
    const button = document.createElement('button')
    if (item?.kids?.length) {
      button.textContent = `${'✛'.repeat(item.kids.length)}`
    } else {
      button.textContent = 'Load more'
    }
    button.addEventListener('click', Page.onLoadMore)

    const details = document.createElement('details')
    details.setAttribute('data-loader', '')
    const summary = document.createElement('summary')
    summary.append(button)
    details.append(summary)

    return details
  }

  static render(parent) {
    return (items) => {
      const loader = Page.queryLoader(parent)

      items.forEach((item) => {
        const post = Page.renderItem(item)

        if (post.getAttribute('data-deleted') === '') {
          parent.setAttribute('data-kids', Number(post.getAttribute('data-kids') - 1))
        }

        if (loader) {
          parent.insertBefore(post, loader.parentElement.parentElement)
        } else {
          parent.append(post)
        }
      })

      if (parent instanceof Page && !loader) {
        const loadMore = Page.renderLoader()
        parent.append(loadMore)
      }
    }
  }

  static renderItem(item) {
    const details = document.createElement('details')
    details.setAttribute('id', item.id)

    if (item.deleted || item.dead || item.text === '[delayed]') {
      details.setAttribute('data-deleted', '')
      return details
    }

    const summary = document.createElement('summary')
    const section = document.createElement('section')
    details.setAttribute('data-kids', item.kids?.length || 0)

    if (item.title) {
      const title = document.createElement('h1')
      const link = document.createElement('a')
      link.setAttribute('href', item.url)
      link.setAttribute('target', '_blank')
      link.textContent = `${item.title}`
      title.setAttribute('title', item.url)
      title.append(link)
      if (item.type != 'job') {
        const scoreCommentCounter = document.createElement('div')
        const score = document.createElement('span')
        score.textContent = item.score
        scoreCommentCounter.append(score)
        if (item.descendants) {
          const commentCounter = document.createElement('span')
          commentCounter.textContent = item.descendants
          scoreCommentCounter.append(commentCounter)
        }
        summary.append(scoreCommentCounter)

        //upvote and downvote
        const arrows = document.createElement('div')
        const upArrow = document.createElement('button')
        upArrow.textContent = '▲'

        upArrow.addEventListener('click', (e) => {
          cookieStore.getAll().then((cookie) => {
            const headers = new Headers({
              'Content-Type': 'application/x-www-form-urlencoded',
              'Access-Control-Allow-Origin': '*',
              'Cookie': cookie,
            })
            fetch(`http://localhost:3000/upvote/${item.id}`, {
              headers,
              mode: 'no-cors',
              credentials: 'include',
            }).then((res) => console.log(res))
          })
        })
        const downArrow = document.createElement('button')
        downArrow.textContent = '▼'
        downArrow.addEventListener('click', (e) => console.log('down'))
        arrows.append(upArrow)
        arrows.append(downArrow)
        summary.append(arrows)
      } else {
        const placeholder = document.createElement('div')
        const placeholder2 = document.createElement('div')
        summary.append(placeholder)
        summary.append(placeholder2)
      }
      summary.append(title)
    } else {
      const subtitle = document.createElement('h2')
      const username = document.createElement('span')
      username.textContent = item.by
      subtitle.textContent = ` ⏲ ${View.getEllapsedText(item.time * 1000, Date.now())} `
      subtitle.prepend(username)
      summary.append(subtitle)
      details.setAttribute('open', '')
    }

    if (item.text) {
      const comment = document.createElement('div')
      comment.innerHTML = item.text

      const links = comment.querySelectorAll('a')
      if (links?.length) {
        links.forEach((link) => {
          link.setAttribute('target', '_blank')
        })
      }

      section.append(comment)
    }

    details.append(summary)
    details.append(section)

    if (item.kids?.length > 0) {
      const loader = Page.renderLoader(item)
      details.append(loader)

      details.addEventListener('click', Page.onExpand)
    }

    return details
  }

  static queryLoader(item) {
    return item.querySelector('& > details[data-loader] > summary > button')
  }

  static queryChildrenLength(item) {
    return item.querySelectorAll('& > details:not([data-loader])')?.length || 0
  }
}
