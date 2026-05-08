import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import MondayPlanning from "./pages/MondayPlanning";
import SeoBlog from "./pages/SeoBlog";
import WordpressAltText from "./pages/WordpressAltText";
import Chatbot from "./pages/Chatbot";
import CopyrightBranding from "./pages/CopyrightBranding";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Index />} />
            <Route path="/monday-planning" element={<MondayPlanning />} />
            <Route path="/seo-blog" element={<SeoBlog />} />
            <Route path="/wordpress-alt-text" element={<WordpressAltText />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/copyright-branding" element={<CopyrightBranding />} />
            <Route path="/admin" element={<AdminPanel />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
