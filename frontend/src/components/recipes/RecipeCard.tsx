import { 
  Card, CardHeader, CardMedia, CardContent, CardActions, 
  Avatar, IconButton, Typography, Box, Chip 
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from 'react-router-dom';
import type { RecipeSummary } from '../../services/recipe.service';

interface RecipeCardProps {
  recipe: RecipeSummary;
  onLike?: (id: number) => void;
}

const RecipeCard = ({ recipe, onLike }: RecipeCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      sx={{ 
        maxWidth: 345, 
        borderRadius: 3, 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }
      }}
    >
      <CardHeader
        avatar={
          <Avatar 
            src={recipe.author.profilePictureUrl} 
            sx={{ bgcolor: 'primary.main', cursor: 'pointer' }}
            onClick={() => navigate(`/profile/${recipe.author.username}`)}
          >
            {recipe.author.username[0].toUpperCase()}
          </Avatar>
        }
        title={
          <Typography 
            variant="subtitle1" 
            fontWeight={600} 
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate(`/profile/${recipe.author.username}`)}
          >
            {recipe.author.username}
          </Typography>
        }
        subheader={new Date(recipe.createdAt).toLocaleDateString()}
      />
      <CardMedia
        component="img"
        height="194"
        image={recipe.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'}
        alt={recipe.title}
        sx={{ cursor: 'pointer' }}
        onClick={() => navigate(`/recipes/${recipe.id}`)}
      />
      <CardContent sx={{ cursor: 'pointer' }} onClick={() => navigate(`/recipes/${recipe.id}`)}>
        <Typography variant="h6" fontWeight={700} noWrap gutterBottom>
          {recipe.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          mb: 2
        }}>
          {recipe.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            size="small" 
            icon={<AccessTimeIcon />} 
            label={`${Number(recipe.prepTimeMinutes) + Number(recipe.cookTimeMinutes)} min`} 
            variant="outlined"
          />
        </Box>
      </CardContent>
      <CardActions disableSpacing sx={{ px: 2, pb: 2 }}>
        <IconButton onClick={() => onLike?.(recipe.id)}>
          {recipe.isLiked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
        </IconButton>
        <Typography variant="body2" sx={{ mr: 2 }}>{recipe.likeCount}</Typography>
        
        <IconButton onClick={() => navigate(`/recipes/${recipe.id}#comments`)}>
          <ChatBubbleOutlineIcon />
        </IconButton>
        <Typography variant="body2">{recipe.commentCount}</Typography>
      </CardActions>
    </Card>
  );
};

export default RecipeCard;
