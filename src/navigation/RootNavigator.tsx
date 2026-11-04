import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DiscoverScreen from '../screens/DiscoverScreen';
import MyThemesScreen from '../screens/MyThemesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ThemeDetailsScreen from '../screens/ThemeDetailsScreen';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function TabsScreen() {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Discover" component={DiscoverScreen} />
      <Tabs.Screen name="My Themes" component={MyThemesScreen} />
      <Tabs.Screen name="Settings" component={SettingsScreen} />
    </Tabs.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={TabsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ThemeDetails" component={ThemeDetailsScreen} options={{ title: 'Theme' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
