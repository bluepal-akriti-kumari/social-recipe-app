import { 
  Box, Typography, Slider, FormControl, 
  InputLabel, Select, MenuItem, Button, 
  Divider, Chip, Stack
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

interface FilterSidebarProps {
  filters: {
    maxTime: number;
    maxCalories: number;
    sort: string;
  };
  onFilterChange: (filters: { maxTime: number; maxCalories: number; sort: string }) => void;
  onReset: () => void;
}

const FilterSidebar = ({ filters, onFilterChange, onReset }: FilterSidebarProps) => {
  return (
    <Box sx={{ 
      p: 3, 
      bgcolor: 'background.paper', 
      borderRadius: 4, 
      border: '1px solid #E2E8F0',
      position: 'sticky',
      top: 100
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
          Filters
        </Typography>
        <Button 
          startIcon={<RestartAltIcon />} 
          size="small" 
          onClick={onReset}
          sx={{ color: 'text.secondary', fontWeight: 700 }}
        >
          Reset
        </Button>
      </Box>

      <Stack spacing={4}>
        {/* Sort By */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 800, color: 'text.primary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Sort By
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={filters.sort}
              onChange={(e) => onFilterChange({ ...filters, sort: e.target.value })}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="trending">Trending Now</MenuItem>
              <MenuItem value="rating">Top Rated</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider />

        {/* Max Cooking Time */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Max Time
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {filters.maxTime} mins
            </Typography>
          </Box>
          <Slider
            value={filters.maxTime}
            min={0}
            max={180}
            step={5}
            onChange={(_, value) => onFilterChange({ ...filters, maxTime: value as number })}
            valueLabelDisplay="auto"
            sx={{ color: 'primary.main' }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.disabled">0</Typography>
            <Typography variant="caption" color="text.disabled">180+</Typography>
          </Box>
        </Box>

        <Divider />

        {/* Max Calories */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Max Calories
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {filters.maxCalories} kcal
            </Typography>
          </Box>
          <Slider
            value={filters.maxCalories}
            min={0}
            max={2000}
            step={50}
            onChange={(_, value) => onFilterChange({ ...filters, maxCalories: value as number })}
            valueLabelDisplay="auto"
            sx={{ color: 'primary.main' }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.disabled">0</Typography>
            <Typography variant="caption" color="text.disabled">2000+</Typography>
          </Box>
        </Box>
      </Stack>

      <Button 
        variant="contained" 
        fullWidth 
        sx={{ 
          mt: 4, 
          py: 1.5, 
          borderRadius: 3, 
          fontWeight: 800,
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 12px rgba(44, 62, 80, 0.15)' }
        }}
      >
        Apply Filters
      </Button>
    </Box>
  );
};

export default FilterSidebar;
