import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/layout/Navbar';
import MobileBottomNav from './components/layout/MobileBottomNav';
import NotificationToaster from './components/notifications/NotificationToaster';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import FeedPage from './pages/Home/FeedPage';
import RecipeDetailPage from './pages/Recipe/RecipeDetailPage';
import ProfilePage from './pages/Profile/ProfilePage';
import MealPlannerPage from './pages/Planner/MealPlannerPage';
import ShoppingListPage from './pages/Shopping/ShoppingListPage';
import { ModalProvider } from './context/ModalContext';
import { WebSocketProvider } from './hooks/useWebSocket';
import CreateRecipeModal from './components/recipes/CreateRecipeModal';
import SettingsPage from './pages/Settings/SettingsPage';
import AdminDashboard from './pages/Admin/AdminDashboard';

const PrivateRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

const AdminRoute = () => {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  return isAuthenticated && isAdmin ? <Outlet /> : <Navigate to="/feed" />;
};

const App = () => {
  return (
    <BrowserRouter>
      <ModalProvider>
        <WebSocketProvider>
        <Navbar />
        <Box sx={{ mt: { xs: 7, sm: 8 }, pb: { xs: 8, sm: 0 }, minHeight: '100vh' }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/recipes/:id" element={<RecipeDetailPage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/planner" element={<MealPlannerPage />} />
              <Route path="/shopping" element={<ShoppingListPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            {/* Default Redirect */}
            <Route path="*" element={<Navigate to="/feed" replace />} />
          </Routes>
        </Box>
        <MobileBottomNav />
          <NotificationToaster />
          <CreateRecipeModal />
        </WebSocketProvider>
      </ModalProvider>
    </BrowserRouter>
  );
};

export default App;
