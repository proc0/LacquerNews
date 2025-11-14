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

  static renderLoading(parent) {
    const loadingText = document.createElement('span')
    loadingText.setAttribute('data-loading', '')
    loadingText.textContent = 'Loading...'

    parent.prepend(loadingText)
  }

  static render(parent) {
    return (items) => {
      //   const loader = Page.queryLoader(parent)
      //   const loading = parent.querySelector('span[data-loading]')

      //   if (loading) {
      //     loading.remove(0)
      //   }

      items.forEach((item) => {
        const post = Item.render(item)
        parent.appendChild(post)
        // if (post.getAttribute('data-deleted') === '') {
        //   parent.setAttribute('data-kids', Number(post.getAttribute('data-kids') - 1))
        // }

        // if (loader) {
        //   parent.insertBefore(post, loader.parentElement.parentElement)
        // } else {
        //   parent.append(post)
        // }
      })

      //   if (parent instanceof Page && !loader) {
      //     const loadMore = Page.renderLoader()
      //     parent.append(loadMore)
      //   }
    }
  }
}
