import { 
  Card, CardContent, CardMedia, Typography, 
  Box, Avatar, IconButton, Chip 
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
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
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': { 
          transform: 'translateY(-8px)', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
          '& .card-media': { transform: 'scale(1.05)' },
          '& .card-overlay': { opacity: 1 }
        }
      }}
    >
      {/* Media & Overlay */}
      <Box sx={{ position: 'relative', overflow: 'hidden', pt: '100%' }}>
        <CardMedia
          component="img"
          className="card-media"
          image={recipe.imageUrl || 'https://via.placeholder.com/400x400?text=No+Image'}
          alt={recipe.title}
          sx={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            transition: 'transform 0.6s ease', cursor: 'pointer' 
          }}
          onClick={() => navigate(`/recipes/${recipe.id}`)}
        />
        
        {/* Top Overlay Actions */}
        <Box 
          sx={{ 
            position: 'absolute', top: 12, right: 12, 
            display: 'flex', flexDirection: 'column', gap: 1 
          }}
        >
          <IconButton 
            size="small"
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(4px)',
              '&:hover': { bgcolor: 'white' }
            }}
          >
            <BookmarkBorderIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Bottom Overlay Status */}
        <Box 
          sx={{ 
            position: 'absolute', bottom: 12, left: 12, 
            display: 'flex', gap: 1 
          }}
        >
          <Chip 
            size="small" 
            icon={<AccessTimeIcon sx={{ fontSize: '14px !important' }} />} 
            label={`${Number(recipe.prepTimeMinutes) + Number(recipe.cookTimeMinutes)}m`} 
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(4px)',
              fontWeight: 700, fontSize: '0.75rem', height: 24
            }}
          />
        </Box>
      </Box>

      {/* Content */}
      <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
          <Avatar 
            src={recipe.author.profilePictureUrl} 
            sx={{ width: 24, height: 24, cursor: 'pointer' }}
            onClick={() => navigate(`/profile/${recipe.author.username}`)}
          >
            {recipe.author.username[0].toUpperCase()}
          </Avatar>
          <Typography 
            variant="caption" 
            fontWeight={700} 
            color="text.secondary"
            sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
            onClick={() => navigate(`/profile/${recipe.author.username}`)}
          >
            {recipe.author.username}
          </Typography>
        </Box>

        <Typography 
          variant="h6" 
          sx={{ 
            lineHeight: 1.3, mb: 1, cursor: 'pointer', 
            '&:hover': { color: 'primary.main' },
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden', fontWeight: 800, fontSize: '1.05rem'
          }}
          onClick={() => navigate(`/recipes/${recipe.id}`)}
        >
          {recipe.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton 
              size="small" 
              onClick={() => onLike?.(recipe.id)}
              sx={{ p: 0, color: recipe.isLiked ? 'primary.main' : 'text.disabled' }}
            >
              {recipe.isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
            </IconButton>
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              {recipe.likeCount}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton 
              size="small" 
              sx={{ p: 0, color: 'text.disabled' }}
              onClick={() => navigate(`/recipes/${recipe.id}#comments`)}
            >
              <ChatBubbleOutlineIcon fontSize="small" />
            </IconButton>
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              {recipe.commentCount}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;
