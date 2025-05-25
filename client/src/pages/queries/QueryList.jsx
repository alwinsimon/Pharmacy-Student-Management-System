import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Tooltip
} from '@mui/material';
import {
  ArrowBack,
  Delete,
  Visibility,
  Edit
} from '@mui/icons-material';


const QueryList = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { queries, isLoading } = useSelector((state) => state.queries);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredQueries, setFilteredQueries] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (queries && queries.length > 0) {
      let filtered = [...queries];
      
      // Apply status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter(q => q.status === statusFilter);
      }
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(q => 
          q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.question?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setFilteredQueries(filtered);
    } else {
      setFilteredQueries([]);
    }
  }, [queries, statusFilter, searchTerm, user]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'draft':
        return <Chip label="Draft" color="default" size="small" />;
      case 'assigned':
        return <Chip label="Assigned" color="primary" size="small" />;
      case 'responded':
        return <Chip label="Responded" color="info" size="small" />;
      case 'evaluated':
        return <Chip label="Evaluated" color="success" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  if (isLoading || !queries) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/queries')}
          sx={{ mb: 2 }}
        >
          Back to Queries
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Query List
        </Typography>
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Deadline</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredQueries
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((query) => (
              <TableRow key={query._id}>
                <TableCell>
                  <Typography variant="body1" fontWeight="medium">
                    {query.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {query.question?.substring(0, 60)}
                    {query.question?.length > 60 ? '...' : ''}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {query.teacherName || 'Unknown'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {query.deadline ? new Date(query.deadline).toLocaleDateString() : 'No deadline'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {getStatusChip(query.status)}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View">
                    <IconButton 
                      size="small" 
                      onClick={() => navigate(`/queries/${query._id}`)}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  {(user?.role === 'teacher' && query.status === 'draft') && (
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small"
                        onClick={() => navigate(`/queries/${query._id}/edit`)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {(user?.role === 'admin' || (user?.role === 'teacher' && query.status === 'draft')) && (
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
          count={filteredQueries.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Container>
  );
};

export default QueryList; 