import { MD3DarkTheme, configureFonts } from 'react-native-paper';

export const Colors = {
  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  primaryDark: '#5B21B6',
  secondary: '#EC4899',
  secondaryLight: '#F9A8D4',
  background: '#0A0A1A',
  surface: '#13132A',
  card: '#1A1A35',
  cardBorder: '#2D2D55',
  text: '#F0F0FF',
  textSecondary: '#8888AA',
  textMuted: '#5555777',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  white: '#FFFFFF',
  black: '#000000',

  // Gradient pairs
  gradientPrimary: ['#7C3AED', '#4F46E5'] as [string, string],
  gradientSecondary: ['#EC4899', '#8B5CF6'] as [string, string],
  gradientDark: ['#13132A', '#0A0A1A'] as [string, string],
  gradientCard: ['#1E1E3D', '#13132A'] as [string, string],
  gradientSuccess: ['#10B981', '#059669'] as [string, string],
  gradientWarning: ['#F59E0B', '#D97706'] as [string, string],

  // Subject colors
  subjects: {
    matematik: '#3B82F6',
    fen: '#10B981',
    turkce: '#8B5CF6',
    tarih: '#F59E0B',
    ingilizce: '#EC4899',
    fizik: '#06B6D4',
    kimya: '#EF4444',
    biyoloji: '#84CC16',
    cografya: '#F97316',
    felsefe: '#A78BFA',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  displayLarge: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.5 },
  displayMedium: { fontSize: 28, fontWeight: '700' as const },
  headlineLarge: { fontSize: 24, fontWeight: '700' as const },
  headlineMedium: { fontSize: 20, fontWeight: '600' as const },
  headlineSmall: { fontSize: 18, fontWeight: '600' as const },
  titleLarge: { fontSize: 16, fontWeight: '600' as const },
  titleMedium: { fontSize: 14, fontWeight: '600' as const },
  bodyLarge: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 12, fontWeight: '400' as const, lineHeight: 18 },
  labelLarge: { fontSize: 14, fontWeight: '500' as const },
  labelMedium: { fontSize: 12, fontWeight: '500' as const },
  labelSmall: { fontSize: 11, fontWeight: '500' as const },
};

export const PaperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.primary,
    primaryContainer: Colors.primaryDark,
    secondary: Colors.secondary,
    background: Colors.background,
    surface: Colors.surface,
    surfaceVariant: Colors.card,
    onSurface: Colors.text,
    onSurfaceVariant: Colors.textSecondary,
    error: Colors.error,
    outline: Colors.cardBorder,
    elevation: {
      level0: 'transparent',
      level1: Colors.surface,
      level2: Colors.card,
      level3: Colors.card,
      level4: Colors.card,
      level5: Colors.card,
    },
  },
};

export const Shadows = {
  small: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  large: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
};
