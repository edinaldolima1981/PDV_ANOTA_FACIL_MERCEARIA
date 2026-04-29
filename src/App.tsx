import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { CustomerProvider } from "@/contexts/CustomerContext";
import { StoreProvider } from "@/contexts/StoreContext";
import { ProductProvider } from "@/contexts/ProductContext";
import { TableProvider } from "@/contexts/TableContext";
import { WaiterProvider } from "@/contexts/WaiterContext";
import { HappyHourProvider } from "@/contexts/HappyHourContext";
import { BarSettingsProvider } from "@/contexts/BarSettingsContext";
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
import RestaurantPage from "./pages/RestaurantPage";
import BarPage from "./pages/BarPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <CustomerProvider>
          <StoreProvider>
          <ProductProvider>
          <BarSettingsProvider>
          <HappyHourProvider>
          <WaiterProvider>
          <TableProvider>
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
                <Route path="/restaurante" element={<RestaurantPage />} />
                <Route path="/bar" element={<BarPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TableProvider>
          </WaiterProvider>
          </HappyHourProvider>
          </BarSettingsProvider>
          </ProductProvider>
          </StoreProvider>
        </CustomerProvider>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
