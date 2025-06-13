import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import "@chakra-ui/css-reset"
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme as chakraTheme } from './theme';

// Create a default Material UI theme with proper breakpoints
const muiTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiDialog: {
      defaultProps: {
        maxWidth: false, // Override default maxWidth behavior
        PaperProps: {
          elevation: 1, // Set a safe default elevation
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ChakraProvider theme={chakraTheme}>
        <App />
      </ChakraProvider>
    </ThemeProvider>
  </React.StrictMode>
)
