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

// modal style removed as it was unused and causing lint error

const EditProfileModal: React.FC<EditProfileModalProps> = ({ open, onClose, profile }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [bio, setBio] = useState(profile.bio || '');
  const [image, setImage] = useState(profile.profilePictureUrl || '');
  const [coverImage, setCoverImage] = useState(profile.coverPictureUrl || '');
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'avatar') setUploading(true);
    else setUploadingCover(true);

    try {
      const { signature, timestamp, apiKey, cloudName, folder } = await recipeService.getCloudinarySignature(type === 'avatar' ? 'profiles' : 'covers');
      
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
      if (type === 'avatar') setImage(data.secure_url);
      else setCoverImage(data.secure_url);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      if (type === 'avatar') setUploading(false);
      else setUploadingCover(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(updateProfileThunk({ bio, profilePictureUrl: image, coverPictureUrl: coverImage }));
      onClose();
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ 
        width: { xs: '95%', sm: 500 }, 
        bgcolor: 'background.paper', 
        borderRadius: 6, 
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
        outline: 'none'
      }}>
        {/* Header/Cover Preview */}
        <Box sx={{ position: 'relative', height: 140, bgcolor: '#f1f5f9' }}>
          {coverImage ? (
            <Box component="img" src={coverImage} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Box sx={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)', opacity: 0.8 }} />
          )}
          <IconButton 
            component="label"
            sx={{ 
              position: 'absolute', top: 12, right: 12, bgcolor: 'rgba(255,255,255,0.8)', 
              '&:hover': { bgcolor: 'white' }, backdropFilter: 'blur(4px)' 
            }}
            size="small"
          >
            <input hidden accept="image/*" type="file" onChange={(e) => handleImageUpload(e, 'cover')} />
            {uploadingCover ? <CircularProgress size={20} /> : <PhotoCameraIcon fontSize="small" />}
          </IconButton>
          
          <IconButton onClick={onClose} sx={{ position: 'absolute', top: 12, left: 12, bgcolor: 'rgba(0,0,0,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.4)' } }} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ p: 4, pt: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: -6, mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar 
                src={image} 
                sx={{ width: 100, height: 100, border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              >
                {profile.username[0].toUpperCase()}
              </Avatar>
              <IconButton 
                component="label" 
                sx={{ 
                  position: 'absolute', bottom: 0, right: 0, 
                  bgcolor: 'primary.main', color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
                size="small"
                disabled={uploading}
              >
                <input hidden accept="image/*" type="file" onChange={(e) => handleImageUpload(e, 'avatar')} />
                {uploading ? <CircularProgress size={16} color="inherit" /> : <PhotoCameraIcon sx={{ fontSize: 16 }} />}
              </IconButton>
            </Box>
          </Box>

          <Typography variant="h6" fontWeight={800} textAlign="center" mb={1}>{profile.username}</Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={4}>Update your profile details</Typography>

          <TextField
            fullWidth
            label="About You"
            multiline
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            sx={{ mb: 4, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />

          <Stack direction="row" spacing={2}>
            <Button 
              fullWidth 
              variant="outlined" 
              onClick={onClose}
              sx={{ py: 1.5, borderRadius: 3, fontWeight: 700 }}
            >
              Cancel
            </Button>
            <Button 
              fullWidth 
              variant="contained" 
              onClick={handleSave}
              disabled={saving || uploading || uploadingCover}
              sx={{ py: 1.5, borderRadius: 3, fontWeight: 800 }}
            >
              {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditProfileModal;
