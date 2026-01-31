import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/theme';
import { SettingsProvider } from '@/context/SettingsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <SettingsProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: true,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: 'absolute',
            },
            default: {},
          }),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Concrete',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="square.stack.3d.up.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="flooring"
          options={{
            title: 'Flooring',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="square.grid.2x2.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="paint"
          options={{
            title: 'Paint',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="paintbrush.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="projects"
          options={{
            title: 'Saved Estimates',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="folder.fill" color={color} />,
          }}
        />
      </Tabs>
    </SettingsProvider>
  );
}
