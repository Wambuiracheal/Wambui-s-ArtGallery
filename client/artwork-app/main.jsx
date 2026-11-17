import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import './App.css'
import './pages.css'
import './fx.css'
import About from './components/About.jsx'
import Artwork from './components/Artwork.jsx'
import Contact from './components/Contact.jsx'
import Layout from './components/Layout.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import ArtworkDetail from './pages/ArtworkDetail.jsx'
import Auth from './pages/Auth.jsx'
import Cart from './pages/Cart.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Directory from './pages/Directory.jsx'
import Events from './pages/Events.jsx'
import NotFound from './pages/NotFound.jsx'
import Profile from './pages/Profile.jsx'
import Shop from './pages/Shop.jsx'

const route = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/', element: <Artwork /> },
      { path: '/shop', element: <Shop /> },
      { path: '/artwork', element: <Navigate to="/shop" replace /> }, // old link
      { path: '/artworks/:id', element: <ArtworkDetail /> },
      { path: '/artists', element: <Directory role="artist" /> },
      { path: '/artists/:id', element: <Profile role="artist" /> },
      { path: '/companies', element: <Directory role="company" /> },
      { path: '/companies/:id', element: <Profile role="company" /> },
      { path: '/events', element: <Events /> },
      { path: '/cart', element: <Cart /> },
      { path: '/login', element: <Auth mode="login" /> },
      { path: '/signup', element: <Auth mode="signup" /> },
      { path: '/dashboard', element: <RequireAuth><Dashboard /></RequireAuth> },
      { path: '/about', element: <About /> },
      { path: '/contact', element: <Contact /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={route} />
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
