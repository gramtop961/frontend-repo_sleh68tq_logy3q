import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function useMenu() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchMenu = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/menu`)
      const data = await res.json()
      setItems(data)
    } catch (e) {
      setError('Failed to load menu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMenu() }, [])

  return { items, loading, error, refresh: fetchMenu }
}

function formatCurrency(n) {
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) } catch { return `$${n}` }
}

function App() {
  const { items, loading, error } = useMenu()
  const [cart, setCart] = useState({})
  const [showCart, setShowCart] = useState(false)

  const addToCart = (item) => {
    setCart(prev => {
      const current = prev[item.id] || { ...item, quantity: 0 }
      return { ...prev, [item.id]: { ...current, quantity: current.quantity + 1 } }
    })
  }

  const decFromCart = (id) => {
    setCart(prev => {
      const current = prev[id]
      if (!current) return prev
      const qty = current.quantity - 1
      const next = { ...prev }
      if (qty <= 0) delete next[id]
      else next[id] = { ...current, quantity: qty }
      return next
    })
  }

  const cartArray = useMemo(() => Object.values(cart), [cart])
  const subtotal = useMemo(() => cartArray.reduce((s, i) => s + i.price * i.quantity, 0), [cartArray])

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-orange-500 grid place-items-center text-white font-bold">AB</span>
            <div>
              <h1 className="text-lg font-semibold">Abbey Bites</h1>
              <p className="text-xs text-neutral-500 -mt-0.5">Fresh. Fast. Delicious.</p>
            </div>
          </div>
          <button onClick={() => setShowCart(s => !s)} className="relative px-3 py-1.5 text-sm rounded-full bg-orange-600 text-white font-medium">
            Cart {cartArray.length > 0 && <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full">{cartArray.length}</span>}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-md mx-auto px-4 py-6">
        <div className="bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl p-5 text-white shadow-md">
          <h2 className="text-2xl font-bold">Crave. Tap. Taste.</h2>
          <p className="text-sm text-white/90 mt-1">Order your favorites from Abbey Bites with fast delivery.</p>
          <div className="mt-4 flex gap-2">
            <input placeholder="Search menu" className="flex-1 px-3 py-2 rounded-lg text-black outline-none" />
            <button className="px-4 py-2 rounded-lg bg-black/20">Search</button>
          </div>
        </div>
      </section>

      {/* Menu List */}
      <main className="max-w-md mx-auto px-4 pb-28">
        {loading && <p className="text-center text-neutral-600">Loading menu...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        <div className="grid gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200 flex gap-4">
              <div className="w-20 h-20 rounded-lg bg-neutral-100 overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-neutral-400 text-xs">No Image</div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-neutral-900">{item.name}</h3>
                    <p className="text-sm text-neutral-500 line-clamp-2">{item.description}</p>
                  </div>
                  <span className="text-sm font-semibold text-neutral-900">{formatCurrency(item.price)}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {!cart[item.id] ? (
                    <button onClick={() => addToCart(item)} className="px-3 py-1.5 text-sm rounded-full bg-orange-600 text-white">Add</button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={() => decFromCart(item.id)} className="w-8 h-8 grid place-items-center rounded-full bg-neutral-100">-</button>
                      <span className="text-sm font-medium">{cart[item.id].quantity}</span>
                      <button onClick={() => addToCart(item)} className="w-8 h-8 grid place-items-center rounded-full bg-neutral-900 text-white">+</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-20">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCart(false)} />
          <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-md bg-white rounded-t-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Your Order</h3>
              <button onClick={() => setShowCart(false)} className="text-sm text-neutral-600">Close</button>
            </div>
            <div className="mt-3 grid gap-3 max-h-72 overflow-auto pr-1">
              {cartArray.length === 0 && <p className="text-sm text-neutral-500">Your cart is empty.</p>}
              {cartArray.map(i => (
                <div key={i.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{i.name}</p>
                    <p className="text-xs text-neutral-500">{formatCurrency(i.price)} x {i.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => decFromCart(i.id)} className="w-8 h-8 grid place-items-center rounded-full bg-neutral-100">-</button>
                    <span className="text-sm font-medium">{i.quantity}</span>
                    <button onClick={() => addToCart(i)} className="w-8 h-8 grid place-items-center rounded-full bg-neutral-900 text-white">+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-neutral-500">Subtotal</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            <button className="mt-3 w-full py-3 rounded-xl bg-orange-600 text-white font-medium disabled:opacity-50" disabled={cartArray.length===0}>
              Checkout
            </button>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-neutral-200">
        <div className="max-w-md mx-auto grid grid-cols-3 text-sm">
          <button className="py-3 text-orange-600 font-medium border-t-2 border-orange-600">Menu</button>
          <button className="py-3 text-neutral-600">Offers</button>
          <button className="py-3 text-neutral-600">Profile</button>
        </div>
      </nav>
    </div>
  )
}

export default App
