import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";

import { Toaster } from "sonner";

import Navbar from "./components/Navbar";
import Form from "./components/Form";
import Footer from "./components/Footer";
import SearchPage from "./pages/SearchPage";
import CategoryProducts from "./components/admin/pages/CategoryProducts";

import Uniformes from "./pages/Uniformes";
import AllProducts from "./pages/AllProducts";
import ProductDetail from "./pages/ProductDetail"; 
import { CartProvider } from "./hooks/CartProvider";   
import { AuthProvider } from "./hooks/AuthProvider";
import { WishlistProvider } from "./hooks/WishlistProvider";
import CartPanel from "./components/CartPanel";
import MisPedidos from "./pages/MisPedidos";
import PedidoDetail from "./pages/PedidoDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Favoritos from "./pages/Favoritos";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import Contacto from "./pages/Contacto";
import Politicas from "./pages/Politicas";

import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./components/admin/layout/AdminLayout";
import Dashboard from "./components/admin/pages/Dashboard";
import ProductsAdmin from "./components/admin/pages/ProductsAdmin";
import NewProduct from "./components/admin/pages/NewProduct";
import EditProduct from "./components/admin/pages/EditProduct";
import OrderDetail from "./components/admin/pages/OrderDetail";
import OrdersAdmin from "./components/admin/pages/OrdersAdmin";
import CategoriesAdmin from "./components/admin/pages/CategoriesAdmin"; 
import UsersAdmin from "./components/admin/pages/UsersAdmin";
import GeneralSettings from "./components/admin/layout/GeneralSettings";
import NotificationSettings from "./components/admin/layout/Notifications";
import IntegrationSettings from "./components/admin/layout/Integration";

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      <Toaster richColors position="top-right" toastOptions={{ duration: 2000 }} visibleToasts={1} />
      <ScrollToTop />

      {!isAdmin && <Navbar />}
      {!isAdmin && <CartPanel />}

      <Routes>
        <Route path="/buscar" element={<SearchPage />} />
        <Route path="/mis-pedidos" element={<MisPedidos />} />
        <Route path="/mis-pedidos/:id" element={<PedidoDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/recuperar-contrasena" element={<ForgotPassword />} />
        <Route path="/restablecer-contrasena" element={<ResetPassword />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/" element={<Uniformes />} />
        <Route path="/uniformes" element={<Uniformes />} />
        <Route path="/todos-los-productos" element={<AllProducts />} />
        <Route path="/producto/:id" element={<ProductDetail />} /> 
        <Route path="/categoria/:id" element={<CategoryProducts />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/politicas" element={<Politicas />} />
        <Route path="/form" element={<Form />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Dashboard />} />

          <Route path="products" element={<ProductsAdmin />} />
          <Route path="products/new" element={<NewProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />

          <Route path="orders" element={<OrdersAdmin />} />
          <Route path="orders/:id" element={<OrderDetail />} />

          <Route path="categories" element={<CategoriesAdmin />} />

          <Route path="users" element={<UsersAdmin />} />

          <Route path="settings/general" element={<GeneralSettings />} />
          <Route path="settings/notifications" element={<NotificationSettings />} />
          <Route path="settings/integrations" element={<IntegrationSettings />} />
        </Route>

        {/* 404 - Debe ir al final */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!isAdmin && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;