import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, Grid, 
  IconButton, Card, CardMedia, CardContent,
  Stack, CircularProgress, Alert,
  Button
} from '@mui/material';
import { motion } from 'framer-motion';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { mealPlanService, type MealPlan } from '../../services/mealPlan.service';
import { shoppingListService } from '../../services/shoppingList.service';
import { toast } from 'react-hot-toast';
import { format, startOfWeek, endOfWeek, addDays, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BlockIcon from '@mui/icons-material/Block';
import ScheduleIcon from '@mui/icons-material/Schedule';

const MealPlannerPage = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      const data = await mealPlanService.getMealPlans(start, end);
      setPlans(data);
    } catch (err) {
      setError('Failed to load meal plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [currentDate]);

  const handleDelete = async (id: number) => {
    try {
      if (window.confirm('Remove this meal from your plan?')) {
        await mealPlanService.deleteMealPlan(id);
        setPlans(plans.filter(p => p.id !== id));
        toast.success('Meal removed');
      }
    } catch (err) {
      console.error('Delete failed', err);
      toast.error('Failed to remove meal');
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const updated = await mealPlanService.updateMealPlan(id, { status });
      setPlans(plans.map(p => p.id === id ? updated : p));
      toast.success(`Marked as ${status.toLowerCase()}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleGenerateShoppingList = async () => {
    try {
      const start = format(startOfWeek(currentDate), 'yyyy-MM-dd');
      const end = format(endOfWeek(currentDate), 'yyyy-MM-dd');
      await shoppingListService.addFromMealPlan(start, end);
      toast.success('Weekly ingredients added to shopping list!');
      navigate('/shopping-list');
    } catch (err) {
      toast.error('Failed to generate shopping list');
    }
  };

  const renderHeader = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
        <Box>
          <Typography variant="h2" sx={{ fontWeight: 950, letterSpacing: '-0.04em' }}>
            Culinary Calendar
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Curate your weekly gastronomic journey
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<ShoppingCartIcon />}
            onClick={handleGenerateShoppingList}
            sx={{ 
                borderRadius: '14px', 
                fontWeight: 900, 
                px: 3, 
                bgcolor: 'primary.main',
                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.2)'
            }}
          >
            Generate Shopping List
          </Button>
          <Box className="glass" sx={{ p: 1, borderRadius: '20px', display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => setCurrentDate(addDays(currentDate, -7))}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 800, minWidth: 150, textAlign: 'center' }}>
              {format(currentDate, 'MMMM yyyy')}
            </Typography>
            <IconButton onClick={() => setCurrentDate(addDays(currentDate, 7))}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    );
  };

  const renderDays = () => {
    const start = startOfWeek(currentDate);
    const days = [];
    for (let i = 0; i < 7; i++) {
        const day = addDays(start, i);
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayPlans = plans.filter(p => p.plannedDate === dayStr);
        const totalCalories = dayPlans.reduce((sum, p) => sum + (p.calories || 0), 0);
        const totalProtein = dayPlans.reduce((sum, p) => sum + (p.protein || 0), 0);
        const totalCarbs = dayPlans.reduce((sum, p) => sum + (p.carbs || 0), 0);
        const totalFats = dayPlans.reduce((sum, p) => sum + (p.fats || 0), 0);

        days.push(
          <Grid size={1} key={i}>
            <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'primary.main' }}>
                {format(day, 'EEE')}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 950 }}>
                {format(day, 'd')}
                </Typography>
                {totalCalories > 0 && (
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block' }}>
                          {totalCalories} kcal
                      </Typography>
                      <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ mt: 0.5 }}>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#10b981' }}>P:{Math.round(totalProtein)}g</Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#f59e0b' }}>C:{Math.round(totalCarbs)}g</Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#f43f5e' }}>F:{Math.round(totalFats)}g</Typography>
                      </Stack>
                    </Box>
                )}
            </Box>
          </Grid>
        );
    }
    return <Grid container spacing={2} columns={7} sx={{ mb: 2 }}>{days}</Grid>;
  };

  const renderCells = () => {
    const start = startOfWeek(currentDate);
    const rows = [];
    
    for (let i = 0; i < 7; i++) {
        const day = addDays(start, i);
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayPlans = plans.filter(p => p.plannedDate === dayStr);
        
        rows.push(
            <Grid size={1} key={i}>
                <Paper 
                    className="glass-card" 
                    sx={{ 
                        minHeight: 400, 
                        p: 2, 
                        borderRadius: '24px',
                        bgcolor: isSameDay(day, new Date()) ? 'rgba(99, 102, 241, 0.03)' : 'transparent',
                        border: isSameDay(day, new Date()) ? '2px solid rgba(99, 102, 241, 0.2)' : '1px solid rgba(0,0,0,0.05)'
                    }}
                >
                    <Stack spacing={2}>
                        {['BREAKFAST', 'LUNCH', 'DINNER'].map(type => {
                            const meal = dayPlans.find(p => p.mealType === type);
                            return (
                                <Box key={type} sx={{ minHeight: 100 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled', mb: 1, display: 'block' }}>
                                        {type}
                                    </Typography>
                                    {meal ? (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                            <Card sx={{ 
                                                borderRadius: '16px', 
                                                overflow: 'hidden', 
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
                                                position: 'relative',
                                                opacity: meal.status === 'SKIPPED' ? 0.5 : 1,
                                                filter: meal.status === 'SKIPPED' ? 'grayscale(100%)' : 'none',
                                                border: meal.status === 'EATEN' ? '2px solid #10b981' : 'none'
                                            }}>
                                                <CardMedia component="img" height="60" image={meal.recipeImageUrl} />
                                                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.75rem', lineHeight: 1.1, mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                        {meal.recipeTitle}
                                                    </Typography>
                                                    
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Stack direction="row" spacing={0.5}>
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => handleStatusChange(meal.id, 'EATEN')}
                                                                sx={{ p: 0.5, color: meal.status === 'EATEN' ? 'success.main' : 'text.disabled' }}
                                                            >
                                                                <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
                                                            </IconButton>
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => handleStatusChange(meal.id, 'SKIPPED')}
                                                                sx={{ p: 0.5, color: meal.status === 'SKIPPED' ? 'error.main' : 'text.disabled' }}
                                                            >
                                                                <BlockIcon sx={{ fontSize: 16 }} />
                                                            </IconButton>
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => handleStatusChange(meal.id, 'PLANNED')}
                                                                sx={{ p: 0.5, color: meal.status === 'PLANNED' ? 'primary.main' : 'text.disabled' }}
                                                            >
                                                                <ScheduleIcon sx={{ fontSize: 16 }} />
                                                            </IconButton>
                                                        </Stack>
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(meal.id); }}
                                                            sx={{ p: 0.5, color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                                                        >
                                                            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    </Box>
                                                </CardContent>
                                                {meal.calories && (
                                                    <Box sx={{ position: 'absolute', top: 5, left: 5, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', px: 0.8, py: 0.2, borderRadius: 1 }}>
                                                        <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 900 }}>{meal.calories} cal</Typography>
                                                    </Box>
                                                )}
                                            </Card>
                                        </motion.div>
                                    ) : (
                                        <Box 
                                            sx={{ 
                                                height: 80, 
                                                border: '2px dashed rgba(0,0,0,0.05)', 
                                                borderRadius: '16px', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                '&:hover': { bgcolor: 'rgba(0,0,0,0.02)', borderColor: 'primary.light' }
                                            }}
                                            onClick={() => navigate('/')}
                                        >
                                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700 }}>+ Plan</Typography>
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </Stack>
                </Paper>
            </Grid>
        );
    }
    return <Grid container spacing={2} columns={7}>{rows}</Grid>;
  };

  return (
    <Box className="bg-mesh" sx={{ minHeight: '100vh', py: 8 }}>
      <Container maxWidth="xl">
        {renderHeader()}
        
        {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '16px' }}>{error}</Alert>}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}><CircularProgress /></Box>
        ) : (
          <Box>
            {renderDays()}
            {renderCells()}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default MealPlannerPage;
