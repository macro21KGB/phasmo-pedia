import { createTheme, responsiveFontSizes } from '@mui/material';
import LazyDogTTF from './fonts/lazy_dog.ttf';

let theme = createTheme({
  typography: {
    fontFamily: 'LazyDog, "Courier New", monospace',
    fontSize: 20,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'LazyDog';
          src: local('LazyDog'), url(${LazyDogTTF}) format('truetype');
        }
        *,
        *:before,
        *:after {
          padding: 0;
          margin: 0;
          box-sizing: border-box;
        }
        html, body, #root {
          height: 100%;
        }
      `,
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
