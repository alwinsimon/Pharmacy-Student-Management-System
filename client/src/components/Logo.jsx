import React from 'react';
import { Box, Typography } from '@mui/material';
import { LocalPharmacy } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

/**
 * Logo component for the PharmClinical application
 * @param {Object} props - Component props
 * @param {string} props.variant - Logo variant ('full', 'icon', or 'text')
 * @param {number} props.size - Size of the logo
 * @param {string} props.color - Color of the logo (defaults to theme primary)
 * @returns {JSX.Element} The Logo component
 */
const Logo = ({ variant = 'full', size = 40, color }) => {
  const theme = useTheme();
  const logoColor = color || theme.palette.primary.main;

  if (variant === 'icon') {
    return (
      <LocalPharmacy sx={{ fontSize: size, color: logoColor }} />
    );
  }

  if (variant === 'text') {
    return (
      <Typography
        variant="h6"
        component="span"
        sx={{
          fontWeight: 700,
          fontSize: size * 0.4,
          color: logoColor,
          letterSpacing: '.1rem',
        }}
      >
        PharmClinical
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <LocalPharmacy sx={{ fontSize: size, color: logoColor, mr: 1 }} />
      <Typography
        variant="h6"
        component="span"
        sx={{
          fontWeight: 700,
          fontSize: size * 0.4,
          color: logoColor,
          letterSpacing: '.1rem',
        }}
      >
        PharmClinical
      </Typography>
    </Box>
  );
};

export default Logo; 