import { createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#24492a',
      light: '#3b6a42',
      dark: '#17341c',
      contrastText: '#fffdf6',
    },
    secondary: {
      main: '#bf6c17',
      light: '#db9347',
      dark: '#9d520a',
      contrastText: '#fffaf3',
    },
    background: {
      default: '#fbfaf6',
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: ['Rubik', 'Segoe UI', 'sans-serif'].join(','),
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 700,
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          minHeight: 48,
          borderRadius: 16,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 12px 35px rgba(35, 48, 40, 0.06)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
      },
    },
  },
})