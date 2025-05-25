import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TablePagination,
  Card,
  CardContent,
  CardHeader,
  FormGroup
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  FilterList,
  PlayArrow,
  Search,
  Visibility,
  ArrowBack
} from '@mui/icons-material';
import { getTests, getTestById, createTest, updateTest, resetTestState, clearCurrentTest } from '../../features/tests/testsSlice';

const TestList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tests, isLoading } = useSelector((state) => state.tests);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'published':
        return <Chip label="Published" color="primary" size="small" />;
      case 'active':
        return <Chip label="Active" color="info" size="small" />;
      case 'completed':
        return <Chip label="Completed" color="success" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h4" component="h1" gutterBottom>
              Tests & Assessments
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.role === 'student' 
                ? 'View and take tests assigned to you' 
                : 'Create and manage tests for your students'}
            </Typography>
          </Grid>
          
          {user?.role === 'teacher' && (
            <Grid item>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/tests/new')}
              >
                Create New Test
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: <Search fontSize="small" sx={{ mr: 1 }} />,
            }}
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="outlined" 
            startIcon={<FilterList />}
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            More Filters
          </Button>
        </Stack>
      </Paper>
      
      {filteredTests.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 4 }}>
          <CardContent>
            <Quiz sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No tests found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try changing your search or filter criteria' 
                : user?.role === 'teacher' 
                  ? 'You haven\'t created any tests yet' 
                  : 'No tests have been assigned to you yet'}
            </Typography>
            
            {user?.role === 'teacher' && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/tests/new')}
              >
                Create New Test
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell>Test Title</TableCell>
                <TableCell>Questions</TableCell>
                <TableCell>Time Limit</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTests
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((test) => (
                <TableRow key={test._id}>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {test.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {test.description?.substring(0, 60)}
                      {test.description?.length > 60 ? '...' : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {test.questionCount || 0} questions
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {test.timeLimit ? `${test.timeLimit} minutes` : 'No limit'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {test.scheduledFor 
                        ? new Date(test.scheduledFor).toLocaleDateString() 
                        : 'Not scheduled'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getStatusChip(test.status)}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View">
                      <IconButton 
                        size="small" 
                        onClick={() => navigate(`/tests/${test._id}`)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    {user?.role === 'teacher' && test.status === 'draft' && (
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small"
                          onClick={() => navigate(`/tests/${test._id}/edit`)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    {user?.role === 'student' && test.status === 'published' && (
                      <Tooltip title="Take Test">
                        <IconButton 
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/tests/${test._id}/take`)}
                        >
                          <PlayArrow fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    {(user?.role === 'admin' || (user?.role === 'teacher' && test.status === 'draft')) && (
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error">
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTests.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      )}
    </Container>
  );
};

export default TestList; 