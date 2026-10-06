import React, { useEffect } from 'react'; // Trigger Vite HMR
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ConfigProvider, Layout } from 'antd';
import Home from './pages/Home';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminTickets from './pages/admin/AdminTickets';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReports from './pages/admin/AdminReports';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSettings from './pages/admin/AdminSettings';
import Profile from './pages/Profile';
import Collections from './pages/Collections';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Reviews from './pages/Reviews';
import Payment from './pages/Payment';
import Contact from './pages/Contact';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';

const THEME = {
  token: {
    colorPrimary: '#000000',
    fontFamily: '"Inter", sans-serif',
    borderRadius: 2,
    colorTextHeading: '#111',
  },
  components: {
    Button: {
      colorPrimary: '#000000',
      colorPrimaryHover: '#333333',
      colorPrimaryActive: '#000000',
      primaryShadow: 'none',
    },
    Card: {
      paddingLG: 16,
    },
    Slider: {
      handleColor: '#000000',
      handleActiveColor: '#000000',
      trackBg: '#000000',
      trackHoverBg: '#000000',
      dotBorderColor: '#000000',
      dotActiveBorderColor: '#000000',
      handleLineWidth: 2,
      handleLineWidthHover: 2,
    }
  }
};

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

export default function App() {
  return (
    <SettingsProvider>
      <CartProvider>
        <ConfigProvider theme={THEME}>
          <Layout className="min-h-screen bg-white">
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collections/:categoryId" element={<Collections />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/checkout-success" element={<CheckoutSuccess />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/verify/:token" element={<VerifyEmail />} />
            <Route path="/resetpassword/:token" element={<ResetPassword />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="payments" element={<AdminReports />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="tickets" element={<AdminTickets />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>
          </Routes>
        </Router>
        </Layout>
      </ConfigProvider>
    </CartProvider>
    </SettingsProvider>
  );
}
