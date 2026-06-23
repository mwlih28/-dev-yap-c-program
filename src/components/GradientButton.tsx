import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Typography } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  gradient?: [string, string];
  style?: ViewStyle;
  small?: boolean;
};

export default function GradientButton({
  label,
  onPress,
  loading,
  disabled,
  gradient = Colors.gradientPrimary,
  style,
  small,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.wrapper, style, (disabled || loading) && styles.disabled]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, small && styles.small]}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} size="small" />
        ) : (
          <Text style={[styles.label, small && styles.smallLabel]}>{label}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.5,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  label: {
    ...Typography.titleLarge,
    color: Colors.white,
    fontWeight: '700',
  },
  smallLabel: {
    fontSize: 13,
  },
});
