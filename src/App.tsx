import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "./contexts/ThemeContext";
import { wagmiConfig } from "./lib/wallet/config";
import { TwinMatrixProvider } from "./contexts/TwinMatrixContext";
import HomePage from "./pages/HomePage";
import VerifyPage from "./pages/VerifyPage";
import MintPage from "./pages/MintPage";
import MatrixPage from "./pages/MatrixPage";

import AgentsOverviewPage from "./pages/agents/AgentsOverviewPage";
import AgentsConnectPage from "./pages/agents/AgentsConnectPage";
import AgentsSkillPage from "./pages/agents/AgentsSkillPage";
import AgentsApiPage from "./pages/agents/AgentsApiPage";
import AgentsExamplesPage from "./pages/agents/AgentsExamplesPage";
import AgentsConsolePage from "./pages/agents/AgentsConsolePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={wagmiConfig}>
    <ThemeProvider>
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#0AFFFF",
            accentColorForeground: "#001515",
            borderRadius: "medium",
            overlayBlur: "small",
          })}
        >
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <TwinMatrixProvider>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/verify" element={<VerifyPage />} />
                  <Route path="/mint" element={<MintPage />} />
                  <Route path="/matrix" element={<MatrixPage />} />
                  
                  <Route path="/agents" element={<AgentsOverviewPage />} />
                  <Route path="/agents/connect" element={<AgentsConnectPage />} />
                  <Route path="/agents/skill" element={<AgentsSkillPage />} />
                  <Route path="/agents/api" element={<AgentsApiPage />} />
                  <Route path="/agents/examples" element={<AgentsExamplesPage />} />
                  <Route path="/agents/console" element={<AgentsConsolePage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TwinMatrixProvider>
            </BrowserRouter>
          </TooltipProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </I18nProvider>
    </ThemeProvider>
  </WagmiProvider>
);

export default App;
