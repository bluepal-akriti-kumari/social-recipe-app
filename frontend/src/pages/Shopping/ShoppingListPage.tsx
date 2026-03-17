import { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Paper, Checkbox, 
  Button, TextField, Stack, 
  CircularProgress, Alert, Chip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import AddIcon from '@mui/icons-material/Add';
import { shoppingListService, type ShoppingListItem } from '../../services/shoppingList.service';

const ShoppingListPage = () => {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await shoppingListService.getItems();
      setItems(data);
    } catch (err) {
      setError('Failed to load shopping list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleToggle = async (id: number) => {
    try {
      const updated = await shoppingListService.togglePurchased(id);
      setItems(items.map(item => item.id === id ? updated : item));
    } catch (err) {
      console.error('Toggle failed', err);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    try {
      const item = await shoppingListService.addItem({ name: newItemName });
      setItems([...items, item]);
      setNewItemName('');
    } catch (err) {
      console.error('Add failed', err);
    }
  };

  const handleDeleteChecked = async () => {
    try {
      await shoppingListService.deleteChecked();
      setItems(items.filter(item => !item.purchased));
    } catch (err) {
      console.error('Delete checked failed', err);
    }
  };

  const pendingItems = items.filter(i => !i.purchased);
  const purchasedItems = items.filter(i => i.purchased);

  return (
    <Box className="bg-mesh" sx={{ minHeight: '100vh', py: 8 }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
          <Box>
            <Typography variant="h2" sx={{ fontWeight: 950, letterSpacing: '-0.04em' }}>
              Pantry Provisions
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Manage your culinary essentials
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            color="error"
            startIcon={<DeleteSweepIcon />}
            onClick={handleDeleteChecked}
            disabled={purchasedItems.length === 0}
            sx={{ borderRadius: '14px', fontWeight: 800, textTransform: 'none', px: 3 }}
          >
            Clear Purchased
          </Button>
        </Box>

        <Paper className="glass-card" sx={{ p: 4, borderRadius: '32px', mb: 4 }}>
          <form onSubmit={handleAddItem}>
            <Stack direction="row" spacing={2}>
              <TextField 
                fullWidth
                placeholder="Add new ingredient (e.g., 500g Fresh Basil)..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: '16px',
                    bgcolor: 'rgba(0,0,0,0.02)'
                  }
                }}
              />
              <Button 
                type="submit"
                variant="contained" 
                startIcon={<AddIcon />}
                disabled={!newItemName.trim()}
                sx={{ borderRadius: '16px', px: 4, fontWeight: 900 }}
              >
                Add
              </Button>
            </Stack>
          </form>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
        ) : (
          <Stack spacing={4}>
            {error && <Alert severity="error">{error}</Alert>}
            
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, px: 1 }}>
                To Procure <Chip label={pendingItems.length} size="small" sx={{ ml: 1, fontWeight: 900, bgcolor: 'primary.main', color: 'white' }} />
              </Typography>
              <Paper className="glass" sx={{ borderRadius: '24px', overflow: 'hidden' }}>
                <AnimatePresence>
                  {pendingItems.map((item) => (
                    <motion.div 
                        key={item.id} 
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: 20 }}
                    >
                      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)', '&:last-child': { borderBottom: 'none' } }}>
                        <Checkbox checked={item.purchased} onChange={() => handleToggle(item.id)} sx={{ mr: 2 }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
                          {(item.quantity || item.unit) && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                              {item.quantity} {item.unit}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                  {pendingItems.length === 0 && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography sx={{ color: 'text.disabled', fontStyle: 'italic' }}>Your pantry is well-stocked</Typography>
                    </Box>
                  )}
                </AnimatePresence>
              </Paper>
            </Box>

            {purchasedItems.length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, px: 1, color: 'text.disabled' }}>
                  Acquired
                </Typography>
                <Paper className="glass" sx={{ borderRadius: '24px', overflow: 'hidden', opacity: 0.6 }}>
                  {purchasedItems.map((item) => (
                    <Box key={item.id} sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)', '&:last-child': { borderBottom: 'none' } }}>
                      <Checkbox checked={item.purchased} onChange={() => handleToggle(item.id)} sx={{ mr: 2 }} />
                      <Typography sx={{ fontWeight: 600, textDecoration: 'line-through', color: 'text.secondary' }}>{item.name}</Typography>
                    </Box>
                  ))}
                </Paper>
              </Box>
            )}
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default ShoppingListPage;
