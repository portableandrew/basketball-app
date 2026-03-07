// Rank Up / Level Up Modal - Anime grind vibe animations

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RankDefinition } from "../models/ranks";

interface RankUpModalProps {
  visible: boolean;
  type: "rank" | "level";
  rank?: RankDefinition;
  level?: number;
  onClose: () => void;
}

export const RankUpModal: React.FC<RankUpModalProps> = ({
  visible,
  type,
  rank,
  level,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const textSlideAnim = useRef(new Animated.Value(50)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      glowAnim.setValue(0);
      textSlideAnim.setValue(50);
      particleAnim.setValue(0);

      // Sequence: glow pulse → icon scale → text slide → particles
      Animated.sequence([
        // Glow pulse
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Icon scale + fade in
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        // Text slide in
        Animated.timing(textSlideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        // Particles
        Animated.timing(particleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const glowRotation = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1.2, 1],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.8, 0.6],
  });

  const particleOpacity = particleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0],
  });

  const primaryColor = type === "rank" && rank ? rank.primaryColor : "#39FF14";
  const glowColor = type === "rank" && rank ? rank.glowColor : "#39FF1440";
  const iconName = type === "rank" && rank ? rank.iconName : "flash";
  const title = type === "rank" ? "RANK ASCENDED" : "LEVEL UP";
  const subtitle = type === "rank" && rank ? rank.name : `Level ${level}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Glow ring */}
        <Animated.View
          style={[
            styles.glowRing,
            {
              borderColor: primaryColor,
              opacity: glowOpacity,
              transform: [
                { scale: glowScale },
                { rotate: glowRotation },
              ],
            },
          ]}
        />

        {/* Main content */}
        <View style={styles.container}>
          {/* Particles effect */}
          <Animated.View
            style={[
              styles.particlesContainer,
              { opacity: particleOpacity },
            ]}
          >
            {[...Array(12)].map((_, i) => {
              const angle = (i * 360) / 12;
              const radius = 120;
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;

              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.particle,
                    {
                      backgroundColor: primaryColor,
                      transform: [
                        { translateX: x },
                        { translateY: y },
                        {
                          scale: particleAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 1.5],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              );
            })}
          </Animated.View>

          {/* Title */}
          <Animated.View
            style={[
              styles.titleContainer,
              {
                opacity: opacityAnim,
                transform: [{ translateY: textSlideAnim }],
              },
            ]}
          >
            <Text style={[styles.title, { color: primaryColor }]}>
              {title}
            </Text>
          </Animated.View>

          {/* Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: primaryColor + "20",
                  borderColor: primaryColor,
                },
              ]}
            >
              <Ionicons
                name={iconName as any}
                size={80}
                color={primaryColor}
              />
            </View>
          </Animated.View>

          {/* Subtitle */}
          <Animated.View
            style={[
              styles.subtitleContainer,
              {
                opacity: opacityAnim,
                transform: [{ translateY: textSlideAnim }],
              },
            ]}
          >
            <Text style={styles.subtitle}>{subtitle}</Text>
            {type === "level" && level && (
              <Text style={styles.levelNumber}>Level {level}</Text>
            )}
          </Animated.View>

          {/* Message */}
          <Animated.View
            style={[
              styles.messageContainer,
              {
                opacity: opacityAnim,
                transform: [{ translateY: textSlideAnim }],
              },
            ]}
          >
            <Text style={styles.message}>Your grind is paying off.</Text>
          </Animated.View>

          {/* Continue button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              { backgroundColor: primaryColor + "30", borderColor: primaryColor },
            ]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={[styles.continueText, { color: primaryColor }]}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  glowRing: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    borderWidth: 4,
    borderStyle: "dashed",
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: width * 0.85,
    padding: 40,
  },
  particlesContainer: {
    position: "absolute",
    width: 300,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  particle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  titleContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 4,
    textTransform: "uppercase",
    textShadowColor: "rgba(57, 255, 20, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    shadowColor: "#39FF14",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 20,
  },
  subtitleContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  subtitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 2,
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: "600",
    color: "#8E8E93",
    marginTop: 8,
  },
  messageContainer: {
    marginBottom: 40,
  },
  message: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    fontStyle: "italic",
  },
  continueButton: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 2,
    minWidth: 150,
  },
  continueText: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 1,
  },
});
