import React from 'react';
import { Box, Container, Typography, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

/**
 * PageLayout component to provide consistent layout structure for pages
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content
 * @param {String} props.title - Page title
 * @param {Array} props.breadcrumbs - Array of breadcrumb objects { label, path }
 * @param {React.ReactNode} props.actions - Action buttons for the page header
 * @param {String} props.maxWidth - Container max width (xs, sm, md, lg, xl)
 * @param {Object} props.sx - Additional style properties
 * @returns {JSX.Element} PageLayout component
 */
const PageLayout = ({ 
  children, 
  title, 
  breadcrumbs = [], 
  actions, 
  maxWidth = 'lg',
  sx = {}
}) => {
  const location = useLocation();
  
  // Generate path segments for breadcrumbs if not provided
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  const defaultBreadcrumbs = [
    { label: 'Home', path: '/', icon: <HomeIcon fontSize="small" sx={{ mr: 0.5 }} /> },
    ...pathSegments.map((segment, index) => {
      const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      return { label, path };
    })
  ];
  
  const displayBreadcrumbs = breadcrumbs.length > 0 ? breadcrumbs : defaultBreadcrumbs;
  
  return (
    <Box 
      sx={{ 
        py: 3,
        ...sx
      }}
    >
      <Container maxWidth={maxWidth}>
        {/* Breadcrumbs */}
        {displayBreadcrumbs.length > 0 && (
          <Breadcrumbs 
            aria-label="breadcrumb" 
            sx={{ 
              mb: 2,
              '& .MuiBreadcrumbs-ol': {
                flexWrap: { xs: 'wrap', sm: 'nowrap' }
              }
            }}
          >
            {displayBreadcrumbs.map((crumb, index) => {
              const isLast = index === displayBreadcrumbs.length - 1;
              return isLast ? (
                <Typography 
                  key={index} 
                  color="text.primary" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    fontWeight: 'medium'
                  }}
                >
                  {crumb.icon}
                  {crumb.label}
                </Typography>
              ) : (
                <Link
                  key={index}
                  component={RouterLink}
                  to={crumb.path}
                  color="inherit"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {crumb.icon}
                  {crumb.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        )}
        
        {/* Page Header */}
        {(title || actions) && (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
              mb: 3
            }}
          >
            {title && (
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 'bold',
                  mb: { xs: actions ? 2 : 0, sm: 0 }
                }}
              >
                {title}
              </Typography>
            )}
            
            {actions && (
              <Box>
                {actions}
              </Box>
            )}
          </Box>
        )}
        
        {/* Page Content */}
        {children}
      </Container>
    </Box>
  );
};

export default PageLayout; 