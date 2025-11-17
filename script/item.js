class Item extends View {
  static render(item) {
    const article = document.createElement('article')
    article.setAttribute('id', item.id)

    const title = document.createElement('h1')

    if (item.title && item.url) {
      const link = document.createElement('a')
      link.setAttribute('target', '_blank')
      link.setAttribute('href', item.url)
      link.textContent = item.title
      link.addEventListener('click', (event) => {
        event.stopPropagation()
      })
      title.append(link)
      article.append(title)
    }

    if (item.text) {
      const subtitle = document.createElement('h2')
      const username = document.createElement('span')
      username.textContent = item.by
      subtitle.textContent = ` ⏲ ${View.getEllapsedText(item.time * 1000, Date.now())} `
      subtitle.prepend(username)
      article.append(subtitle)

      const comment = document.createElement('div')
      comment.innerHTML = item.text

      const links = comment.querySelectorAll('a')
      if (links?.length) {
        links.forEach((link) => {
          link.setAttribute('target', '_blank')
        })
      }

      article.append(comment)
    }

    if (item.kids?.length > 0) {
      const details = document.createElement('details')
      const summary = document.createElement('summary')
      const section = document.createElement('section')
      section.textContent = 'Test'
      title.addEventListener('click', () => {
        summary.click()
      })
      summary.textContent = 'Comments'
      details.append(summary)
      details.append(section)
      article.append(details)
    }

    return article
  }
}
