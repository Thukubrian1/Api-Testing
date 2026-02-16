// src/store/slices/themeSlice.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { applyTheme, defaultTheme, loadTheme } from '../../config/theme.config';

interface ThemeColors {
  primary: string;
  secondary: string;
}

interface ThemeState {
  colors: ThemeColors;
  setColors: (colors: Partial<ThemeColors>) => void;
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
  resetTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      colors: loadTheme(),

      setColors: (newColors) => {
        const updatedColors = { ...get().colors, ...newColors };
        set({ colors: updatedColors });
        applyTheme(updatedColors);
      },

      setPrimaryColor: (color) => {
        const updatedColors = { ...get().colors, primary: color };
        set({ colors: updatedColors });
        applyTheme(updatedColors);
      },

      setSecondaryColor: (color) => {
        const updatedColors = { ...get().colors, secondary: color };
        set({ colors: updatedColors });
        applyTheme(updatedColors);
      },

      resetTheme: () => {
        set({ colors: defaultTheme });
        applyTheme(defaultTheme);
      },
    }),
    {
      name: 'app-theme',
    }
  )
);