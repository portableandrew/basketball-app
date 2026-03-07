// Player Avatar Component - Improved visual representation with layered cosmetics

import React, { useMemo } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCosmetics } from "../hooks/useCosmetics";
import { getAvatarVisualStyle, getHatShape } from "../utils/avatarVisuals";

interface PlayerAvatarProps {
  size?: number;
  showBall?: boolean;
  borderColor?: string;
  style?: ViewStyle;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  size = 64,
  showBall = false,
  borderColor,
  style,
}) => {
  const { getEquippedCosmetic, cosmeticsState } = useCosmetics();

  // Component will automatically re-render when cosmeticsState changes
  // because getEquippedCosmetic reads from cosmeticsState

  // Get all equipped cosmetics
  const equippedJersey = getEquippedCosmetic("jersey");
  const equippedAccessory = getEquippedCosmetic("accessory");
  const equippedShoe = getEquippedCosmetic("shoe");
  const equippedBall = getEquippedCosmetic("ball");
  const equippedHat = getEquippedCosmetic("hat");

  // Get visual styles for each cosmetic
  const jerseyStyle = useMemo(() => getAvatarVisualStyle(equippedJersey), [equippedJersey]);
  const accessoryStyle = useMemo(() => getAvatarVisualStyle(equippedAccessory), [equippedAccessory]);
  const shoeStyle = useMemo(() => getAvatarVisualStyle(equippedShoe), [equippedShoe]);
  const ballStyle = useMemo(() => getAvatarVisualStyle(equippedBall), [equippedBall]);
  const hatStyle = useMemo(() => getAvatarVisualStyle(equippedHat), [equippedHat]);

  // Determine accessory types
  const hasHeadband = equippedAccessory && 
    equippedAccessory.id.includes("headband") && 
    equippedAccessory.id !== "accessory_headband_none";
  
  const hasHat = equippedHat && equippedHat.id !== null && equippedHat.id !== undefined;
  const hatShape = hasHat ? getHatShape(equippedHat) : "none";
  
  const hasArmSleeve = equippedAccessory && 
    equippedAccessory.id.includes("arm_sleeve");
  
  const hasShootingSleeve = equippedAccessory && 
    equippedAccessory.id.includes("shooting_sleeve");

  // Calculate sizes based on avatar size
  const headSize = size * 0.35;
  const bodyWidth = size * 0.65;
  const bodyHeight = size * 0.5;
  const shoeWidth = size * 0.55;
  const shoeHeight = size * 0.12;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Main Avatar Container */}
      <View
        style={[
          styles.avatarContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: borderColor || jerseyStyle.primaryColor,
            borderWidth: borderColor ? 3 : 0,
          },
        ]}
      >
        {/* Background Circle (jersey color) */}
        <View
          style={[
            styles.backgroundCircle,
            {
              width: size * 0.9,
              height: size * 0.9,
              borderRadius: (size * 0.9) / 2,
              backgroundColor: jerseyStyle.primaryColor,
            },
          ]}
        >
          {/* Jersey Pattern - Stripes */}
          {jerseyStyle.pattern === "stripes" && jerseyStyle.secondaryColor && (
            <View style={styles.jerseyStripes}>
              <View
                style={[
                  styles.stripe,
                  {
                    width: bodyWidth * 0.15,
                    backgroundColor: jerseyStyle.secondaryColor,
                  },
                ]}
              />
              <View
                style={[
                  styles.stripe,
                  {
                    width: bodyWidth * 0.15,
                    backgroundColor: jerseyStyle.secondaryColor,
                    left: bodyWidth * 0.3,
                  },
                ]}
              />
            </View>
          )}

          {/* Jersey Number/Icon */}
          <View style={[styles.jerseyNumber, { bottom: bodyHeight * 0.3 }]}>
            <Ionicons
              name="basketball"
              size={size * 0.2}
              color={jerseyStyle.primaryColor === "#FFFFFF" || jerseyStyle.primaryColor === "#39FF14" ? "#000000" : "#FFFFFF"}
              style={{ opacity: 0.4 }}
            />
          </View>
        </View>

        {/* Hat Layer (topmost) */}
        {hasHat && hatShape !== "none" && (
          <View
            style={[
              styles.hatContainer,
              {
                top: size * 0.02,
                width: size * 0.75,
                height: size * 0.25,
              },
            ]}
          >
            {hatShape === "cap" && (
              <View
                style={[
                  styles.cap,
                  {
                    width: size * 0.75,
                    height: size * 0.2,
                    backgroundColor: hatStyle.primaryColor,
                    borderRadius: size * 0.1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.capBrim,
                    {
                      width: size * 0.85,
                      height: size * 0.05,
                      backgroundColor: hatStyle.primaryColor,
                      opacity: 0.8,
                      bottom: -size * 0.02,
                    },
                  ]}
                />
              </View>
            )}
            {hatShape === "headband" && (
              <View
                style={[
                  styles.headband,
                  {
                    width: size * 0.8,
                    height: size * 0.12,
                    top: size * 0.08,
                    backgroundColor: hatStyle.primaryColor,
                  },
                ]}
              />
            )}
            {hatShape === "beanie" && (
              <View
                style={[
                  styles.beanie,
                  {
                    width: size * 0.7,
                    height: size * 0.25,
                    backgroundColor: hatStyle.primaryColor,
                    borderTopLeftRadius: size * 0.15,
                    borderTopRightRadius: size * 0.15,
                  },
                ]}
              />
            )}
          </View>
        )}

        {/* Headband Layer (if no hat) */}
        {hasHeadband && !hasHat && (
          <View
            style={[
              styles.headband,
              {
                width: size * 0.8,
                height: size * 0.12,
                top: size * 0.1,
                backgroundColor: accessoryStyle.primaryColor,
              },
            ]}
          />
        )}

        {/* Head/Face */}
        <View
          style={[
            styles.head,
            {
              width: headSize,
              height: headSize,
              borderRadius: headSize / 2,
              top: size * 0.12,
            },
          ]}
        >
          {/* Eyes */}
          <View
            style={[
              styles.eye,
              {
                left: headSize * 0.25,
                top: headSize * 0.3,
                width: headSize * 0.12,
                height: headSize * 0.12,
              },
            ]}
          />
          <View
            style={[
              styles.eye,
              {
                right: headSize * 0.25,
                top: headSize * 0.3,
                width: headSize * 0.12,
                height: headSize * 0.12,
              },
            ]}
          />
          {/* Mouth */}
          <View
            style={[
              styles.mouth,
              {
                width: headSize * 0.3,
                height: headSize * 0.08,
                bottom: headSize * 0.2,
                left: headSize * 0.35,
                borderRadius: headSize * 0.04,
              },
            ]}
          />
        </View>

        {/* Body/Jersey */}
        <View
          style={[
            styles.body,
            {
              width: bodyWidth,
              height: bodyHeight,
              bottom: size * 0.08,
              backgroundColor: jerseyStyle.primaryColor,
            },
          ]}
        >
          {/* Jersey accent (for two-tone jerseys) */}
          {jerseyStyle.secondaryColor && jerseyStyle.pattern === "gradient" && (
            <View
              style={[
                styles.jerseyAccent,
                {
                  width: bodyWidth * 0.4,
                  height: bodyHeight * 0.6,
                  backgroundColor: jerseyStyle.secondaryColor,
                  opacity: 0.3,
                  right: 0,
                },
              ]}
            />
          )}
        </View>

        {/* Arm Sleeve (Left) */}
        {hasArmSleeve && (
          <View
            style={[
              styles.armSleeve,
              {
                left: size * 0.05,
                width: size * 0.12,
                height: size * 0.35,
                top: size * 0.22,
                backgroundColor: accessoryStyle.primaryColor,
              },
            ]}
          />
        )}

        {/* Shooting Sleeve (Right) */}
        {hasShootingSleeve && (
          <View
            style={[
              styles.armSleeve,
              {
                right: size * 0.05,
                width: size * 0.12,
                height: size * 0.35,
                top: size * 0.22,
                backgroundColor: accessoryStyle.primaryColor,
              },
            ]}
          />
        )}

        {/* Shorts (optional, below jersey) */}
        <View
          style={[
            styles.shorts,
            {
              width: bodyWidth * 0.9,
              height: size * 0.15,
              bottom: size * 0.02,
              backgroundColor: "#1A1A1A",
            },
          ]}
        />

        {/* Shoes */}
        <View
          style={[
            styles.shoes,
            {
              width: shoeWidth,
              height: shoeHeight,
              bottom: -size * 0.03,
              backgroundColor: shoeStyle.primaryColor,
            },
          ]}
        >
          {/* Shoe accent (for two-tone shoes) */}
          {shoeStyle.secondaryColor && (
            <View
              style={[
                styles.shoeAccent,
                {
                  width: shoeWidth * 0.3,
                  height: shoeHeight,
                  backgroundColor: shoeStyle.secondaryColor,
                  right: 0,
                },
              ]}
            />
          )}
        </View>
      </View>

      {/* Ball Preview (optional, positioned next to avatar) */}
      {showBall && (
        <View
          style={[
            styles.ballPreview,
            {
              width: size * 0.45,
              height: size * 0.45,
              borderRadius: (size * 0.45) / 2,
              backgroundColor: ballStyle.primaryColor,
              right: -size * 0.08,
              bottom: size * 0.15,
            },
          ]}
        >
          {/* Ball pattern lines */}
          <View
            style={[
              styles.ballLine,
              {
                width: size * 0.35,
                height: 2,
                backgroundColor: ballStyle.primaryColor === "#FF8C00" ? "#000000" : "#FFFFFF",
                opacity: 0.3,
                top: size * 0.15,
              },
            ]}
          />
          <View
            style={[
              styles.ballLine,
              {
                width: size * 0.35,
                height: 2,
                backgroundColor: ballStyle.primaryColor === "#FF8C00" ? "#000000" : "#FFFFFF",
                opacity: 0.3,
                top: size * 0.25,
                transform: [{ rotate: "90deg" }],
              },
            ]}
          />
          {/* Ball icon overlay */}
          <Ionicons
            name="basketball"
            size={size * 0.2}
            color={ballStyle.primaryColor === "#FF8C00" ? "#000000" : "#FFFFFF"}
            style={{ opacity: 0.5 }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: {
    position: "relative",
    overflow: "visible",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  backgroundCircle: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  jerseyStripes: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  stripe: {
    position: "absolute",
    height: "100%",
  },
  jerseyNumber: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  hatContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "flex-start",
    zIndex: 20,
  },
  cap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 21,
  },
  capBrim: {
    position: "absolute",
    borderRadius: 2,
    zIndex: 20,
  },
  beanie: {
    position: "absolute",
    zIndex: 21,
  },
  headband: {
    position: "absolute",
    borderRadius: 6,
    zIndex: 15,
  },
  head: {
    position: "absolute",
    backgroundColor: "#FFDBAC",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  eye: {
    position: "absolute",
    borderRadius: 50,
    backgroundColor: "#000000",
  },
  mouth: {
    position: "absolute",
    backgroundColor: "#000000",
  },
  body: {
    position: "absolute",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  jerseyAccent: {
    position: "absolute",
    borderRadius: 8,
  },
  armSleeve: {
    position: "absolute",
    borderRadius: 6,
    zIndex: 6,
  },
  shorts: {
    position: "absolute",
    borderRadius: 4,
    zIndex: 4,
  },
  shoes: {
    position: "absolute",
    borderRadius: 6,
    zIndex: 3,
  },
  shoeAccent: {
    position: "absolute",
    borderRadius: 6,
  },
  ballPreview: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#2A2A2A",
    zIndex: 25,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  ballLine: {
    position: "absolute",
  },
});
