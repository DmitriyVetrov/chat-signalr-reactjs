import red from '@mui/material/colors/red';
import { createTheme } from '@mui/material/styles';

const arcBlue = '#0B72B9';
const arcOrange = '#FFBA60';
const arcGrey = '#868686';
const arcDarkGrey = '#666';

export default createTheme({
  components: {
    MuiToolbar: {
      styleOverrides: {
        dense: {
          height: 40,
          minHeight: 40,
          margin: 0,
          padding: 0,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: '1px 1px 7px 1px rgb(128 128 128 / 20%)',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 16,
          paddingBottom: 16,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: 18,
          fontWeight: 600,
          color: '#333333',
        },
      },
    },
    MuiDialogContentText: {
      styleOverrides: {
        root: {
          fontSize: 18,
          fontWeight: 400,
          color: '#666666',
        },
      },
    },
  },
  palette: {
    common: {},
    primary: {
      main: '#2491ff',
    },
    secondary: {
      main: '#6C63FF',
    },
    error: {
      main: '#FF2222',
    },
  },
  typography: {
    h2: {
      fontFamily: 'Raleway',
      fontWeight: 700,
      fontSize: '2.5rem',
      color: arcBlue,
      lineHeight: 1.5,
    },
    h3: {
      fontFamily: 'Pacifico',
      fontSize: '2.5rem',
      color: arcBlue,
    },
    h4: {
      //fontFamily: "Raleway",
      fontSize: '1.75rem',
      color: arcBlue,
      fontWeight: 700,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      // fontFamily: "Raleway",
      color: arcDarkGrey,
    },
    subtitle1: {
      fontSize: '1.25rem',
      fontWeight: 300,
      color: arcGrey,
    },
    subtitle2: {
      color: 'white',
      fontWeight: 300,
      fontSize: '1.25rem',
    },
    body1: {
      fontSize: '1.25rem',
      color: arcGrey,
      fontWeight: 300,
    },
    caption: {
      fontSize: '1rem',
      fontWeight: 300,
      color: arcGrey,
    },
    // fontSize: 13,
    // fontFamily: '"Roboto", Helvetica Neue, Helvetica, Arial, sans-serif',
  },
});

// overrides: {
//   MuiInputLabel: {
//     root: {
//       color: arcBlue,
//       fontSize: "1rem",
//     },
//   },
//   MuiInput: {
//     root: {
//       color: arcGrey,
//       fontWeight: 300,
//     },
//     underline: {
//       "&:before": {
//         borderBottom: `2px solid ${arcBlue}`,
//       },
//       "&:hover:not($disabled):not($focused):not($error):before": {
//         borderBottom: `2px solid ${arcBlue}`,
//       },
//     },
//   },
// },
