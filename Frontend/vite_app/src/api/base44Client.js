// In-memory mock of the base44 client so pages render and CRUD calls succeed.
const store = {
  products: [
    { id: 'p1', name: 'Sample Product A', sku: 'SPA-001', current_stock: 5, reorder_point: 10, unit_of_measure: 'pcs' },
    { id: 'p2', name: 'Sample Product B', sku: 'SPB-002', current_stock: 0, reorder_point: 5, unit_of_measure: 'pcs' },
  ],
  receipts: [
    { id: 'r1', receipt_number: 'RCPT-001', receipt_date: new Date().toISOString(), status: 'draft', items: [] },
  ],
  deliveries: [
    { id: 'd1', delivery_number: 'DLV-002', delivery_date: new Date().toISOString(), status: 'waiting', items: [] },
  ],
  transfers: [
    { id: 't1', transfer_number: 'TRF-003', transfer_date: new Date().toISOString(), status: 'ready', from_location: 'A', to_location: 'B', items: [] },
  ],
  warehouses: [
    { id: 'w1', name: 'Main Warehouse', code: 'MAIN', location: 'HQ', type: 'main_warehouse', is_active: true },
  ],
  adjustments: [],
  moveHistory: [],
}

let idCounter = 100
const genId = (prefix='id') => `${prefix}_${++idCounter}`

export const base44 = {
  entities: {
    Product: {
      list: (sort) => Promise.resolve(store.products.slice()),
      create: (data) => {
        const item = { id: genId('p'), ...data }
        store.products.push(item)
        return Promise.resolve(item)
      },
      update: (id, data) => {
        const idx = store.products.findIndex(p => p.id === id)
        if (idx !== -1) store.products[idx] = { ...store.products[idx], ...data }
        return Promise.resolve(store.products[idx])
      }
    },

    Receipt: {
      list: () => Promise.resolve(store.receipts.slice()),
      create: (data) => {
        const item = { id: genId('r'), ...data }
        store.receipts.push(item)
        return Promise.resolve(item)
      },
      update: (id, data) => {
        const idx = store.receipts.findIndex(r => r.id === id)
        if (idx !== -1) store.receipts[idx] = { ...store.receipts[idx], ...data }
        return Promise.resolve(store.receipts[idx])
      }
    },

    Delivery: {
      list: () => Promise.resolve(store.deliveries.slice()),
      create: (data) => {
        const item = { id: genId('d'), ...data }
        store.deliveries.push(item)
        return Promise.resolve(item)
      },
      update: (id, data) => {
        const idx = store.deliveries.findIndex(d => d.id === id)
        if (idx !== -1) store.deliveries[idx] = { ...store.deliveries[idx], ...data }
        return Promise.resolve(store.deliveries[idx])
      }
    },

    Transfer: {
      list: () => Promise.resolve(store.transfers.slice()),
      create: (data) => {
        const item = { id: genId('t'), ...data }
        store.transfers.push(item)
        return Promise.resolve(item)
      },
      update: (id, data) => {
        const idx = store.transfers.findIndex(t => t.id === id)
        if (idx !== -1) store.transfers[idx] = { ...store.transfers[idx], ...data }
        return Promise.resolve(store.transfers[idx])
      }
    },

    Warehouse: {
      list: () => Promise.resolve(store.warehouses.slice()),
      create: (data) => {
        const item = { id: genId('w'), ...data }
        store.warehouses.push(item)
        return Promise.resolve(item)
      },
      update: (id, data) => {
        const idx = store.warehouses.findIndex(w => w.id === id)
        if (idx !== -1) store.warehouses[idx] = { ...store.warehouses[idx], ...data }
        return Promise.resolve(store.warehouses[idx])
      }
    },

    Adjustment: {
      list: () => Promise.resolve(store.adjustments.slice()),
      create: (data) => {
        const item = { id: genId('a'), ...data }
        store.adjustments.push(item)
        return Promise.resolve(item)
      },
      update: (id, data) => {
        const idx = store.adjustments.findIndex(a => a.id === id)
        if (idx !== -1) store.adjustments[idx] = { ...store.adjustments[idx], ...data }
        return Promise.resolve(store.adjustments[idx])
      }
    },

    MoveHistory: {
      list: (sort = '-updated_date', limit = 100) => Promise.resolve(store.moveHistory.slice(0, limit)),
      create: (data) => {
        const item = { id: genId('mh'), operation_date: new Date().toISOString(), ...data }
        store.moveHistory.unshift(item)
        return Promise.resolve(item)
      }
    }
  }
}

export default base44;
