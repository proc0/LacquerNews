class Item extends View {
  static render(item) {
    const article = document.createElement('article')
    const title = document.createElement('h1')
    // const subtitle = document.createElement('h2')

    article.setAttribute('id', item.id)

    title.textContent = item.title

    article.append(title)

    if (item.kids?.length > 0) {
      const details = document.createElement('details')
      const summary = document.createElement('summary')
      const section = document.createElement('section')

      summary.textContent = 'Load more'
      details.append(summary)
      details.append(section)
      article.append(details)
    }

    return article
  }
}
