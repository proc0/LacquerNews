class Model {
  store = new Store()

  list(cursor, count, id) {
    switch (typeof id) {
      case 'string':
        if (id === 'user') {
          return Client.fetchPosts(id).then(({ submitted }) =>
            submitted.slice(cursor, cursor + count)
          )
        } else {
          return Client.fetchPosts(id).then((ids) => ids.slice(cursor, cursor + count))
        }
      case 'number':
        return this.store.find(id).then(({ kids }) => kids.slice(cursor, cursor + count))
      default:
        return this.unit(this.unit([]))
    }
  }

  load({ cursor, count, id }) {
    return this.list(cursor, count, id)
      .then(this.store.retrieve.bind(this.store))
      .then(this.reload.bind(this))
      .catch(console.error)
  }

  reload({ foundItems, missingIds }) {
    return new Promise((resolve, reject) => {
      if (!missingIds.length) {
        return foundItems.length ? resolve(foundItems) : reject({ foundItems, missingIds })
      }

      return Client.fetchItems(missingIds).then((items) => {
        const validItems = items?.filter((a) => a).length
        if (!validItems || validItems !== items.length) {
          return reject(items)
        }

        return this.store.saveAll(items).then(() => {
          return resolve(items.concat(foundItems))
        })
      })
    })
  }

  unit(result) {
    return new Promise((resolve) => resolve(result))
  }
}
