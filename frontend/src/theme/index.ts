import { lightThemeConfig } from './lightTheme';
import { darkThemeConfig } from './darkTheme';
import { createTheme } from '@mui/material/styles';

export { lightThemeConfig, darkThemeConfig };

export const getTheme = (isDark: boolean) => createTheme(isDark ? darkThemeConfig : lightThemeConfig);

