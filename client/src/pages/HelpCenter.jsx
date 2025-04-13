import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Divider,
  Grid,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Card,
  CardContent,
  Link
} from '@mui/material';
import {
  ExpandMore,
  Help,
  School,
  Assignment,
  QuestionAnswer,
  Quiz,
  Email,
  Send,
  Article,
  Phone,
  Link as LinkIcon
} from '@mui/icons-material';

const FAQItem = ({ question, answer }) => (
  <Accordion>
    <AccordionSummary
      expandIcon={<ExpandMore />}
      aria-controls="panel-content"
      id="panel-header"
    >
      <Typography variant="subtitle1">{question}</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Typography variant="body2" color="text.secondary">
        {answer}
      </Typography>
    </AccordionDetails>
  </Accordion>
);

const HelpCenter = () => {
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactFormData({ ...contactFormData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send the form data to a backend
    console.log('Form submitted:', contactFormData);
    setFormSubmitted(true);
    setContactFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  // FAQ data
  const faqs = [
    {
      question: 'How do I submit a clinical case?',
      answer: 'Navigate to the Cases section, click "New Case", fill out the required information in the form, and click Submit. You can save drafts before submitting if needed.'
    },
    {
      question: 'How are clinical cases evaluated?',
      answer: 'After submission, your teacher will review your case and provide feedback along with a score. You may be asked to make revisions if needed.'
    },
    {
      question: 'What should I do if I need to revise my submitted case?',
      answer: 'If your teacher requests revisions, you\'ll receive a notification. Go to the case details page where you can edit and resubmit the case.'
    },
    {
      question: 'How do I take a test?',
      answer: 'Navigate to the Tests section, find the assigned test, and click "Take Test". Make sure to complete it before the deadline.'
    },
    {
      question: 'What happens if I lose connection during a test?',
      answer: 'The system automatically saves your answers as you proceed. If you lose connection, you can log back in and continue where you left off, as long as the test time hasn\'t expired.'
    },
    {
      question: 'How can I see my previous test results?',
      answer: 'Go to the Tests section and click on any completed test to view your results and correct answers.'
    },
  ];

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Help Center
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Find answers to common questions or contact support for assistance
        </Typography>

        <Grid container spacing={4}>
          {/* Quick Links */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Links
                </Typography>
                <List dense>
                  <ListItem button>
                    <ListItemIcon>
                      <School />
                    </ListItemIcon>
                    <ListItemText primary="Student Guide" />
                  </ListItem>
                  <ListItem button>
                    <ListItemIcon>
                      <Assignment />
                    </ListItemIcon>
                    <ListItemText primary="Case Documentation Guide" />
                  </ListItem>
                  <ListItem button>
                    <ListItemIcon>
                      <QuestionAnswer />
                    </ListItemIcon>
                    <ListItemText primary="Query Response Guide" />
                  </ListItem>
                  <ListItem button>
                    <ListItemIcon>
                      <Quiz />
                    </ListItemIcon>
                    <ListItemText primary="Test Taking Tips" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Video Tutorials */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Video Tutorials
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        bgcolor: 'background.default',
                        height: 120,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <Help sx={{ fontSize: 40, color: 'text.secondary' }} />
                    </Box>
                    <Typography variant="subtitle2">Getting Started Guide</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        bgcolor: 'background.default',
                        height: 120,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <Assignment sx={{ fontSize: 40, color: 'text.secondary' }} />
                    </Box>
                    <Typography variant="subtitle2">How to Submit Clinical Cases</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* FAQs */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Frequently Asked Questions
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </Box>

        {/* Contact Form */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Contact Support
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {formSubmitted && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Your message has been sent! We'll get back to you soon.
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="name"
                  label="Your Name"
                  fullWidth
                  required
                  value={contactFormData.name}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="email"
                  label="Email Address"
                  fullWidth
                  required
                  type="email"
                  value={contactFormData.email}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="subject"
                  label="Subject"
                  fullWidth
                  required
                  value={contactFormData.subject}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="message"
                  label="Message"
                  fullWidth
                  required
                  multiline
                  rows={4}
                  value={contactFormData.message}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Send />}
                >
                  Send Message
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>

        {/* Email Support */}
        <Box sx={{ mt: 4, display: 'flex', alignItems: 'center' }}>
          <Email sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="body1">
            Alternatively, you can reach our support team directly at{' '}
            <strong>support@pharmclinical.com</strong>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default HelpCenter; 