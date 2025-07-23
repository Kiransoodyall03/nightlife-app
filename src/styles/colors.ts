export const BaseColors = {
  // Brand colors - consistent across themes
  brand: {
    primary: '#007AFF',
    primaryDark: '#026495',
    primaryDarkest: '#131140',
  },
  
  // Status colors - consistent across themes
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#007AFF',
  
  // Accent colors
  emerald: '#10B981',
  amber: '#F59E0B',
  pink: '#E91E63',
  orange: '#F57C00',
  
  // Pure colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// Light Theme Configuration
export const LightTheme = {
  // Theme identifier
  isDark: false,
  
  // Primary colors
  primary: {
    main: BaseColors.brand.primary,
    dark: BaseColors.brand.primaryDark,
    darkest: BaseColors.brand.primaryDarkest,
    light: '#E3F2FD',
    contrast: BaseColors.white,
  },
  
  // Status colors
  status: {
    success: BaseColors.success,
    successLight: '#ECFDF5',
    successContrast: BaseColors.white,
    
    warning: BaseColors.warning,
    warningLight: '#FFF3E0',
    warningContrast: BaseColors.white,
    
    error: BaseColors.error,
    errorLight: '#FEF2F2',
    errorContrast: BaseColors.white,
    
    info: BaseColors.info,
    infoLight: '#E3F2FD',
    infoContrast: BaseColors.white,
  },
  
  // Text colors
  text: {
    primary: '#000000',
    secondary: '#1A1A1A',
    tertiary: '#1E293B',
    quaternary: '#475569',
    muted: '#64748B',
    light: '#9CA3AF',
    placeholder: '#999999',
    disabled: '#CBD5E0',
    inverse: BaseColors.white,
    accent: BaseColors.orange,
  },
  
  // Background colors
  background: {
    primary: BaseColors.white,
    secondary: '#F5F5F5',
    tertiary: '#F8F9FA',
    quaternary: '#F3F4F6',
    elevated: BaseColors.white,
    overlay: 'rgba(0, 0, 0, 0.5)',
    surface: '#F1F5F9',
    input: BaseColors.white,
    disabled: '#E2E8F0',
    
    // Status backgrounds
    success: '#ECFDF5',
    warning: '#FFF3E0',
    error: '#FEF2F2',
    info: '#E3F2FD',
  },
  
  // Border colors
  border: {
    primary: '#E0E0E0',
    secondary: '#EDEFF2',
    tertiary: '#DEE2E6',
    light: '#F1F5F9',
    medium: '#CBD5E0',
    dark: '#9CA3AF',
    accent: BaseColors.brand.primary,
    focus: BaseColors.brand.primary,
    
    // Status borders
    success: BaseColors.success,
    warning: BaseColors.warning,
    error: '#FF5252',
    danger: BaseColors.error,
  },
  
  // Shadow colors
  shadow: {
    primary: BaseColors.black,
    secondary: '#64748B',
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.15)',
    heavy: 'rgba(0, 0, 0, 0.25)',
    colored: BaseColors.pink,
  },
  
  // Component specific colors
  button: {
    primary: BaseColors.brand.primary,
    primaryText: BaseColors.white,
    primaryDisabled: '#CBD5E0',
    
    secondary: '#F8F9FA',
    secondaryText: '#1A1A1A',
    secondaryBorder: '#E0E0E0',
    
    success: BaseColors.success,
    successText: BaseColors.white,
    
    warning: BaseColors.warning,
    warningText: BaseColors.white,
    
    error: BaseColors.error,
    errorText: BaseColors.white,
    
    ghost: BaseColors.transparent,
    ghostText: BaseColors.brand.primary,
  },
  
  // Navigation colors
  navigation: {
    background: BaseColors.white,
    text: '#1A1A1A',
    textSecondary: '#64748B',
    border: '#E0E0E0',
    active: BaseColors.brand.primary,
    inactive: '#9CA3AF',
  },
  
  // Toggle/Switch colors
  toggle: {
    trackActive: BaseColors.success,
    trackInactive: '#CCCCCC',
    thumb: BaseColors.white,
    thumbActive: BaseColors.white,
  },
};

