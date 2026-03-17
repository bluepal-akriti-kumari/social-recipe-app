import { useState } from 'react';
import { 
  Container, Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Avatar, Chip, IconButton,
  CircularProgress, Grid, Card, CardContent, Tooltip
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import VerifiedIcon from '@mui/icons-material/Verified';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  isVerified: boolean;
  profilePictureUrl: string;
  reputationPoints: number;
}

const AdminDashboard = () => {
  const queryClient = useQueryClient();

  // --- Data Fetching ---
  const { 
    data: users = [], 
    isLoading: isUsersLoading 
  } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.get<User[]>('/admin/users').then(res => res.data),
  });

  const { 
    data: stats = { totalUsers: 0, totalRecipes: 0 }, 
    isLoading: isStatsLoading 
  } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get<any>('/admin/stats').then(res => ({
      totalUsers: res.data.totalUsers || 0,
      totalRecipes: res.data.totalRecipes || 0
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

  const handleToggleVerify = (username: string) => toggleVerifyMutation.mutate(username);
  
  const handlePromoteAdmin = (username: string, currentRoles: string[]) => {
    const isAlreadyAdmin = currentRoles.includes('ROLE_ADMIN');
    const newRoles = isAlreadyAdmin 
      ? currentRoles.filter(r => r !== 'ROLE_ADMIN')
      : [...currentRoles, 'ROLE_ADMIN'];
    updateRolesMutation.mutate({ username, roles: newRoles });
  };

  const isLoading = isUsersLoading || isStatsLoading;

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Box className="bg-mesh" sx={{ minHeight: '100vh', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: '-0.03em', mb: 4 }}>
          Platform Management
        </Typography>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
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
        </Grid>

        {/* Users Table */}
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
