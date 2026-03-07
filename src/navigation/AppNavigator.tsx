// Main navigation setup

import React from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { HomeScreen } from "../screens/HomeScreen";
import { StatsScreen } from "../screens/StatsScreen";
import { WorkoutsScreen } from "../screens/WorkoutsScreen";
import { WorkoutDetailScreen } from "../screens/WorkoutDetailScreen";
import { LogWorkoutScreen } from "../screens/LogWorkoutScreen";
import { AttributesScreen } from "../screens/AttributesScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { StreakDebugScreen } from "../screens/StreakDebugScreen";
// ShopScreen disabled - cosmetics feature temporarily disabled
import { RootStackParamList, HomeStackParamList, WorkoutStackParamList } from "./types";
import { useTheme } from "../context/ThemeContext";

const Tab = createBottomTabNavigator<RootStackParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const WorkoutStack = createStackNavigator<WorkoutStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: "Home" }}
      />
      <HomeStack.Screen
        name="LogWorkout"
        component={LogWorkoutScreen}
        options={{ title: "Log Workout" }}
      />
    </HomeStack.Navigator>
  );
}

function WorkoutStackNavigator() {
  return (
    <WorkoutStack.Navigator>
      <WorkoutStack.Screen
        name="WorkoutList"
        component={WorkoutsScreen}
        options={{ title: "NBA Workouts" }}
      />
      <WorkoutStack.Screen
        name="WorkoutDetail"
        component={WorkoutDetailScreen}
        options={{ title: "Workout Details" }}
      />
    </WorkoutStack.Navigator>
  );
}

export function AppNavigator() {
  const { theme } = useTheme();

  const navigationTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: theme.primary,
      background: theme.background,
      card: theme.card,
      text: theme.text,
      border: theme.border,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Log") {
              iconName = focused ? "create" : "create-outline";
            } else if (route.name === "Stats") {
              iconName = focused ? "bar-chart" : "bar-chart-outline";
            } else if (route.name === "Workouts") {
              iconName = focused ? "basketball" : "basketball-outline";
            } else if (route.name === "Attributes") {
              iconName = focused ? "stats-chart" : "stats-chart-outline";
            } else if (route.name === "Profile") {
              iconName = focused ? "person" : "person-outline";
            } else {
              iconName = "help-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.tabBarActive,
          tabBarInactiveTintColor: theme.tabBarInactive,
          tabBarStyle: {
            backgroundColor: theme.background,
            borderTopWidth: 1,
            borderTopColor: theme.primary + "20",
            elevation: 0,
            height: 65,
            paddingBottom: 10,
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 0.5,
          },
          headerStyle: {
            backgroundColor: theme.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: theme.primary + "20",
          },
          headerTintColor: theme.text,
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 20,
            letterSpacing: -0.3,
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeStackNavigator}
          options={{
            tabBarLabel: "Home",
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="Log"
          component={LogWorkoutScreen}
          options={{
            tabBarLabel: "Log",
            headerTitle: "Log Workout",
          }}
        />
        <Tab.Screen
          name="Stats"
          component={StatsScreen}
          options={{
            tabBarLabel: "Stats",
            headerTitle: "Statistics",
          }}
        />
        <Tab.Screen
          name="Workouts"
          component={WorkoutStackNavigator}
          options={{
            tabBarLabel: "Workouts",
            headerShown: false,
          }}
        />
        <Tab.Screen
          name="Attributes"
          component={AttributesScreen}
          options={{
            tabBarLabel: "Attributes",
            headerTitle: "Player Attributes",
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: "Profile",
            headerTitle: "Player Profile",
          }}
        />
        <Tab.Screen
          name="StreakDebug"
          component={StreakDebugScreen}
          options={{
            tabBarLabel: "Debug",
            headerTitle: "Streak Debug",
            tabBarButton: () => null, // Hide from tab bar
          }}
        />
        {/* Shop tab disabled - cosmetics feature temporarily disabled */}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
