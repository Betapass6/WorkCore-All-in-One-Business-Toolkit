import { extendTheme } from '@chakra-ui/react'

// Chakra UI theme based on previous Material-UI theme
export const theme = extendTheme({
  colors: {
    // Mapping Material-UI palette colors to Chakra UI
    primary: {
      500: '#1976d2', // Main primary color
      // You can add other shades if needed, e.g., 100: '', 200: '', etc.
    },
    secondary: {
      500: '#dc004e', // Main secondary color
      // You can add other shades if needed
    },
    background: {
      // Chakra often uses 'bg' for background colors, but we can add a 'default' under a 'colors.background' object if preferred.
      // A common Chakra way is to define background in the `styles` object or use global tokens.
      // Let's add a background token under colors for simplicity if components use it.
      'bg-default': '#f5f5f5',
    },
    // If you were using the 'brand' colors you tried adding, define them here:
    brand: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
  },
  fonts: {
    // Mapping typography fontFamily to Chakra UI fonts
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    heading: 'Inter, sans-serif', // Assuming 'Inter' is the heading font based on context
  },
  components: {
    Button: { // Target Chakra UI Button component
      baseStyle: { // Apply styles globally to the button
        textTransform: 'none',
      },
      // You can add variants, sizes, etc. here to match your old theme's button styles
    },
    // Add other component style overrides here (e.g., AppBar, etc.) if they were causing errors
    // AppBar: { ... }, // Example for AppBar if you were using Material-UI AppBar
    // Global styles for typography might go in the 'styles' object if needed
  },
  styles: { // Global styles
    global: {
      'html, body': {
        bg: 'colors.background.bg-default', // Use the background color token
        color: 'gray.800', // Default text color (example)
      },
    },
  },
  // Add other Chakra UI theme properties like sizes, breakpoints, etc. here if they were defined in your old theme
  // breakpoints: { ... },
}); 