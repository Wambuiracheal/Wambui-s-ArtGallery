import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)
const CART_KEY = 'horizon_cart'

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || [] } catch { return [] }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)) } catch { /* storage unavailable */ }
  }, [items])

  const add = (art) => setItems(list => list.some(i => i.id === art.id) ? list : [...list, art])
  const remove = (id) => setItems(list => list.filter(i => i.id !== id))
  const removeMany = (ids) => setItems(list => list.filter(i => !ids.includes(i.id)))
  const clear = () => setItems([])
  const has = (id) => items.some(i => i.id === id)
  const total = items.reduce((sum, i) => sum + Number(i.price || 0), 0)

  return (
    <CartContext.Provider value={{ items, add, remove, removeMany, clear, has, total, count: items.length }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
