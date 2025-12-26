import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import CartPanel from "./components/CartPanel";
import MisPedidos from "./pages/MisPedidos";

import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./components/admin/layout/AdminLayout";
import Dashboard from "./components/admin/pages/Dashboard";
import ProductsAdmin from "./components/admin/pages/ProductsAdmin";
import NewProduct from "./components/admin/pages/NewProduct";
import EditProduct from "./components/admin/pages/EditProduct";
import OrderDetail from "./components/admin/pages/OrderDetail";
import OrdersAdmin from "./components/admin/pages/OrdersAdmin";
import CategoriesAdmin from "./components/admin/pages/CategoriesAdmin"; 
import GeneralSettings from "./components/admin/layout/GeneralSettings";
import NotificationSettings from "./components/admin/layout/Notifications";
import IntegrationSettings from "./components/admin/layout/Integration";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster richColors position="top-right" />
          <ScrollToTop />

          <Navbar />
          <CartPanel />

          <Routes>
            <Route path="/buscar" element={<SearchPage />} />
            <Route path="/mis-pedidos" element={<MisPedidos />} />
            <Route path="/" element={<Uniformes />} />
            <Route path="/uniformes" element={<Uniformes />} />
            <Route path="/todos-los-productos" element={<AllProducts />} />
            <Route path="/producto/:id" element={<ProductDetail />} /> 
            <Route path="/categoria/:id" element={<CategoryProducts />} />
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

              <Route path="settings/general" element={<GeneralSettings />} />
              <Route path="settings/notifications" element={<NotificationSettings />} />
              <Route path="settings/integrations" element={<IntegrationSettings />} />
            </Route>
          </Routes>

          <Footer />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;