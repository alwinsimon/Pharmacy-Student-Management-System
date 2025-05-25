import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Person,
  Add,
  Delete,
  Edit,
  Block,
  CheckCircle,
  School,
  SupervisorAccount
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data
        const mockUsers = [
          { id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', role: 'student', isActive: true, createdAt: '2023-01-15T12:00:00Z' },
          { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', role: 'teacher', isActive: true, createdAt: '2023-01-10T12:00:00Z' },
          { id: '3', firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@example.com', role: 'admin', isActive: true, createdAt: '2023-01-05T12:00:00Z' },
          { id: '4', firstName: 'Alice', lastName: 'Williams', email: 'alice.williams@example.com', role: 'student', isActive: false, createdAt: '2023-01-20T12:00:00Z' },
        ];
        setUsers(mockUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleToggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
  };
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage users, system settings, and view system statistics
          </Typography>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<Person />} label="User Management" />
            <Tab icon={<School />} label="Academic Settings" />
            <Tab icon={<SupervisorAccount />} label="System Settings" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, maxWidth: 800 }}>
              <TextField
                label="Search Users"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                sx={{ flexGrow: 1 }}
              />
              
              <FormControl sx={{ minWidth: 150 }} size="small">
                <InputLabel id="role-filter-label">Role</InputLabel>
                <Select
                  labelId="role-filter-label"
                  value={roleFilter}
                  label="Role"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="student">Students</MenuItem>
                  <MenuItem value="teacher">Teachers</MenuItem>
                  <MenuItem value="admin">Admins</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {/* Open create user dialog */}}
            >
              Add User
            </Button>
          </Box>
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          No users found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={user.role} 
                            color={
                              user.role === 'admin' ? 'error' :
                              user.role === 'teacher' ? 'primary' : 'success'
                            }
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={user.isActive ? 'Active' : 'Inactive'} 
                            color={user.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" sx={{ mx: 0.5 }}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color={user.isActive ? 'error' : 'success'}
                            onClick={() => handleToggleUserStatus(user.id)}
                            sx={{ mx: 0.5 }}
                          >
                            {user.isActive ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                          </IconButton>
                          <IconButton size="small" color="error" sx={{ mx: 0.5 }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Academic Year Settings
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Current Academic Year"
                defaultValue="2023-2024"
                helperText="Used for organizing cases, tests, and queries"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Term/Semester"
                defaultValue="Fall 2023"
              />
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Departments
          </Typography>
          
          <TableContainer component={Paper} elevation={0} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Department Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Clinical Pharmacy</TableCell>
                  <TableCell>CLIN</TableCell>
                  <TableCell align="center">
                    <IconButton size="small"><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error"><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Pharmacology</TableCell>
                  <TableCell>PHAR</TableCell>
                  <TableCell align="center">
                    <IconButton size="small"><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error"><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          
          <Button
            startIcon={<Add />}
            variant="contained"
            size="small"
          >
            Add Department
          </Button>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Email Notifications
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ my: 1 }}>
                    <FormControl component="fieldset">
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>
                            Send email notifications for:
                          </Typography>
                        </Grid>
                        
                        {['New case submissions', 'New query assignments', 'Test results', 'Account changes'].map((item, index) => (
                          <Grid item xs={12} key={index}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2">{item}</Typography>
                              <Chip label="Enabled" color="success" size="small" />
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </FormControl>
                  </Box>
                  
                  <Button variant="outlined" sx={{ mt: 2 }}>
                    Edit Email Settings
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    System Backup
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="body2" paragraph>
                    Last backup: <strong>2023-04-15 14:30</strong>
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    Automatic backups are scheduled daily at 00:00 UTC.
                  </Typography>
                  
                  <Button variant="contained" color="primary">
                    Create Manual Backup
                  </Button>
                </CardContent>
              </Card>
              
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    System Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={1}>
                    <Grid item xs={5}>
                      <Typography variant="body2" color="text.secondary">
                        Version:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2">
                        1.0.0
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={5}>
                      <Typography variant="body2" color="text.secondary">
                        Database:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2">
                        MongoDB 5.0.5
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={5}>
                      <Typography variant="body2" color="text.secondary">
                        Environment:
                      </Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2">
                        Production
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AdminDashboard; 