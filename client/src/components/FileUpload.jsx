import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  LinearProgress, 
  IconButton, 
  Stack,
  Grid,
  Button 
} from '@mui/material';
import { CloudUpload, Delete, AttachFile } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

const FileUpload = ({ 
  accept = {
    'application/pdf': ['.pdf'],
    'image/*': ['.jpeg', '.jpg', '.png'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  },
  maxSize = 5242880, // 5MB
  maxFiles = 5,
  onUpload,
  onDelete,
  files = [],
}) => {
  const [uploading, setUploading] = useState(false);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      handleUpload(acceptedFiles);
    },
    accept,
    maxSize,
    maxFiles,
  });
  
  const handleUpload = async (acceptedFiles) => {
    setUploading(true);
    
    // Simulate upload time
    const updatedFiles = acceptedFiles.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      id: Date.now() + Math.random(),
      uploading: true
    }));
    
    if (onUpload) {
      onUpload(updatedFiles);
    }
    
    // Simulate progress
    const interval = setInterval(() => {
      updatedFiles.forEach(file => {
        file.progress += 10;
        if (file.progress >= 100) {
          file.uploading = false;
          clearInterval(interval);
          setUploading(false);
        }
      });
      
      if (onUpload) {
        onUpload([...updatedFiles]);
      }
    }, 300);
  };
  
  const handleDelete = (fileId) => {
    if (onDelete) {
      onDelete(fileId);
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? 'action.hover' : '#fafafa',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : '#ccc',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
          mb: 2
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="body1" gutterBottom>
          {isDragActive
            ? 'Drop files here...'
            : 'Drag and drop files here, or click to select files'
          }
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Supported formats: PDF, DOC, DOCX, JPG, PNG (Max {maxSize / 1048576}MB)
        </Typography>
      </Paper>
      
      {files.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Uploaded Files:
          </Typography>
          
          <Stack spacing={1}>
            {files.map((file) => (
              <Paper key={file.id} sx={{ p: 1 }}>
                <Grid container alignItems="center" spacing={1}>
                  <Grid item>
                    <AttachFile color="primary" />
                  </Grid>
                  
                  <Grid item xs>
                    <Typography variant="body2" noWrap>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(file.size)}
                    </Typography>
                    
                    {file.uploading && (
                      <LinearProgress 
                        variant="determinate" 
                        value={file.progress} 
                        sx={{ mt: 1, height: 4, borderRadius: 2 }} 
                      />
                    )}
                  </Grid>
                  
                  <Grid item>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(file.id)}
                      disabled={file.uploading}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload; 