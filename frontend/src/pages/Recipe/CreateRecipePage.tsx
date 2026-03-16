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
      setError(err.response?.data || 'Failed to create recipe');
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth label="Title" 
                  {...register('title', { required: 'Title is required' })}
                  error={!!errors.title} helperText={errors.title?.message}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth multiline rows={3} label="Description"
                  {...register('description')}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField 
                  fullWidth type="number" label="Prep Time (min)"
                  {...register('prepTimeMinutes', { valueAsNumber: true })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField 
                  fullWidth type="number" label="Cook Time (min)"
                  {...register('cookTimeMinutes', { valueAsNumber: true })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField 
                  fullWidth type="number" label="Servings"
                  {...register('servings', { valueAsNumber: true })}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ border: '2px dashed #ccc', p: 3, textAlign: 'center', borderRadius: 2 }}>
                  {imageUrl ? (
                    <Box component="img" src={imageUrl} sx={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 2 }} />
                  ) : (
                    <label htmlFor="image-upload">
                      <input
                        accept="image/*" id="image-upload" type="file"
                        style={{ display: 'none' }} onChange={handleImageUpload}
                      />
                      <Button variant="outlined" component="span" startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}>
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </Button>
                    </label>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Ingredients</Typography>
            {ingredientFields.map((field, index) => (
              <Box key={field.id} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <TextField size="small" label="Name" sx={{ flex: 2 }} {...register(`ingredients.${index}.name` as const, { required: true })} />
                <TextField size="small" label="Qty" sx={{ flex: 1 }} {...register(`ingredients.${index}.quantity` as const, { required: true })} />
                <TextField size="small" label="Unit" sx={{ flex: 1 }} {...register(`ingredients.${index}.unit` as const)} />
                <IconButton onClick={() => removeIngredient(index)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button startIcon={<AddIcon />} onClick={() => appendIngredient({ name: '', quantity: '', unit: '' })}>
              Add Ingredient
            </Button>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Cooking Steps</Typography>
            {stepFields.map((field, index) => (
              <Box key={field.id} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
                <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 700 }}>{index + 1}.</Typography>
                <TextField 
                  fullWidth multiline rows={2} label="Instruction" 
                  {...register(`steps.${index}.instruction` as const, { required: true })} 
                />
                <IconButton onClick={() => removeStep(index)} color="error" sx={{ mt: 1 }}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button startIcon={<AddIcon />} onClick={() => appendStep({ stepNumber: stepFields.length + 1, instruction: '' })}>
              Add Step
            </Button>
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
