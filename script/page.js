class Page extends HTMLElement {
  static BATCH_KIDS = 3
  static BATCH_POSTS = 5

  constructor() {
    super()
  }

  connectedCallback() {
    this.dispatchEvent(
      new CustomEvent('load', {
        bubbles: true,
        detail: { cursor: 0, count: Page.BATCH_POSTS, resource: Resource.Top },
      })
    )
  }

  static onLoadMore(event) {
    event.stopPropagation()
    const post = event.target.parentElement
    const loadButton = post.querySelector('& > button')
    const numChildPosts = post.querySelectorAll('& > details')?.length || 0
    const itemId = post.getAttribute('id')
    const numItemKids = Number(post.getAttribute('data-kids'))

    const numKidsToFetch = numItemKids > Page.BATCH_KIDS ? numItemKids - numChildPosts : numItemKids
    const remaining = numKidsToFetch > Page.BATCH_KIDS ? numKidsToFetch - Page.BATCH_KIDS : 0
    post.setAttribute('data-kids', remaining)

    if (remaining === 0 && loadButton) {
      loadButton.remove()
    } else {
      loadButton.textContent = `${'∨'.repeat(remaining)}`
    }

    post.dispatchEvent(
      new CustomEvent('load', {
        bubbles: true,
        detail: {
          cursor: numChildPosts,
          count: 3,
          resource: Number(itemId),
        },
      })
    )
  }

  static onExpand(event) {
    event.stopImmediatePropagation()
    const details = event.currentTarget
    const moreButton = details.querySelector('& > button')
    if (!details.open && !details.querySelectorAll('& > details')?.length && moreButton) {
      moreButton.click()
    }
  }

  static render(parent) {
    return (items) => {
      const moreButton = parent.querySelector('& > button')
      const rootMoreButton = document.getElementById('load-more')

      items.forEach((item) => {
        const post = Page.renderItem(item)

        if (post.getAttribute('data-deleted') === '') {
          parent.setAttribute('data-kids', Number(post.getAttribute('data-kids') - 1))
        }

        if (parent instanceof Page && rootMoreButton) {
          parent.insertBefore(post, rootMoreButton)
        } else {
          if (moreButton) {
            parent.insertBefore(post, moreButton)
          } else {
            parent.append(post)
          }
        }
      })

      if (parent instanceof Page && !rootMoreButton) {
        const loadMore = document.createElement('button')
        loadMore.textContent = 'Load more'
        loadMore.addEventListener('click', (event) => {
          event.stopPropagation()
          parent.dispatchEvent(
            new CustomEvent('load', {
              bubbles: true,
              detail: { cursor: 0, count: Page.BATCH_POSTS, resource: Resource.Top },
            })
          )
        })
        const details = document.createElement('details')
        details.setAttribute('id', 'load-more')
        const summary = document.createElement('summary')
        summary.append(loadMore)
        details.append(summary)
        parent.append(details)
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
      const scoreCommentCounter = document.createElement('div')
      const score = document.createElement('span')
      score.textContent = item.score
      const commentCounter = document.createElement('span')
      commentCounter.textContent = `(${item.descendants})`
      scoreCommentCounter.append(score)
      scoreCommentCounter.append(commentCounter)
      summary.append(scoreCommentCounter)
      summary.append(title)
    } else {
      const subtitle = document.createElement('h2')
      const username = document.createElement('span')
      username.textContent = item.by
      subtitle.textContent = ` ⏲ ${Page.ellapse(item.time * 1000, Date.now())} `
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
      const moreButton = document.createElement('button')
      moreButton.textContent = `${'∨'.repeat(item.kids.length)}`
      details.append(moreButton)

      moreButton.addEventListener('click', Page.onLoadMore)
      details.addEventListener('click', Page.onExpand)
    }

    return details
  }

  static ellapse(begin, end) {
    // Get the time difference in milliseconds
    let timeDifferenceMS = end - begin
    // const startDate = new Date(begin)
    // const endDate = new Date(end)

    // // Check if either of the start or end date is in DST and
    // // adjust the DST offset accordingly.
    // if (
    //   endDate.getTimezoneOffset() < startDate.getTimezoneOffset() ||
    //   (startDate.getTimezoneOffset() < endDate.getTimezoneOffset() && startDate < endDate)
    // ) {
    //   // Adjust for the DST transition
    //   const dstTransition = endDate.getTimezoneOffset() - startDate.getTimezoneOffset()
    //   timeDifferenceMS -= dstTransition * 60 * 1000
    // }

    // Calculate the elapsed time in seconds, minutes, hours, and days
    // const timeDifferenceSecs = Math.floor(timeDifferenceMS / 1000)
    const timeDifferenceMins = Math.floor(timeDifferenceMS / 60000)
    const timeDifferenceHours = Math.floor(timeDifferenceMS / 3600000)
    const timeDifferenceDays = Math.floor(timeDifferenceMS / 86400000)

    let ellapsedTime = ''
    if (timeDifferenceMins < 60) {
      ellapsedTime = `${timeDifferenceMins} minutes`
    } else if (timeDifferenceHours < 24) {
      ellapsedTime = `${timeDifferenceHours} hours`
    } else {
      ellapsedTime = `${timeDifferenceDays} days`
    }

    return ellapsedTime
  }
}
