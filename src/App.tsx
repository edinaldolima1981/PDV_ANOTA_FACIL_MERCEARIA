import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { CustomerProvider } from "@/contexts/CustomerContext";
import { StoreProvider } from "@/contexts/StoreContext";
import { ProductProvider } from "@/contexts/ProductContext";
import LoginPin from "./pages/LoginPin";
import SalesHome from "./pages/SalesHome";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ReceiptPage from "./pages/ReceiptPage";
import StockPage from "./pages/StockPage";
import FiadoPage from "./pages/FiadoPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import ContasReceberPage from "./pages/ContasReceberPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <CustomerProvider>
          <StoreProvider>
          <ProductProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LoginPin />} />
                <Route path="/home" element={<SalesHome />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/receipt" element={<ReceiptPage />} />
                <Route path="/stock" element={<StockPage />} />
                <Route path="/fiado" element={<FiadoPage />} />
                <Route path="/contas-receber" element={<ContasReceberPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ProductProvider>
          </StoreProvider>
        </CustomerProvider>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
