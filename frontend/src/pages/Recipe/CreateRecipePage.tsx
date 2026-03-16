import { useState } from 'react';
import { 
  Container, Box, Stepper, Step, StepLabel, Button, 
  Typography, TextField, Paper, Grid, IconButton, 
  CircularProgress, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { recipeService } from '../../services/recipe.service';
import axios from 'axios';

const steps = ['General Info', 'Ingredients', 'Cooking Steps'];

interface RecipeFormValues {
  title: string;
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  imageUrl: string;
  ingredients: { name: string; quantity: string; unit: string }[];
  steps: { stepNumber: number; instruction: string }[];
}

const CreateRecipePage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<RecipeFormValues>({
    defaultValues: {
      ingredients: [{ name: '', quantity: '', unit: '' }],
      steps: [{ stepNumber: 1, instruction: '' }],
      prepTimeMinutes: 15,
      cookTimeMinutes: 30,
      servings: 4
    }
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: 'ingredients'
  });

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control,
    name: 'steps'
  });

  const imageUrl = watch('imageUrl');

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { signature, timestamp, apiKey, cloudName } = await recipeService.getCloudinarySignature();
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey || '');
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', 'recipes');

      const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, formData);
      
      setValue('imageUrl', res.data.secure_url);
    } catch (err) {
      console.error('Upload failed', err);
      setError('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: RecipeFormValues) => {
    try {
      setError(null);
      await recipeService.createRecipe(data);
      navigate('/feed');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data || err.message || 'Failed to create recipe';
      setError(errorMessage);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={4}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth label="Recipe Title" placeholder="Give your masterpiece a name"
                {...register('title', { required: 'Title is required' })}
                error={!!errors.title} helperText={errors.title?.message}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth multiline rows={4} label="The Story" placeholder="What's the inspiration behind this recipe?"
                {...register('description')}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField 
                fullWidth type="number" label="Prep (min)"
                {...register('prepTimeMinutes', { valueAsNumber: true })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField 
                fullWidth type="number" label="Cook (min)"
                {...register('cookTimeMinutes', { valueAsNumber: true })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField 
                fullWidth type="number" label="Servings"
                {...register('servings', { valueAsNumber: true })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box 
                sx={{ 
                  border: '2px dashed #e2e8f0', p: 4, textAlign: 'center', borderRadius: 4,
                  bgcolor: '#f8fafc', transition: 'all 0.3s', '&:hover': { borderColor: 'primary.main', bgcolor: '#fff5f5' }
                }}
              >
                {imageUrl ? (
                  <Box sx={{ position: 'relative' }}>
                    <Box component="img" src={imageUrl} sx={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                    <Button 
                      variant="contained" color="error" size="small"
                      sx={{ position: 'absolute', top: 16, right: 16, borderRadius: 2 }}
                      onClick={() => setValue('imageUrl', '')}
                    >
                      Remove
                    </Button>
                  </Box>
                ) : (
                  <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
                    <input
                      accept="image/*" id="image-upload" type="file"
                      style={{ display: 'none' }} onChange={handleImageUpload}
                    />
                    <Box sx={{ py: 4 }}>
                      <CloudUploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Upload Cover Photo</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>High quality photos make recipes look better</Typography>
                      <Button variant="contained" component="span" disabled={uploading} sx={{ borderRadius: 3, px: 4 }}>
                        {uploading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Choose Image'}
                      </Button>
                    </Box>
                  </label>
                )}
              </Box>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Ingredients</Typography>
              <Button 
                startIcon={<AddIcon />} 
                variant="outlined"
                sx={{ borderRadius: 3 }}
                onClick={() => appendIngredient({ name: '', quantity: '', unit: '' })}
              >
                Add Row
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {ingredientFields.map((field, index) => (
                <Box key={field.id} className="animate-fade-in" sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2.5, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                  <TextField 
                    label="Ingredient name" variant="standard"
                    sx={{ flex: 3 }} 
                    {...register(`ingredients.${index}.name` as const, { required: true })} 
                  />
                  <TextField 
                    label="Qty" variant="standard"
                    sx={{ flex: 1 }} 
                    {...register(`ingredients.${index}.quantity` as const, { required: true })} 
                  />
                  <TextField 
                    label="Unit" variant="standard"
                    sx={{ flex: 1 }} 
                    {...register(`ingredients.${index}.unit` as const)} 
                  />
                  <IconButton onClick={() => removeIngredient(index)} color="error" size="small" sx={{ bgcolor: '#fff5f5', '&:hover': { bgcolor: '#fee2e2' } }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Step by Step</Typography>
              <Button 
                startIcon={<AddIcon />} 
                variant="outlined"
                sx={{ borderRadius: 3 }}
                onClick={() => appendStep({ stepNumber: stepFields.length + 1, instruction: '' })}
              >
                Add Step
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {stepFields.map((field, index) => (
                <Box key={field.id} className="animate-fade-in" sx={{ display: 'flex', gap: 3, p: 3, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                  <Box sx={{ 
                    minWidth: 32, height: 32, borderRadius: '50%', 
                    bgcolor: 'primary.main', color: 'white', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.9rem', mt: 1, boxShadow: '0 4px 10px rgba(239, 68, 68, 0.2)'
                  }}>
                    {index + 1}
                  </Box>
                  <TextField 
                    fullWidth multiline rows={3} label="Describe this step" variant="standard"
                    {...register(`steps.${index}.instruction` as const, { required: true })} 
                  />
                  <IconButton onClick={() => removeStep(index)} color="error" size="small" sx={{ alignSelf: 'center', bgcolor: '#fff5f5', '&:hover': { bgcolor: '#fee2e2' } }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight={800} textAlign="center" gutterBottom>
          Create New Recipe
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ py: 3 }}>
          {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <form onSubmit={handleSubmit(onSubmit)}>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            {activeStep !== 0 && (
              <Button onClick={handleBack} variant="outlined">Back</Button>
            )}
            {activeStep === steps.length - 1 ? (
              <Button type="submit" variant="contained" color="primary">Create Recipe</Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>Next</Button>
            )}
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateRecipePage;
