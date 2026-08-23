import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Agendamento from './pages/Agendamento';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { api } from './services/api';

function ProtectedRoute({ children, requireAdmin = false }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        const { user } = await api.getSession();
        setIsAuthenticated(true);
        setIsAdmin(user.role === 'ADMIN');
      } catch (error) {
        setIsAuthenticated(false);
        localStorage.removeItem('access_token');
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-text-primary">Carregando...</div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={requireAdmin ? "/login/admin" : "/login"} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-bg relative">
        {/* Gradiente de fundo global: cobre a página inteira e acompanha a rolagem */}
        <div
          className="fixed inset-0 bg-gradient-to-br from-primary/20 via-dark-bg to-secondary/20 animate-pulse pointer-events-none"
          style={{ animationDuration: '3s' }}
        ></div>

        {/* Conteúdo */}
        <div className="relative z-10">
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/agendamento" element={<Agendamento />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/login/admin" element={<AdminLogin />} />

            {/* Rotas protegidas */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/portfolio"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard initialTab="portfolio" />
                </ProtectedRoute>
              }
            />
            {/* Alias: /admin redireciona para o dashboard */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Rota 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
