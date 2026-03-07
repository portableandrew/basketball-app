import React from "react";
import { StatusBar } from "expo-status-bar";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { ThemeProvider } from "./src/context/ThemeContext";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { RankUpListener } from "./src/components/RankUpListener";
import "react-native-gesture-handler";

export default function App() {
  // Cosmetics disabled - no storage wipe on startup
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <RankUpListener>
          <AppNavigator />
          <StatusBar style="auto" />
        </RankUpListener>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
