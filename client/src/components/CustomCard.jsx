import React from 'react';
import { Card, CardContent, CardHeader, CardActions, Typography, IconButton, Avatar, Divider, useTheme } from '@mui/material';
import { MoreVert } from '@mui/icons-material';

/**
 * Enhanced Card component with modern styling and animations
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {React.ReactNode} props.icon - Card icon
 * @param {string} props.subtitle - Card subtitle
 * @param {React.ReactNode} props.action - Custom action component
 * @param {React.ReactNode} props.children - Card content
 * @param {React.ReactNode} props.footer - Card footer content
 * @param {Object} props.sx - Additional styling
 * @param {string} props.bgColor - Background color for card header
 * @param {string} props.elevation - Card elevation (0-24)
 * @param {boolean} props.hover - Enable hover effect
 * @returns {JSX.Element} Custom card component
 */
const CustomCard = ({
  title,
  icon,
  subtitle,
  action,
  children,
  footer,
  sx = {},
  bgColor,
  elevation = 1,
  hover = true
}) => {
  const theme = useTheme();
  
  return (
    <Card
      elevation={elevation}
      sx={{
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s, box-shadow 0.3s',
        position: 'relative',
        overflow: 'visible',
        ...(hover && {
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: theme.shadows[elevation + 2],
          },
        }),
        ...sx
      }}
    >
      {title && (
        <CardHeader
          avatar={
            icon ? (
              typeof icon === 'string' ? (
                <Avatar
                  sx={{
                    bgcolor: bgColor || 'primary.main',
                  }}
                >
                  {icon}
                </Avatar>
              ) : (
                icon
              )
            ) : null
          }
          title={
            <Typography variant="h6" fontWeight="bold">
              {title}
            </Typography>
          }
          subheader={subtitle}
          action={
            action || (
              <IconButton aria-label="settings">
                <MoreVert />
              </IconButton>
            )
          }
          sx={{
            bgcolor: bgColor ? `${bgColor}10` : undefined,
            '& .MuiCardHeader-title': {
              fontWeight: 'bold',
            },
          }}
        />
      )}
      
      <CardContent sx={{ flexGrow: 1, pt: title ? undefined : 2 }}>
        {children}
      </CardContent>
      
      {footer && (
        <>
          <Divider />
          <CardActions sx={{ p: 2 }}>
            {footer}
          </CardActions>
        </>
      )}
    </Card>
  );
};

export default CustomCard; 