import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProductsTable } from './pages/Products/ProductsTable';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // development için rahatlık sağlar
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-gray-900">Glitch Market Admin</h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/products" element={<ProductsTable />} />
                <Route path="/products/:id" element={<div className="p-4 bg-white rounded shadow text-center">Product Detail Placeholder (Faz 8)</div>} />
                <Route path="/products/:id/edit" element={<div className="p-4 bg-white rounded shadow text-center">Edit Product Placeholder (Faz 9)</div>} />
                <Route path="/" element={<Navigate to="/products" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
