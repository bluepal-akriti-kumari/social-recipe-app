import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FeedPage from './FeedPage';
import { recipeService } from '../../services/recipe.service';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('../../services/recipe.service');
jest.mock('../../components/discovery/FeaturedRecipeCarousel', () => () => <div data-testid="carousel">Carousel</div>);
jest.mock('../../components/discovery/CategoryQuickBar', () => () => <div data-testid="category-bar">Category Bar</div>);
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('FeedPage', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  test('renders header and discovery components', () => {
    (recipeService.getExploreFeed as jest.Mock).mockResolvedValue({ content: [], nextCursor: null });
    
    renderWithProviders(<FeedPage />);
    
    expect(screen.getByText(/Elevate Your/i)).toBeInTheDocument();
    expect(screen.getByTestId('category-bar')).toBeInTheDocument();
  });

  test('shows loading spinner while fetching', async () => {
    (recipeService.getExploreFeed as jest.Mock).mockReturnValue(new Promise(() => {}));
    
    renderWithProviders(<FeedPage />);
    
    expect(await screen.findByRole('progressbar', {}, { timeout: 3000 })).toBeInTheDocument();
  });

  test('displays empty state when no recipes found', async () => {
    (recipeService.getExploreFeed as jest.Mock).mockResolvedValue({ content: [], nextCursor: null });
    
    renderWithProviders(<FeedPage />);
    
    expect(await screen.findByText(/No culinary treasures found/i)).toBeInTheDocument();
  });
});
