import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RecipeCard from './RecipeCard';
import '@testing-library/jest-dom';

// Mock dependecies
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 1, username: 'testuser' }
  })
}));

jest.mock('../../pages/Recipe/AddToPlannerModal', () => {
  return function MockAddToPlannerModal() {
    return <div data-testid="planner-modal">Planner Modal</div>;
  };
});

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const mockRecipe = {
  id: 1,
  title: 'Delicious Pasta',
  description: 'A classic Italian pasta recipe.',
  imageUrl: 'test-image.jpg',
  prepTimeMinutes: 10,
  cookTimeMinutes: 20,
  servings: 2,
  likeCount: 5,
  commentCount: 2,
  isLiked: false,
  isBookmarked: false,
  category: 'Italian',
  createdAt: new Date().toISOString(),
  author: {
    id: 1,
    username: 'chef123',
    profilePictureUrl: 'chef.jpg',
    isVerified: true
  }
};

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('RecipeCard', () => {
  test('renders recipe details correctly', () => {
    renderWithRouter(<RecipeCard recipe={mockRecipe} />);
    
    expect(screen.getByText('Delicious Pasta')).toBeInTheDocument();
    expect(screen.getByText('A classic Italian pasta recipe.')).toBeInTheDocument();
    expect(screen.getByText('chef123')).toBeInTheDocument();
    expect(screen.getByText('30m')).toBeInTheDocument(); // 10 + 20
    expect(screen.getByText('5')).toBeInTheDocument(); // likes
  });

  test('calls onLike when like button is clicked', () => {
    const onLikeMock = jest.fn();
    renderWithRouter(<RecipeCard recipe={mockRecipe} onLike={onLikeMock} />);
    screen.debug();
    // Find the like button.
    // It's the first IconButton in the interaction section.
    const likeButton = screen.getAllByRole('button')[2]; // Index 2: Bookmark is [0], Planner is [1], Like is [2]
    fireEvent.click(likeButton);
    
    expect(onLikeMock).toHaveBeenCalledWith(mockRecipe.id);
  });

  test('opens planner modal when calendar icon is clicked', () => {
    renderWithRouter(<RecipeCard recipe={mockRecipe} />);
    
    const calendarButton = screen.getAllByRole('button')[1];
    fireEvent.click(calendarButton);
    
    expect(screen.getByTestId('planner-modal')).toBeVisible();
  });
});
