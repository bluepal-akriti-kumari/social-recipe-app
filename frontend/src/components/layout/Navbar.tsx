import { 
  AppBar, Toolbar, Typography, Button, Avatar, 
  Box, IconButton, Menu, MenuItem, InputBase, 
  alpha, styled, Container, Tooltip 
} from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '24px',
  backgroundColor: alpha(theme.palette.text.primary, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.text.primary, 0.08),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
  display: 'flex',
  alignItems: 'center',
  transition: 'all 0.3s ease',
  border: '1px solid transparent',
  '&:focus-within': {
    border: `1px solid ${theme.palette.primary.main}`,
    backgroundColor: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  }
}));

const Navbar = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    signOut();
    handleClose();
    navigate('/login');
  };

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/feed?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        background: scrolled ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(226, 232, 240, 0.8)' : 'none',
        transition: 'all 0.3s ease',
        pt: scrolled ? 0 : 1
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box 
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mr: 2 }}
            onClick={() => navigate('/feed')}
          >
            <Box 
              sx={{ 
                bgcolor: 'primary.main', 
                p: 1, 
                borderRadius: '12px', 
                display: 'flex', 
                mr: 1.5,
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
            >
              <RestaurantMenuIcon sx={{ color: 'white' }} />
            </Box>
            <Typography
              variant="h5"
              sx={{ 
                fontWeight: 800, 
                letterSpacing: '-0.5px',
                display: { xs: 'none', sm: 'block' },
                background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              RecipeApp
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Search sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Box sx={{ px: 2, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                <SearchIcon sx={{ fontSize: 20 }} />
              </Box>
              <InputBase
                placeholder="Find some inspiration..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                sx={{
                  color: 'text.primary',
                  width: '100%',
                  '& .MuiInputBase-input': {
                    py: 1,
                    pr: 3,
                    width: { md: '30ch', lg: '45ch' },
                    fontSize: '0.95rem'
                  },
                }}
              />
            </Search>
          </Box>

          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
              <Tooltip title="Notifications">
                <IconButton color="inherit" sx={{ display: { xs: 'none', sm: 'flex' } }}>
                  <NotificationsNoneIcon />
                </IconButton>
              </Tooltip>
              <Button 
                variant="contained" 
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => navigate('/recipes/create')}
                sx={{ px: 3, display: { xs: 'none', sm: 'flex' } }}
              >
                Create
              </Button>
              <IconButton onClick={handleMenu} sx={{ p: 0.5, border: '2px solid transparent', '&:hover': { borderColor: 'primary.light' } }}>
                <Avatar 
                  src={user?.profilePictureUrl}
                  sx={{ width: 36, height: 36, fontWeight: 700, fontSize: 14 }}
                >
                  {user?.username?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu 
                anchorEl={anchorEl} 
                open={Boolean(anchorEl)} 
                onClose={handleClose}
                PaperProps={{
                  sx: { mt: 1.5, minWidth: 180, borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)' }
                }}
              >
                <MenuItem onClick={() => { navigate(`/profile/${user?.username}`); handleClose(); }}>
                  My Profile
                </MenuItem>
                <MenuItem onClick={() => { navigate('/settings'); handleClose(); }}>
                  Settings
                </MenuItem>
                <Box sx={{ my: 1, height: '1px', bgcolor: 'divider' }} />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
              <Button 
                variant="contained" 
                onClick={() => navigate('/register')} 
                sx={{ display: { xs: 'none', sm: 'block' } }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
