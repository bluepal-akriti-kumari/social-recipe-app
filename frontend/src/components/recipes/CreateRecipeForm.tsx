import { useState } from 'react';
import { 
  Box, Stepper, Step, StepLabel, Button, 
  Typography, TextField, IconButton, 
  CircularProgress, Alert, Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useForm, useFieldArray } from 'react-hook-form';
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

interface CreateRecipeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateRecipeForm: React.FC<CreateRecipeFormProps> = ({ onSuccess, onCancel }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<RecipeFormValues>({
    defaultValues: {
      ingredients: [{ name: '', quantity: '', unit: '' }],
      steps: [{ stepNumber: 1, instruction: '' }],
      prepTimeMinutes: 15,
      cookTimeMinutes: 30,
      servings: 4,
      imageUrl: ''
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
      setIsSubmitting(true);
      await recipeService.createRecipe(data);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data || err.message || 'Failed to create recipe';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              size="small"
              fullWidth label="Recipe Title" placeholder="Give your masterpiece a name"
              {...register('title', { required: 'Title is required' })}
              error={!!errors.title} helperText={errors.title?.message}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />
            <TextField
              size="small"
              fullWidth multiline rows={3} label="The Story" placeholder="What's the inspiration behind this recipe?"
              {...register('description')}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                size="small"
                fullWidth type="number" label="Prep (min)"
                {...register('prepTimeMinutes', { valueAsNumber: true })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
              <TextField 
                size="small"
                fullWidth type="number" label="Cook (min)"
                {...register('cookTimeMinutes', { valueAsNumber: true })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
              <TextField 
                size="small"
                fullWidth type="number" label="Servings"
                {...register('servings', { valueAsNumber: true })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Box>
            <Box 
              sx={{ 
                border: '2px dashed #e2e8f0', p: 2, textAlign: 'center', borderRadius: 2,
                bgcolor: '#f8fafc', transition: 'all 0.3s', '&:hover': { borderColor: 'primary.main', bgcolor: '#fff5f5' }
              }}
            >
              {imageUrl ? (
                <Box sx={{ position: 'relative' }}>
                  <Box component="img" src={imageUrl} sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 2 }} />
                  <Button 
                    variant="contained" color="error" size="small"
                    sx={{ position: 'absolute', top: 8, right: 8, borderRadius: 2 }}
                    onClick={() => setValue('imageUrl', '')}
                  >
                    Remove
                  </Button>
                </Box>
              ) : (
                <label htmlFor="modal-image-upload" style={{ cursor: 'pointer' }}>
                  <input
                    accept="image/*" id="modal-image-upload" type="file"
                    style={{ display: 'none' }} onChange={handleImageUpload}
                  />
                  <Box sx={{ py: 2 }}>
                    <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Upload Cover Photo</Typography>
                    <Button variant="contained" component="span" size="small" disabled={uploading} sx={{ mt: 1, borderRadius: 3 }}>
                      {uploading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Choose Image'}
                    </Button>
                  </Box>
                </label>
              )}
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Ingredients</Typography>
              <Button 
                size="small" startIcon={<AddIcon />} variant="outlined" sx={{ borderRadius: 1.5 }}
                onClick={() => appendIngredient({ name: '', quantity: '', unit: '' })}
              >
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 300, overflowY: 'auto', pr: 1 }}>
              {ingredientFields.map((field, index) => (
                <Box key={field.id} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField size="small" label="Name" sx={{ flex: 3 }} {...register(`ingredients.${index}.name` as const, { required: true })} />
                  <TextField size="small" label="Qty" sx={{ flex: 1 }} {...register(`ingredients.${index}.quantity` as const, { required: true })} />
                  <IconButton onClick={() => removeIngredient(index)} color="error" size="small">
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Steps</Typography>
              <Button 
                size="small" startIcon={<AddIcon />} variant="outlined" sx={{ borderRadius: 1.5 }}
                onClick={() => appendStep({ stepNumber: stepFields.length + 1, instruction: '' })}
              >
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 300, overflowY: 'auto', pr: 1 }}>
              {stepFields.map((field, index) => (
                <Box key={field.id} sx={{ display: 'flex', gap: 1.5 }}>
                  <Typography sx={{ fontWeight: 800, mt: 1 }}>{index + 1}.</Typography>
                  <TextField fullWidth multiline size="small" label="Instruction" {...register(`steps.${index}.instruction` as const, { required: true })} />
                  <IconButton onClick={() => removeStep(index)} color="error" size="small" sx={{ alignSelf: 'center' }}>
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
    <Box sx={{ p: 1 }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          {activeStep === 0 ? (
            <Button onClick={onCancel} variant="text" color="inherit">Cancel</Button>
          ) : (
            <Button onClick={handleBack} variant="outlined">Back</Button>
          )}
          
          {activeStep === steps.length - 1 ? (
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} size="small" sx={{ borderRadius: 1.5 }}>
              {isSubmitting ? <CircularProgress size={20} /> : 'Post Recipe'}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext} size="small" sx={{ borderRadius: 1.5 }}>Next</Button>
          )}
        </Box>
      </form>
    </Box>
  );
};

export default CreateRecipeForm;
