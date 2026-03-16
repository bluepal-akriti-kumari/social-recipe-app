import { AppBar, Toolbar, Typography, Button, Avatar, Box, IconButton, Menu, MenuItem, InputBase, alpha, styled } from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Styled components removed to consolidate into the main Navbar component for simplicity
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: Number(theme.shape.borderRadius) * 2,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
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
}));

const Navbar = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    <AppBar position="fixed" sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}>
      <Toolbar>
        <RestaurantMenuIcon sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 700, cursor: 'pointer', display: { xs: 'none', sm: 'block' } }}
          onClick={() => navigate('/feed')}
        >
          RecipeApp
        </Typography>

        <Search>
          <Box sx={{ px: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SearchIcon />
          </Box>
          <InputBase
            placeholder="Search ingredients..."
            inputProps={{ 'aria-label': 'search' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            sx={{
              color: 'inherit',
              width: '100%',
              '& .MuiInputBase-input': {
                py: 1,
                pr: 1,
                transition: (theme) => theme.transitions.create('width'),
                width: { xs: '100%', md: '20ch' },
              },
            }}
          />
        </Search>

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 1 } }}>
            <IconButton color="inherit" onClick={() => navigate('/recipes/create')} title="Create Recipe">
              <AddCircleOutlineIcon />
            </IconButton>
            <IconButton onClick={handleMenu}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'white', color: 'primary.main', fontWeight: 700, fontSize: 14 }}>
                {user?.username?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
              <MenuItem onClick={() => { navigate(`/profile/${user?.username}`); handleClose(); }}>
                My Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
            <Button variant="outlined" color="inherit" onClick={() => navigate('/register')} sx={{ display: { xs: 'none', sm: 'block' } }}>Sign Up</Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
