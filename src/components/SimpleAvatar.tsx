// Simple Avatar Component - No cosmetics dependency
// TEMPORARY replacement for PlayerAvatar while cosmetics are disabled

import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SimpleAvatarProps {
  size?: number;
  showBall?: boolean;
  borderColor?: string;
  style?: ViewStyle;
}

export const SimpleAvatar: React.FC<SimpleAvatarProps> = ({
  size = 64,
  showBall = false,
  borderColor = "#39FF14",
  style,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: borderColor,
        },
        style,
      ]}
    >
      <Ionicons name="person" size={size * 0.6} color={borderColor} />
      {showBall && (
        <View style={[styles.ball, { right: -size * 0.15, bottom: -size * 0.1 }]}>
          <Ionicons name="basketball" size={size * 0.25} color="#FF6B35" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
  },
  ball: {
    position: "absolute",
  },
});
