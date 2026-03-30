import { Box, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import LocalPizzaIcon from '@mui/icons-material/LocalPizza';
import SpaIcon from '@mui/icons-material/Spa';
import SetMealIcon from '@mui/icons-material/SetMeal';
import BakeryDiningIcon from '@mui/icons-material/BakeryDining';
import CoffeeIcon from '@mui/icons-material/Coffee';
import IcecreamIcon from '@mui/icons-material/Icecream';
import PersonIcon from '@mui/icons-material/Person';

const CATEGORIES = [
  { label: 'All Recipes', value: '', icon: null },
  { label: 'My Recipes', value: 'OWN', icon: <PersonIcon sx={{ fontSize: 18 }} /> },
  { label: 'Healthy', value: 'HEALTHY', icon: <SpaIcon sx={{ fontSize: 18 }} /> },
  { label: 'Italian', value: 'ITALIAN', icon: <LocalPizzaIcon sx={{ fontSize: 18 }} /> },
  { label: 'Seafood', value: 'SEAFOOD', icon: <SetMealIcon sx={{ fontSize: 18 }} /> },
  { label: 'Baking', value: 'BAKING', icon: <BakeryDiningIcon sx={{ fontSize: 18 }} /> },
  { label: 'Breakfast', value: 'BREAKFAST', icon: <CoffeeIcon sx={{ fontSize: 18 }} /> },
  { label: 'Desserts', value: 'DESSERTS', icon: <IcecreamIcon sx={{ fontSize: 18 }} /> },
];

interface CategoryQuickBarProps {
  selectedCategory: string;
  onSelect: (category: string) => void;
}

const CategoryQuickBar = ({ selectedCategory, onSelect }: CategoryQuickBarProps) => {
  return (
    <Box 
      sx={{ 
        py: 3, mb: 4, 
        display: 'flex', gap: 2, 
        overflowX: 'auto', 
        scrollbarWidth: 'none', 
        '&::-webkit-scrollbar': { display: 'none' },
        bgcolor: '#ffffff',
        position: 'sticky', top: 64, zIndex: 10,
        mx: { xs: -2, md: 0 }, px: { xs: 2, md: 0 },
        borderBottom: '1px solid #e2e8f0'
      }}
    >
      {CATEGORIES.map((cat) => (
        <motion.div
          key={cat.label}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Chip
            icon={cat.icon || undefined}
            label={cat.label}
            onClick={() => onSelect(cat.value)}
            sx={{ 
              px: 2, py: 2.5, borderRadius: 2,
              fontWeight: 800,
              bgcolor: selectedCategory === cat.value ? 'primary.main' : 'white',
              color: selectedCategory === cat.value ? 'white' : 'text.primary',
              border: selectedCategory === cat.value ? 'none' : '1px solid rgba(0,0,0,0.08)',
              boxShadow: selectedCategory === cat.value ? '0 8px 24px rgba(99, 102, 241, 0.25)' : 'none',
              '&:hover': {
                bgcolor: selectedCategory === cat.value ? 'primary.main' : '#f1f5f9',
                borderColor: 'primary.main',
              },
              '& .MuiChip-icon': {
                color: selectedCategory === cat.value ? 'white' : 'primary.main',
              }
            }}
          />
        </motion.div>
      ))}
    </Box>
  );
};

export default CategoryQuickBar;
