import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MondayPlanning from "./pages/MondayPlanning";
import ZoekwoordOnderzoek from "./pages/ZoekwoordOnderzoek";
import Blogs from "./pages/Blogs";
import WordpressAltText from "./pages/WordpressAltText";
import Chatbot from "./pages/Chatbot";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Index />} />
          <Route path="/monday-planning" element={<MondayPlanning />} />
          <Route path="/zoekwoord-onderzoek" element={<ZoekwoordOnderzoek />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/wordpress-alt-text" element={<WordpressAltText />} />
          <Route path="/chatbot" element={<Chatbot />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
