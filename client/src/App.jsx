import { ApolloProvider } from '@apollo/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { client } from './graphql/client';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ApolloProvider client={client}>
          <AuthProvider>
            <BrowserRouter>
              <Toaster position="top-right" />
              <Navbar />
              <AppRoutes />
            </BrowserRouter>
          </AuthProvider>
        </ApolloProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}