import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrimeReactProvider } from "primereact/api";

import { AppProvider } from "src/contexts/AppContext";
import { InjectAxios } from "src/components/InjectAxios";
import App from 'src/App';

const container = document.getElementById('root');
const root = createRoot(container);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      staleTime: Infinity
    },
  },
});

root.render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <PrimeReactProvider>
        
            <AppProvider>
              <InjectAxios />
              <App />
            </AppProvider>
        
      </PrimeReactProvider>
    </QueryClientProvider>
  </BrowserRouter>
);