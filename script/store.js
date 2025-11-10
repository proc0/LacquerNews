class Store {
  static DB_NAME = 'LacquerNews'
  static STORE_NAME = 'items'
  static VERSION = 1
  static CACHE_LIFE = 5 * 60 * 1000

  constructor() {
    const openRequest = window.indexedDB.open(Store.DB_NAME, Store.VERSION)
    openRequest.onerror = this.throwError('Initializing')
    openRequest.onupgradeneeded = this.upgrade.bind(this)
    openRequest.onsuccess = ({ target }) => {
      this.database = target.result
    }
  }

  createStore(database) {
    console.log('Creating store...')
    const store = database.createObjectStore(Store.STORE_NAME)
    store.createIndex('id', 'id', { unique: true })
    store.createIndex('title', 'title', { unique: false })
  }

  find(id) {
    return new Promise((resolve, reject) => {
      this.transact('readonly', (store) => {
        const getRequest = store.get(id)

        getRequest.onsuccess = ({ target }) => {
          resolve(target.result)
        }

        return getRequest
      })
    })
  }

  retrieve(ids) {
    return Promise.all(ids.map(this.find.bind(this))).then((items) => {
      const foundItems = items.filter(
        (item) => item && Date.now() - item.savedAt < Store.CACHE_LIFE
      )
      const missingIds = ids.filter(
        (id) => foundItems.filter((item) => item.id === id).length === 0
      )

      return { foundItems, missingIds }
    })
  }

  migrate(migration, target) {
    if (!migration || !target.transaction) return
    // version upgrade migration
    const store = target.transaction.objectStore(Store.STORE_NAME)
    const cursorRequest = store.openCursor()
    cursorRequest.onerror = this.throwError('Migration')
    cursorRequest.onsuccess = ({ target }) => {
      const cursor = target.result
      if (!cursor) {
        return console.log('Migration complete.')
      }
      // migrate item
      const item = cursor.value
      const migrated = migration(item)
      // save item
      const putRequest = store.put(migrated, migrated.id)
      putRequest.onerror = this.throwError(`Migrating task ${migrated.id}`)
      putRequest.onsuccess = (success) => {
        console.log(`Migrated item ${success.target.result}.`)
      }

      cursor.continue()
    }
  }

  save(item) {
    return new Promise((resolve, reject) => {
      this.transact('readwrite', (store) => {
        item.savedAt = Date.now()

        const saveRequest = store.put(item, item.id)
        saveRequest.onsuccess = (success) => {
          resolve(success.target.result)
        }

        return saveRequest
      })
    })
  }

  saveAll(items) {
    return Promise.all(items.map(this.save.bind(this)))
  }

  throwError(context) {
    return ({ target }) => {
      throw new Error(`Store Error: ${context}`, { cause: target.error })
    }
  }

  transact(operation, order) {
    const transaction = this.database.transaction(Store.STORE_NAME, operation)
    const store = transaction.objectStore(Store.STORE_NAME)

    const request = order(store)
    if (request) {
      request.onerror = this.throwError('Transaction')
    }

    return request
  }

  upgrade({ target, oldVersion }) {
    const database = target.result
    database.onerror = this.throwError('Upgrade')
    // object store does not exist
    if (!database.objectStoreNames.contains(Store.STORE_NAME)) {
      this.createStore(database)
    } else if (database.version !== Store.VERSION) {
      console.log(`Migrating version ${oldVersion} to ${database.version}.`)
      // version to migrate
      if (oldVersion === 1) {
        // migration = (task) => { /* modify task to new version here */ }
        let migration = null
        this.migrate(migration, target)
      }
    }
  }
}
