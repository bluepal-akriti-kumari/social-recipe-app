import React, { useState } from 'react';
import { 
  Modal, Box, Typography, TextField, Button, 
  Avatar, IconButton, Stack, CircularProgress 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store/store';
import { updateProfileThunk } from '../../features/user/userThunks';
import type { UserProfile } from '../../services/user.service';
import { recipeService } from '../../services/recipe.service';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 450 },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 4,
  outline: 'none'
};

const EditProfileModal: React.FC<EditProfileModalProps> = ({ open, onClose, profile }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [bio, setBio] = useState(profile.bio || '');
  const [image, setImage] = useState(profile.profilePictureUrl || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Reuse Cloudinary signature logic if possible, or simple upload if allowed
      // For now, assuming direct upload to signed URL if frontend has it, 
      // but let's stick to the pattern: get signature -> upload to cloudinary -> get URL
      const { signature, timestamp, apiKey, cloudName, folder } = await recipeService.getCloudinarySignature('profiles');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('api_key', apiKey);
      formData.append('folder', folder);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setImage(data.secure_url);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(updateProfileThunk({ bio, profilePictureUrl: image }));
      onClose();
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight={800}>Edit Profile</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar 
              src={image} 
              sx={{ width: 100, height: 100, mb: 2, border: '2px solid #eee' }}
            >
              {profile.username[0].toUpperCase()}
            </Avatar>
            <IconButton 
              component="label" 
              sx={{ 
                position: 'absolute', bottom: 15, right: -5, 
                bgcolor: 'primary.main', color: 'white',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
              size="small"
              disabled={uploading}
            >
              <input hidden accept="image/*" type="file" onChange={handleImageUpload} />
              {uploading ? <CircularProgress size={20} color="inherit" /> : <PhotoCameraIcon fontSize="small" />}
            </IconButton>
          </Box>
        </Box>

        <TextField
          fullWidth
          label="Bio"
          multiline
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          sx={{ mb: 4 }}
        />

        <Button 
          fullWidth 
          variant="contained" 
          size="large" 
          onClick={handleSave}
          disabled={saving || uploading}
          sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
        >
          {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
        </Button>
      </Box>
    </Modal>
  );
};

export default EditProfileModal;
