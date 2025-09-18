import { useState, useEffect } from 'react';

// Color psychology themes
const themes = {
  calming: {
    primary: '#4A90A4',
    secondary: '#7FB3D3',
    accent: '#A8E6CF',
    background: '#F0F8FF',
    surface: '#FFFFFF',
    text: '#2C3E50',
    textSecondary: '#5D737E',
  },
  energizing: {
    primary: '#FF6B6B',
    secondary: '#FFE66D',
    accent: '#FF8E53',
    background: '#FFF8F0',
    surface: '#FFFFFF',
    text: '#2C3E50',
    textSecondary: '#7D4F4F',
  },
  balanced: {
    primary: '#6C5CE7',
    secondary: '#A29BFE',
    accent: '#84FAB0',
    background: '#F8F9FF',
    surface: '#FFFFFF',
    text: '#2C3E50',
    textSecondary: '#6C5CE7',
  },
  custom: {
    primary: '#4A90A4',
    secondary: '#7FB3D3',
    accent: '#A8E6CF',
    background: '#F0F8FF',
    surface: '#FFFFFF',
    text: '#2C3E50',
    textSecondary: '#5D737E',
  },
};

export const useColorTheme = (userPreference = 'calming') => {
  const [colorTheme, setColorTheme] = useState(userPreference);
  const [theme, setTheme] = useState(themes[userPreference]);

  useEffect(() => {
    // Apply theme to CSS custom properties
    const root = document.documentElement;
    const currentTheme = themes[colorTheme];
    
    Object.entries(currentTheme).forEach(([key, value]) => {
      root.style.setProperty(`--${key}-color`, value);
    });

    setTheme(currentTheme);
  }, [colorTheme]);

  const changeTheme = (newTheme) => {
    if (themes[newTheme]) {
      setColorTheme(newTheme);
      localStorage.setItem('colorTheme', newTheme);
    }
  };

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('colorTheme');
    if (savedTheme && themes[savedTheme]) {
      setColorTheme(savedTheme);
    }
  }, []);

  return {
    theme,
    colorTheme,
    changeTheme,
    themes,
  };
};