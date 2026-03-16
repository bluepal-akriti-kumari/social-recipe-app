import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/layout/Navbar';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import FeedPage from './pages/Home/FeedPage';
import RecipeDetailPage from './pages/Recipe/RecipeDetailPage';
import CreateRecipePage from './pages/Recipe/CreateRecipePage';
import ProfilePage from './pages/Profile/ProfilePage';

const PrivateRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Box sx={{ mt: 8 }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/recipes/:id" element={<RecipeDetailPage />} />
            <Route path="/recipes/create" element={<CreateRecipePage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
          </Route>

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
};

export default App;
