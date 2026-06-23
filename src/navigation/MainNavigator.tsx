import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';
import HomeScreen from '../screens/main/HomeScreen';
import HomeworkScreen from '../screens/main/HomeworkScreen';
import CompositionScreen from '../screens/main/CompositionScreen';
import SocraticScreen from '../screens/main/SocraticScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import { Colors, BorderRadius } from '../theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TABS: { name: keyof MainTabParamList; label: string; icon: string; activeIcon: string }[] = [
  { name: 'Home', label: 'Ana Sayfa', icon: '🏠', activeIcon: '🏠' },
  { name: 'Homework', label: 'Ödev', icon: '📚', activeIcon: '📚' },
  { name: 'Composition', label: 'Kompozisyon', icon: '✏️', activeIcon: '✏️' },
  { name: 'Socratic', label: 'Sokratik', icon: '🧠', activeIcon: '🧠' },
  { name: 'Profile', label: 'Profil', icon: '👤', activeIcon: '👤' },
];

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={[tabStyles.tabItem, focused && tabStyles.tabItemActive]}>
      <Text style={tabStyles.tabIcon}>{icon}</Text>
      <Text style={[tabStyles.tabLabel, focused && tabStyles.tabLabelActive]}>{label}</Text>
      {focused && <View style={tabStyles.activeDot} />}
    </View>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.cardBorder,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarShowLabel: false,
      }}
    >
      {TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={
            tab.name === 'Home' ? HomeScreen :
            tab.name === 'Homework' ? HomeworkScreen :
            tab.name === 'Composition' ? CompositionScreen :
            tab.name === 'Socratic' ? SocraticScreen :
            ProfileScreen
          }
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon={tab.icon} label={tab.label} focused={focused} />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    minWidth: 56,
    position: 'relative',
  },
  tabItemActive: {
    backgroundColor: Colors.primary + '20',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  tabLabelActive: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  activeDot: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
});