// Dark Theme Configuration
export const DarkTheme = {
  // Theme identifier
  isDark: true,
  
  // Primary colors
  primary: {
    main: '#1E90FF',
    dark: '#0066CC',
    darkest: '#004499',
    light: '#4DA6FF',
    contrast: BaseColors.white,
  },
  
  // Status colors - slightly adjusted for dark mode
  status: {
    success: '#22C55E',
    successLight: '#1F2937',
    successContrast: BaseColors.white,
    
    warning: '#FBB040',
    warningLight: '#1F2937',
    warningContrast: BaseColors.black,
    
    error: '#F87171',
    errorLight: '#1F1F1F',
    errorContrast: BaseColors.white,
    
    info: '#60A5FA',
    infoLight: '#1F2937',
    infoContrast: BaseColors.white,
  },
  
  // Text colors for dark mode
  text: {
    primary: BaseColors.white,
    secondary: '#E5E7EB',
    tertiary: '#D1D5DB',
    quaternary: '#9CA3AF',
    muted: '#6B7280',
    light: '#4B5563',
    placeholder: '#6B7280',
    disabled: '#374151',
    inverse: BaseColors.black,
    accent: '#FFA726',
  },
  
  // Background colors for dark mode
  background: {
    primary: '#181818',
    secondary: '#1F1F1F',
    tertiary: '#2D2D2D',
    quaternary: '#262626',
    elevated: '#2D2D2D',
    overlay: 'rgba(0, 0, 0, 0.8)',
    surface: '#1F2937',
    input: '#374151',
    disabled: '#4B5563',
    
    // Status backgrounds (darker versions)
    success: '#1F2937',
    warning: '#1F2937',
    error: '#1F1F1F',
    info: '#1F2937',
  },
  
  // Border colors for dark mode
  border: {
    primary: '#374151',
    secondary: '#4B5563',
    tertiary: '#6B7280',
    light: '#2D2D2D',
    medium: '#4B5563',
    dark: '#6B7280',
    accent: '#1E90FF',
    focus: '#1E90FF',
    
    // Status borders
    success: '#22C55E',
    warning: '#FBB040',
    error: '#F87171',
    danger: '#F87171',
  },
  
  // Shadow colors for dark mode
  shadow: {
    primary: BaseColors.black,
    secondary: '#000000',
    light: 'rgba(0, 0, 0, 0.3)',
    medium: 'rgba(0, 0, 0, 0.5)',
    heavy: 'rgba(0, 0, 0, 0.7)',
    colored: '#EC4899',
  },
  
  // Component specific colors for dark mode
  button: {
    primary: '#1E90FF',
    primaryText: BaseColors.white,
    primaryDisabled: '#4B5563',
    
    secondary: '#374151',
    secondaryText: BaseColors.white,
    secondaryBorder: '#6B7280',
    
    success: '#22C55E',
    successText: BaseColors.white,
    
    warning: '#FBB040',
    warningText: BaseColors.black,
    
    error: '#F87171',
    errorText: BaseColors.white,
    
    ghost: BaseColors.transparent,
    ghostText: '#1E90FF',
  },
  
  // Navigation colors for dark mode
  navigation: {
    background: '#1F1F1F',
    text: BaseColors.white,
    textSecondary: '#9CA3AF',
    border: '#374151',
    active: '#1E90FF',
    inactive: '#6B7280',
  },
  
  // Toggle/Switch colors for dark mode
  toggle: {
    trackActive: '#22C55E',
    trackInactive: '#4B5563',
    thumb: BaseColors.white,
    thumbActive: BaseColors.white,
  },
};

// Enhanced Color Helper Functions
export const ColorHelpers = {
  // Get colors based on theme
  getTheme: (isDark: boolean) => isDark ? DarkTheme : LightTheme,
  
  // Common component color combinations
  card: (isDark: boolean = false) => {
    const theme = isDark ? DarkTheme : LightTheme;
    return {
      background: theme.background.tertiary,
      border: theme.border.primary,
      shadow: theme.shadow.light,
      text: theme.text.primary,
    };
  },
  
  input: (isDark: boolean = false) => {
    const theme = isDark ? DarkTheme : LightTheme;
    return {
      background: theme.background.input,
      border: theme.border.primary,
      focusBorder: theme.border.focus,
      text: theme.text.primary,
      placeholder: theme.text.placeholder,
    };
  },
  
  button: (type: 'primary' | 'secondary' | 'success' | 'warning' | 'error' = 'primary', isDark: boolean = false) => {
    const theme = isDark ? DarkTheme : LightTheme;
    return {
      background: theme.button[type],
      text: theme.button[`${type}Text` as keyof typeof theme.button],
      border: 
        type === 'primary' ? 'transparent' :
        type === 'secondary' ? theme.button.secondaryBorder :
        'transparent',
    };
  },
  
  // Profile specific helpers
  profile: (isDark: boolean = false) => {
    const theme = isDark ? DarkTheme : LightTheme;
    return {
      background: theme.background.secondary,
      cardBackground: theme.background.tertiary,
      headerBackground: isDark ? '#0F172A' : LightTheme.primary.darkest,
      editButton: theme.primary.main,
      text: theme.text.primary,
      secondaryText: theme.text.muted,
    };
  },
};

// Theme context types
export interface ThemeColors {
  isDark: boolean;
  primary: typeof LightTheme.primary;
  status: typeof LightTheme.status;
  text: typeof LightTheme.text;
  background: typeof LightTheme.background;
  border: typeof LightTheme.border;
  shadow: typeof LightTheme.shadow;
  button: typeof LightTheme.button;
  navigation: typeof LightTheme.navigation;
  toggle: typeof LightTheme.toggle;
}

// Theme type
export type ThemeMode = 'light' | 'dark' | 'auto';

export default LightTheme;