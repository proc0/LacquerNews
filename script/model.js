class Model {
  store = new Store()

  list(cursor, count, source) {
    if (source instanceof Stories) {
      return Client.fetchBase(source.url).then((ids) => ids.slice(cursor, cursor + count))
    } else if (typeof source === 'number') {
      return this.store.find(source).then((item) => item.kids.slice(cursor, cursor + count))
    } else {
      return this.unit(this.unit([]))
    }
  }

  load({ cursor, count, source }) {
    return this.list(cursor, count, source)
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
        if (!items?.length) {
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
