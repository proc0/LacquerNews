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
    const parent = event.target.parentElement.parentElement.parentElement
    const childrenLength = Page.queryChildrenLength(parent)

    if (parent instanceof Page) {
      return parent.dispatchEvent(
        new CustomEvent('load', {
          bubbles: true,
          detail: {
            cursor: childrenLength,
            count: Page.BATCH_POSTS,
            resource: Resource.Top,
          },
        })
      )
    }

    const itemId = parent.getAttribute('id')
    const kidsNumber = Number(parent.getAttribute('data-kids'))
    const kidsLength = kidsNumber > Page.BATCH_KIDS ? kidsNumber - childrenLength : kidsNumber
    const kidsLeft = kidsLength > Page.BATCH_KIDS ? kidsLength - Page.BATCH_KIDS : 0
    parent.setAttribute('data-kids', kidsLeft)

    const loader = Page.queryLoader(parent)
    if (kidsLeft === 0 && loader) {
      loader.remove()
    } else {
      loader.textContent = `${'∨'.repeat(kidsLeft)}`
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
    event.stopImmediatePropagation()
    const details = event.currentTarget
    const loader = Page.queryLoader(details)
    if (!details.open && !Page.queryChildrenLength(details) && !!loader) {
      loader.click()
    }
  }

  static renderLoader(item) {
    const button = document.createElement('button')
    if (item?.kids?.length) {
      button.textContent = `${'∨'.repeat(item.kids.length)}`
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
      title.textContent = `${item.title}`
      if (item.type != 'job') {
        const scoreCommentCounter = document.createElement('div')
        const score = document.createElement('span')
        score.textContent = item.score
        scoreCommentCounter.append(score)
        if (item.descendants) {
          const commentCounter = document.createElement('span')
          commentCounter.textContent = `(${item.descendants})`
          scoreCommentCounter.append(commentCounter)
        }
        summary.append(scoreCommentCounter)
      } else {
        const placeholder = document.createElement('div')
        summary.append(placeholder)
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
