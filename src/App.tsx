import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useApplyButtonColors } from "./hooks/useApplyButtonColors";
import Index from "./pages/Index";
import MondayPlanning from "./pages/MondayPlanning";
import SeoBlog from "./pages/SeoBlog";
import WordpressAltText from "./pages/WordpressAltText";
import Chatbot from "./pages/Chatbot";
import CopyrightBranding from "./pages/CopyrightBranding";
import EmailSignature from "./pages/EmailSignature";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import Landingspagina from "./pages/Landingspagina";
import LeadsGenerator from "./pages/LeadsGenerator";
import Nieuwsbrief from "./pages/Nieuwsbrief";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  useApplyButtonColors();
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Index />} />
      <Route path="/monday-planning" element={<MondayPlanning />} />
      <Route path="/seo-blog" element={<SeoBlog />} />
      <Route path="/wordpress-alt-text" element={<WordpressAltText />} />
      <Route path="/chatbot" element={<Chatbot />} />
      <Route path="/copyright-branding" element={<CopyrightBranding />} />
      <Route path="/email-signature" element={<EmailSignature />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/landingspagina" element={<Landingspagina />} />
      <Route path="/leads-generator" element={<LeadsGenerator />} />
      <Route path="/nieuwsbrief" element={<Nieuwsbrief />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
