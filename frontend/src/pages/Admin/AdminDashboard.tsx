import { useState } from 'react';
import { 
  Container, Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Avatar, Chip, IconButton,
  CircularProgress, Grid, Card, CardContent, Tooltip,
  Tabs, Tab,
  Button
} from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import VerifiedIcon from '@mui/icons-material/Verified';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  isVerified: boolean;
  isRestricted: boolean; 
  premium: boolean; // Renamed
  profilePictureUrl: string;
  reputationPoints: number;
}

interface Recipe {
  id: number;
  title: string;
  status: 'ACTIVE' | 'RESTRICTED';
  author: { username: string };
  isPremium: boolean;
  createdAt: string;
}

interface Report {
  id: number;
  reporter: { username: string };
  reason: string;
  targetType: string;
  targetId: number;
  resolved: boolean;
  createdAt: string;
}

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);

  // --- Data Fetching ---
  const { 
    data: users = [], 
    isLoading: isUsersLoading 
  } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.get<User[]>('/admin/users').then(res => res.data),
  });

  const { 
    data: reports = [], 
    isLoading: isReportsLoading 
  } = useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: () => api.get<Report[]>('/admin/reports').then(res => res.data),
  });

  const { 
    data: recipes = [], 
    isLoading: isRecipesLoading 
  } = useQuery({
    queryKey: ['admin', 'recipes'],
    queryFn: () => api.get<Recipe[]>('/admin/recipes').then(res => res.data),
  });

  const { 
    data: stats = { totalUsers: 0, totalRecipes: 0, pendingReports: 0 }, 
    isLoading: isStatsLoading 
  } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get<any>('/admin/stats').then(res => ({
      totalUsers: res.data.totalUsers || 0,
      totalRecipes: res.data.totalRecipes || 0,
      pendingReports: res.data.pendingReports || 0
    })),
  });

  // --- Mutations ---
  const toggleVerifyMutation = useMutation({
    mutationFn: (username: string) => api.patch(`/admin/users/${username}/verify`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      toast.success('User verification updated');
    },
    onError: () => toast.error('Failed to update verification'),
  });

  const updateRolesMutation = useMutation({
    mutationFn: ({ username, roles }: { username: string, roles: string[] }) => 
      api.patch(`/admin/users/${username}/roles`, { roles }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      const isNowAdmin = variables.roles.includes('ROLE_ADMIN');
      toast.success(isNowAdmin ? 'User promoted to Admin' : 'Admin role removed');
    },
    onError: () => toast.error('Failed to update user role'),
  });

  const resolveReportMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/admin/reports/${id}/resolve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      toast.success('Report resolved');
    },
    onError: () => toast.error('Failed to resolve report'),
  });

  const toggleRestrictUserMutation = useMutation({
    mutationFn: (username: string) => api.patch(`/admin/users/${username}/restrict`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User restriction toggled');
    },
  });

  const handleToggleVerify = (username: string) => toggleVerifyMutation.mutate(username);
  
  const handlePromoteAdmin = (username: string, currentRoles: string[]) => {
    const isAlreadyAdmin = currentRoles.includes('ROLE_ADMIN');
    const newRoles = isAlreadyAdmin 
      ? currentRoles.filter(r => r !== 'ROLE_ADMIN')
      : [...currentRoles, 'ROLE_ADMIN'];
    updateRolesMutation.mutate({ username, roles: newRoles });
  };

  const toggleRecipeStatusMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/admin/recipes/${id}/status`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'recipes'] });
      toast.success('Recipe status updated');
    },
  });

  const toggleRecipePremiumMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/admin/recipes/${id}/premium`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'recipes'] });
      toast.success('Recipe premium status updated');
    },
    onError: () => toast.error('Failed to update premium status'),
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/recipes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'recipes'] });
      toast.success('Recipe deleted');
    },
  });

  const isLoading = isUsersLoading || isStatsLoading || isReportsLoading || isRecipesLoading;
  const handleTabChange = (_: any, newValue: number) => setTabValue(newValue);

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Box className="bg-mesh" sx={{ minHeight: '100vh', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: '-0.03em', mb: 4 }}>
          Platform Management
        </Typography>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card className="glass-card" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: 'primary.light', borderRadius: 1.5, display: 'flex' }}>
                  <PeopleIcon sx={{ color: 'primary.main' }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 950 }}>{stats.totalUsers}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>TOTAL USERS</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card className="glass-card" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: 'secondary.light', borderRadius: 1.5, display: 'flex' }}>
                  <RestaurantMenuIcon sx={{ color: 'secondary.main' }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 950 }}>{stats.totalRecipes}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>TOTAL RECIPES</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card className="glass-card" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: 'error.light', borderRadius: 1.5, display: 'flex' }}>
                   <FlagIcon sx={{ color: 'error.main' }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 950 }}>{stats.pendingReports}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>PENDING REPORTS</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ '& .MuiTab-root': { fontWeight: 900 } }}>
            <Tab label="User Management" />
            <Tab label="Recipe Management" />
            <Tab label="Reports & Moderation" />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          /* Users Table */
          <Paper className="glass-card" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>User Management</Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 900 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Roles</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Premium</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>Reputation</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 900 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={user.profilePictureUrl} sx={{ width: 40, height: 40, fontWeight: 900 }}>
                          {user.username[0].toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                            {user.username} {user.isVerified && <VerifiedIcon color="primary" sx={{ fontSize: 16, ml: 0.5, verticalAlign: 'middle' }} />}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {user.roles.map((role) => (
                          <Chip 
                            key={role} 
                            label={role.replace('ROLE_', '')} 
                            size="small" 
                            color={role === 'ROLE_ADMIN' ? 'secondary' : 'default'}
                            variant={role === 'ROLE_ADMIN' ? 'filled' : 'outlined'}
                            sx={{ fontWeight: 800, fontSize: '0.65rem' }} 
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.isVerified ? 'Verified' : 'Unverified'} 
                        size="small" 
                        color={user.isVerified ? 'success' : 'default'}
                        sx={{ fontWeight: 800, fontSize: '0.65rem' }} 
                      />
                    </TableCell>
                    <TableCell>
                      {user.premium ? (
                        <Chip 
                          label="Premium" 
                          size="small" 
                          icon={<WorkspacePremiumIcon sx={{ fontSize: '14px !important', color: '#B8860B !important' }} />}
                          sx={{ fontWeight: 900, bgcolor: 'rgba(255, 215, 0, 0.2)', color: '#B8860B', border: '1px solid #FFD700' }} 
                        />
                      ) : (
                        <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 700 }}>Basic</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>{user.reputationPoints} pts</TableCell>
                    <TableCell align="right">
                      <Tooltip title={user.isVerified ? "Remove Verification" : "Verify User"}>
                        <IconButton onClick={() => handleToggleVerify(user.username)} color={user.isVerified ? "error" : "primary"}>
                          <VerifiedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.roles.includes('ROLE_ADMIN') ? "Revoke Admin" : "Promote to Admin"}>
                        <IconButton onClick={() => handlePromoteAdmin(user.username, user.roles)} color="secondary">
                          <AdminPanelSettingsIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.isRestricted ? "Unrestrict User" : "Restrict User"}>
                        <IconButton onClick={() => toggleRestrictUserMutation.mutate(user.username)} color="warning">
                          <FlagIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        )}

        {tabValue === 1 && (
          /* Recipes Table */
          <Paper className="glass-card" sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>Recipe Management</Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 900 }}>Recipe</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Author</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Premium</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recipes.map((recipe) => (
                    <TableRow key={recipe.id} hover>
                      <TableCell sx={{ fontWeight: 800 }}>{recipe.title}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{recipe.author.username}</TableCell>
                      <TableCell>
                        <Chip 
                          label={recipe.isPremium ? "Premium" : "Standard"} 
                          size="small" 
                          variant={recipe.isPremium ? "filled" : "outlined"}
                          sx={{ 
                            fontWeight: 900, 
                            bgcolor: recipe.isPremium ? '#FFD700' : 'transparent',
                            color: recipe.isPremium ? 'black' : 'text.secondary',
                            cursor: 'pointer'
                          }} 
                          onClick={() => toggleRecipePremiumMutation.mutate(recipe.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={recipe.status} 
                          size="small" 
                          color={recipe.status === 'ACTIVE' ? 'success' : 'error'}
                          sx={{ fontWeight: 900 }} 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="warning" 
                          sx={{ mr: 1, borderRadius: 1.5 }}
                          onClick={() => toggleRecipeStatusMutation.mutate(recipe.id)}
                        >
                          {recipe.status === 'ACTIVE' ? 'Restrict' : 'Activate'}
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained" 
                          color="error"
                          sx={{ borderRadius: 1.5 }}
                          onClick={() => {
                            if (window.confirm('Delete this recipe permanently?')) {
                              deleteRecipeMutation.mutate(recipe.id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {tabValue === 2 && (
          /* Reports Table */
          <Paper className="glass-card" sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>Pending Reports</Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 900 }}>Reporter</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Target</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>Date</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id} hover>
                      <TableCell sx={{ fontWeight: 800 }}>{report.reporter.username}</TableCell>
                      <TableCell>
                        <Chip 
                          label={`${report.targetType} #${report.targetId}`} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontWeight: 800, fontSize: '0.65rem' }} 
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{report.reason}</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color="success" 
                          onClick={() => resolveReportMutation.mutate(report.id)}
                          disabled={resolveReportMutation.isPending}
                        >
                          <CheckCircleOutlineIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {reports.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No pending reports. Everything looks clean!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default AdminDashboard;
