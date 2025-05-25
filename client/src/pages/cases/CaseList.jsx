import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Container,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Stack,
  Card,
  CardContent,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Chip
} from '@mui/material';
import {
  Assignment,
  Delete,
  FilterList,
  Edit,
  Visibility,
  Add,
  Clear
} from '@mui/icons-material';


const CaseList = () => {
  const navigate = useNavigate();
  const { cases } = useSelector((state) => state.cases);
  const { user } = useSelector((state) => state.auth);

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCases, setFilteredCases] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    if (cases) {
      setFilteredCases(cases);
    }
  }, [cases]);

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
        return <Chip label="Draft" color="primary" />;
      case 'submitted':
        return <Chip label="Submitted" color="success" />;
      case 'in review':
        return <Chip label="In Review" color="warning" />;
      case 'revisions needed':
        return <Chip label="Revisions Needed" color="warning" />;
      case 'completed':
        return <Chip label="Completed" color="success" />;
      default:
        return <Chip label={status} color="default" />;
    }
  };

  return (
    <Container>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchTerm('')}>
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl>
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
              <MenuItem value="submitted">Submitted</MenuItem>
              <MenuItem value="in review">In Review</MenuItem>
              <MenuItem value="revisions needed">Revisions Needed</MenuItem>
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
      
      {filteredCases.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 4 }}>
          <CardContent>
            <Assignment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No cases found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try changing your search or filter criteria' 
                : user?.role === 'student' 
                  ? 'You haven\'t created any clinical cases yet' 
                  : 'There are no student submissions to review'}
            </Typography>
            
            {user?.role === 'student' && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/cases/new')}
              >
                New Case
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell>Case Title</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>
                  {user?.role === 'student' ? 'Reviewer' : 'Student'}
                </TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCases
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((caseItem) => (
                <TableRow key={caseItem._id}>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {caseItem.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {caseItem.patientInfo?.chiefComplaint || 'No chief complaint'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {caseItem.patientInfo?.age && caseItem.patientInfo?.gender ? (
                      <Typography variant="body2">
                        {`${caseItem.patientInfo.age}${caseItem.patientInfo.gender === 'male' ? 'M' : 'F'}`}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user?.role === 'student' 
                        ? caseItem.teacherName || 'Not assigned' 
                        : caseItem.studentName || 'Unknown'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(caseItem.updatedAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getStatusChip(caseItem.status)}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View">
                      <IconButton 
                        size="small" 
                        onClick={() => navigate(`/cases/${caseItem._id}`)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    {(user?.role === 'student' && caseItem.status === 'draft') && (
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small"
                          onClick={() => navigate(`/cases/${caseItem._id}/edit`)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    {(user?.role === 'admin' || (user?.role === 'student' && caseItem.status === 'draft')) && (
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
            count={filteredCases.length}
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

export default CaseList; 