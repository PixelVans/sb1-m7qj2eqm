import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { Toaster } from 'sonner';
import { AppErrorBoundary } from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppErrorBoundary>
        <App />
        <Toaster 
          position="top-right"
          richColors
          closeButton
          theme="dark"
        />
      </AppErrorBoundary>
    </BrowserRouter>
  </StrictMode>
);