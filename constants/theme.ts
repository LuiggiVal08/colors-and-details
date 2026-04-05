import { MD3LightTheme as DefaultTheme } from 'react-native-paper';
const theme = {
  colors: {
    primary: '',
    secondary: '',
    background: '',
    text: '',
  },
};

const themePaper = {
  ...DefaultTheme,
  // Specify custom property
  myOwnProperty: true,
  // Specify custom property in nested object
  colors: {
    ...DefaultTheme.colors,
    myOwnColor: '#BADA55',
  },
};
export { theme, themePaper };
