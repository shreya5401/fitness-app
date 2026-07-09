import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#FF5B93' },
    secondary: { main: '#D6336C' },
    background: {
      default: '#171717',
      paper: '#1f1f1f',
    },
    text: {
      primary: '#ffffff',
      secondary: '#FFB6C1',
    },
    divider: '#2a2a2a',
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1f1f1f',
          border: '1px solid #2a2a2a',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1f1f1f',
          border: '1px solid #2a2a2a',
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
        },
        containedPrimary: {
          color: '#171717',
          '&:hover': {
            backgroundColor: '#FF7BA8',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '& fieldset': {
            borderColor: '#2a2a2a',
          },
          '&:hover fieldset': {
            borderColor: '#FF5B93',
          },
        },
        input: {
          colorScheme: 'dark',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#a0a0a0',
          fontSize: '0.85rem',
        },
      },
    },
  },
});
