import './App.css'
import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// Lazy load all route components for code splitting
const Home = lazy(() => import('./pages/Home'))
const AutoPromotion = lazy(() => import('./pages/AutoPromotion'))
const DigitalBoard = lazy(() => import('./pages/DigitalBoard'))
const Hording = lazy(() => import('./pages/Hording'))
const ShopLightBoards = lazy(() => import('./pages/ShopLightBoards'))
const VanPromotions = lazy(() => import('./pages/VanPromotions'))
const WallPaintings = lazy(() => import('./pages/WallPaintings'))
const UnipoleDashboard = lazy(() => import('./pages/UnipoleDashboard'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Booking = lazy(() => import('./pages/Booking'))
const Account = lazy(() => import('./pages/Account'))
const AdItemDetails = lazy(() => import('./pages/AdItemDetails'))
const MapHoardings = lazy(() => import('./pages/MapHoardings'))
const ViewMap = lazy(() => import('./pages/ViewMap'))
const ContactMessagesDashboard = lazy(() => import('./pages/ContactMessagesDashboard'))

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
)

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Firebase category routes */}
        <Route path="/auto-promotion" element={<AutoPromotion />} />
        <Route path="/digital-board" element={<DigitalBoard />} />
        <Route path="/hording" element={<Hording />} />
        <Route path="/shop-boards" element={<ShopLightBoards />} />
        <Route path="/van-promotions" element={<VanPromotions />} />
        <Route path="/wall-paintings" element={<WallPaintings />} />

        {/* Legacy routes (keep for backward compatibility) */}
        <Route path="/downtown-billboard" element={<AutoPromotion />} />
        <Route path="/:category/:id" element={<AdItemDetails />} />
        <Route path="/highway" element={<Hording />} />
        <Route path="/mall" element={<ShopLightBoards />} />
        <Route path="/event" element={<VanPromotions />} />
        <Route path="/led" element={<DigitalBoard />} />
        <Route path="/corporate" element={<WallPaintings />} />
        <Route path="/unipole" element={<UnipoleDashboard />} />

        {/* Other routes */}
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/map" element={<MapHoardings />} />
        <Route path="/view-map" element={<ViewMap />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/account" element={<Account />} />
        <Route path="/admin/contact-messages" element={<ContactMessagesDashboard />} />
      </Routes>
    </Suspense>
  )
}

export default App
