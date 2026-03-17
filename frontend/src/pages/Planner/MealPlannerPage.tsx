import { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Paper, Grid, 
  IconButton, Card, CardMedia, CardContent,
  Stack, CircularProgress, Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { mealPlanService, type MealPlan } from '../../services/mealPlan.service';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, isSameDay } from 'date-fns';

const MealPlannerPage = () => {
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
      await mealPlanService.deleteMealPlan(id);
      setPlans(plans.filter(p => p.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
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
    );
  };

  const renderDays = () => {
    const start = startOfWeek(currentDate);
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(
        <Grid size={{ xs: 12 / 7 }} key={i}>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'primary.main' }}>
              {format(addDays(start, i), 'EEE')}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 950 }}>
              {format(addDays(start, i), 'd')}
            </Typography>
          </Box>
        </Grid>
      );
    }
    return <Grid container spacing={2} sx={{ mb: 2 }}>{days}</Grid>;
  };

  const renderCells = () => {
    const start = startOfWeek(currentDate);
    const rows = [];
    
    for (let i = 0; i < 7; i++) {
        const day = addDays(start, i);
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayPlans = plans.filter(p => p.plannedDate === dayStr);
        
        rows.push(
            <Grid size={{ xs: 12/7 }} key={i}>
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
                                            <Card sx={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'relative' }}>
                                                <CardMedia component="img" height="60" image={meal.recipeImageUrl} />
                                                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.8rem', lineHeight: 1.2, mb: 1 }}>
                                                        {meal.recipeTitle}
                                                    </Typography>
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleDelete(meal.id)}
                                                        sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(0,0,0,0.3)', color: 'white', '&:hover': { bgcolor: 'error.main' }, p: 0.5 }}
                                                    >
                                                        <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                                                    </IconButton>
                                                </CardContent>
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
    return <Grid container spacing={2}>{rows}</Grid>;
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
