import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import AddBoxIcon from '@mui/icons-material/AddBox';
import PersonIcon from '@mui/icons-material/Person';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const getActiveValue = () => {
    const path = location.pathname;
    if (path === '/feed') return 0;
    if (path.includes('/search') || (path === '/feed' && location.search)) return 1;
    if (path === '/recipes/create') return 2;
    if (path.includes(`/profile/${user?.username}`)) return 3;
    return 0;
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        display: { xs: 'block', sm: 'none' },
        zIndex: 1000,
        borderRadius: 0,
        borderTop: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.03)'
      }} 
      elevation={3}
    >
      <BottomNavigation
        showLabels={false}
        value={getActiveValue()}
        onChange={(_, newValue) => {
          if (newValue === 0) navigate('/feed');
          if (newValue === 1) navigate('/feed'); // Assuming search is part of feed or a dedicated page
          if (newValue === 2) navigate('/recipes/create');
          if (newValue === 3) navigate(`/profile/${user?.username}`);
        }}
        sx={{ height: 64 }}
      >
        <BottomNavigationAction icon={<HomeIcon />} />
        <BottomNavigationAction icon={<SearchIcon />} />
        <BottomNavigationAction icon={<AddBoxIcon sx={{ fontSize: 32, color: 'primary.main' }} />} />
        <BottomNavigationAction icon={<PersonIcon />} />
      </BottomNavigation>
    </Paper>
  );
};

export default MobileBottomNav;
