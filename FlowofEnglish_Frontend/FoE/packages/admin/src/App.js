import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { GeneralUserProvider } from './GeneralUserContext';
import 'react-toastify/dist/ReactToastify.css';

// Import UserProvider from your UserContext
import { UserProvider } from './UserContext';

// Import other components and routes
import Router from './routes';
import ThemeProvider from './theme';
import { StyledChart } from './components/chart';
import ScrollToTop from './components/scroll-to-top';

export default function App() {
  return (
    <HelmetProvider>
      {/* Wrap your entire application with UserProvider */}
      <UserProvider>
        <GeneralUserProvider>
        <BrowserRouter>
          <ThemeProvider>
            <ScrollToTop />
            <StyledChart />
            <Router />
            <ToastContainer
              position="bottom-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
          </ThemeProvider>
        </BrowserRouter>
        </GeneralUserProvider>
      </UserProvider>
    </HelmetProvider>
  );
}
