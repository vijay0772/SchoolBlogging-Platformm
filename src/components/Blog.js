import React from 'react';
import { CssBaseline, Grid, Container } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Header from './Header';
import MainFeaturedPost from './MainFeaturedPost';
import FeaturedPost from './FeaturedPost';
//
import Footer from './Footer';


export const sections = [
  { title: 'Academic Resources', url: '#' },
  { title: 'Career Services', url: '#' },
  { title: 'Campus', url: '#' },
  { title: 'Culture', url: '#' },
  { title: 'Local Community Resources', url: '#' },
  { title: 'Sports', url: '#' },
  { title: 'Health', url: '#' },
  { title: 'Wellness', url: '#' },
  { title: 'Technology', url: '#' },
  { title: 'Travel', url: '#' },
  { title: 'Alumni', url: '#' },
];

const mainFeaturedPost = {
  title: 'School Blogging Platform',
  description: "A platform for students to make a difference in the world.",
  image: 'https://picsum.photos/seed/school/1600/700',
  imageText: 'main image description',
  linkText: 'Continue reading…',
};

const featuredPosts = [
  {
    title: 'Education Post',
    date: 'Nov 12',
    description: 'This is a wider card with supporting text below as a natural lead-in to additional content.',
    image: 'https://picsum.photos/seed/education/800/600',
    imageLabel: 'Image Text',
  },
  {
    title: 'Sports Post',
    date: 'Nov 11',
    description: 'This is a wider card with supporting text below as a natural lead-in to additional content.',
    image: 'https://picsum.photos/seed/sports/800/600',
    imageLabel: 'Image Text',
  },
  {
    title: 'Hollywood Post',
    date: 'Nov 11',
    description: 'This is a wider card with supporting text below as a natural lead-in to additional content.',
    image: 'https://picsum.photos/seed/hollywood/800/600',
    imageLabel: 'Image Text',
  },
  {
    title: 'Love Post',
    date: 'Nov 11',
    description: 'This is a wider card with supporting text below as a natural lead-in to additional content.',
    image: 'https://picsum.photos/seed/love/800/600',
    imageLabel: 'Image Text',
  },
];

// Posts content imports removed; not used in this layout

// Sidebar config removed (unused)
// Enhanced theme for typography
const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: '#f44336',
    },
    background: {
      default: '#fff',
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    allVariants: {
      fontWeight: 'bold', // Applying bold across all text variants for consistency
      color: '#333', // Ensuring good contrast and readability
    },
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      color: '#3f51b5', // More vibrant color for the title
      textShadow: '2px 2px 4px rgba(0,0,0,0.6)', // Text shadow for depth
      animation: '$fadeIn 2s ease-out forwards', // Fade-in animation for engagement
    },
    button: {
      textTransform: 'none', // Maintain text case for buttons
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        body {
          background-size: cover; // Ensures the background image covers the entire body
        }
      `,
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background for Paper components
          padding: '20px',
          borderRadius: '10px', // Rounded corners for a modern look
        },
      },
    },
  },
});
export default function Blog() {
  // const matches = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Header title="School Bloging Platform" sections={sections} />
        <main>
          <MainFeaturedPost post={mainFeaturedPost} />
          <Grid container spacing={4}>
            {featuredPosts.map((post) => (
              <FeaturedPost key={post.title} post={post} />
            ))}
          </Grid>
          <Grid container spacing={5} sx={{ mt: 3 }}>
          </Grid>
        </main>
      </Container>
      <Footer
        title="School Blog Footer"
        description="Empowering students with knowledge and a sense of community."
      />
    </ThemeProvider>
  );
}
