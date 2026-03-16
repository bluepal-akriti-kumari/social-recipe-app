import api from './api';

export interface Ingredient {
  id: number;
  name: string;
  quantity: string;
  unit: string;
}

export interface Step {
  id: number;
  stepNumber: number;
  instruction: string;
}

export interface RecipeSummary {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
  author: {
    id: number;
    username: string;
    profilePictureUrl: string;
  };
}

export interface RecipeDetail extends RecipeSummary {
  ingredients: Ingredient[];
  steps: Step[];
}

// Updated to match the new backend Cursor Map structure
export interface CursorResponse<T> {
  content: T[];
  nextCursor: string;
}

export const recipeService = {
  // Updated for Cursor-based Pagination
  getExploreFeed: (cursor?: string, size = 12): Promise<CursorResponse<RecipeSummary>> =>
    api.get(`/feed/explore`, { params: { cursor, size } }).then(r => r.data),

  getPersonalizedFeed: (cursor?: string, size = 12): Promise<CursorResponse<RecipeSummary>> =>
    api.get(`/feed/personalized`, { params: { cursor, size } }).then(r => r.data),

  getRecipeById: (id: number): Promise<RecipeDetail> =>
    api.get(`/recipes/${id}`).then(r => r.data),

  createRecipe: (data: object): Promise<RecipeDetail> =>
    api.post('/recipes', data).then(r => r.data),

  updateRecipe: (id: number, data: object): Promise<RecipeDetail> =>
    api.put(`/recipes/${id}`, data).then(r => r.data),

  deleteRecipe: (id: number) =>
    api.delete(`/recipes/${id}`),

  // Updated search to match the new List return type
  searchRecipes: (q: string): Promise<RecipeSummary[]> =>
    api.get(`/recipes/search`, { params: { q } }).then(r => r.data),

  getUserRecipes: (username: string): Promise<RecipeSummary[]> =>
    api.get(`/users/${username}/recipes`).then(r => r.data),

  getUserLikedRecipes: (username: string): Promise<RecipeSummary[]> =>
    api.get(`/users/${username}/liked-recipes`).then(r => r.data),

  likeRecipe: (id: number) =>
    api.post(`/recipes/${id}/like`).then(r => r.data),

  getComments: (recipeId: number, page = 0, size = 20) =>
    api.get(`/recipes/${recipeId}/comments`, { params: { page, size } }).then(r => r.data),

  addComment: (recipeId: number, content: string, parentId?: number) =>
    api.post(`/recipes/${recipeId}/comments`, { content, parentId }).then(r => r.data),

  deleteComment: (commentId: number) =>
    api.delete(`/comments/${commentId}`),

  getCloudinarySignature: (folder = 'recipes') =>
    api.get<{ signature: string; timestamp: string; apiKey: string; cloudName: string; folder: string }>(
      `/cloudinary/signature`, { params: { folder } }
    ).then(r => r.data),
};