import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Customer Portal Layout & Pages
import { CustomerLayout } from './layouts/CustomerLayout';
import { CustomerHomePage } from './pages/customer/CustomerHomePage';
import { ShopPage } from './pages/customer/ShopPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { CartPage } from './pages/customer/CartPage';
import { WishlistPage } from './pages/customer/WishlistPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrderConfirmationPage } from './pages/customer/OrderConfirmationPage';
import { CustomerOrdersPage } from './pages/customer/CustomerOrdersPage';
import { CustomerOrderDetailPage } from './pages/customer/CustomerOrderDetailPage';
import { CustomerAccountPage } from './pages/customer/CustomerAccountPage';

// Auth Pages & Route Guards
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ProtectedAdminRoute } from './components/auth/ProtectedAdminRoute';
import { ProtectedUserRoute } from './components/auth/ProtectedUserRoute';

// Admin Portal Layout & Pages
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminWarehousesPage } from './pages/admin/AdminWarehousesPage';
import { AdminSuppliersPage } from './pages/admin/AdminSuppliersPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminStockMovementsPage } from './pages/admin/AdminStockMovementsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* CUSTOMER STOREFRONT PORTAL */}
              <Route path="/" element={<CustomerLayout />}>
                <Route index element={<CustomerHomePage />} />
                <Route path="shop" element={<ShopPage />} />
                <Route path="products/:id" element={<ProductDetailPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />

                {/* PROTECTED USER ROUTES */}
                <Route element={<ProtectedUserRoute />}>
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="orders" element={<CustomerOrdersPage />} />
                  <Route path="orders/:id" element={<CustomerOrderDetailPage />} />
                  <Route path="account" element={<CustomerAccountPage />} />
                </Route>
              </Route>

              {/* AUTHENTICATION ROUTES */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* ADMIN OPERATIONS PORTAL (PROTECTED ROUTE ARCHITECTURE) */}
              <Route element={<ProtectedAdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="inventory" element={<AdminInventoryPage />} />
                  <Route path="warehouses" element={<AdminWarehousesPage />} />
                  <Route path="suppliers" element={<AdminSuppliersPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="stock-movements" element={<AdminStockMovementsPage />} />
                </Route>
              </Route>

              {/* CATCH-ALL REDIRECT */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
};

export default App;
