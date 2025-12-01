class Query {
  static container(node) {
    return node instanceof Page ? node : node.querySelector('section')
  }

  static countChildren(node) {
    return node instanceof Page
      ? node.querySelectorAll('& > article')?.length || 0
      : node.querySelectorAll('& > details > section > article')?.length || 0
  }

  static loader(node) {
    return node instanceof Page
      ? node.querySelector('& > button')
      : node.querySelector('& > details > section > button')
  }

  static reply(node) {
    const replyNode =
      node.parentElement instanceof Page
        ? node.querySelector('& > details > section > form')
        : node.querySelector('& > form')

    return replyNode
  }

  static text(node) {
    const textNode =
      node.parentElement instanceof Page
        ? node.querySelector('& > details > section > div')
        : node.querySelector('& > div')

    return textNode
  }
}
