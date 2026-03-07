// Shop Screen - Buy cosmetics with in-game currency

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCosmetics } from "../hooks/useCosmetics";
import {
  Cosmetic,
  CosmeticType,
  COSMETICS_CATALOG,
  getCosmeticsByType,
  getRarityColor,
} from "../models/cosmetics";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { useTheme } from "../context/ThemeContext";
import { getThemePalette } from "../models/themes";

type ShopCategory = "all" | CosmeticType;

export const ShopScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory>("all");
  const {
    currency,
    isOwned,
    isEquipped,
    buyCosmetic,
    equipCosmetic,
    refresh,
  } = useCosmetics();
  const { theme } = useTheme();
  
  // Create dynamic styles based on current theme
  const dynamicStyles = React.useMemo(() => createStyles(theme), [theme]);

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  const getFilteredCosmetics = (): Cosmetic[] => {
    if (selectedCategory === "all") {
      return COSMETICS_CATALOG;
    }
    return getCosmeticsByType(selectedCategory);
  };

  const handleBuy = async (cosmetic: Cosmetic) => {
    if (isOwned(cosmetic.id)) {
      Alert.alert("Already Owned", "You already own this cosmetic!");
      return;
    }

    if (currency < cosmetic.cost) {
      Alert.alert(
        "Insufficient Funds",
        `You need ${cosmetic.cost} VC to buy this item.`
      );
      return;
    }

    Alert.alert(
      "Confirm Purchase",
      `Buy ${cosmetic.name} for ${cosmetic.cost} VC?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Buy",
          onPress: async () => {
            const success = await buyCosmetic(cosmetic.id);
            if (success) {
              Alert.alert("Success!", `You now own ${cosmetic.name}!`);
              refresh();
            } else {
              Alert.alert("Error", "Failed to purchase cosmetic");
            }
          },
        },
      ]
    );
  };

  const handleEquip = async (cosmetic: Cosmetic) => {
    const success = await equipCosmetic(cosmetic.id);
    if (success) {
      Alert.alert("Equipped!", `${cosmetic.name} is now equipped.`);
      refresh();
    }
  };

  const categories: { key: ShopCategory; label: string; icon: string }[] = [
    { key: "all", label: "All", icon: "grid" },
    { key: "jersey", label: "Jerseys", icon: "shirt" },
    { key: "hat", label: "Hats", icon: "baseball" },
    { key: "accessory", label: "Accessories", icon: "bandage" },
    { key: "shoe", label: "Shoes", icon: "footsteps" },
    { key: "ball", label: "Balls", icon: "basketball" },
    { key: "theme", label: "Themes", icon: "color-palette" },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Currency Display */}
      <View style={styles.currencyHeader}>
        <View style={[dynamicStyles.currencyBadge, { borderColor: theme.primary }]}>
          <Ionicons name="diamond" size={20} color={theme.primary} />
          <Text style={[styles.currencyText, { color: theme.primary }]}>
            {currency.toLocaleString()} VC
          </Text>
        </View>
      </View>

      {/* Avatar Preview */}
      <View style={styles.avatarPreviewSection}>
        <Text style={styles.avatarPreviewTitle}>Preview</Text>
        <View style={styles.avatarPreviewContainer}>
          <PlayerAvatar size={120} showBall={true} />
        </View>
      </View>

      {/* Category Selector */}
      <View style={styles.categorySelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                dynamicStyles.categoryButton,
                selectedCategory === cat.key && [dynamicStyles.categoryButtonActive, { backgroundColor: theme.primary, borderColor: theme.primary }],
              ]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <Ionicons
                name={cat.icon as any}
                size={18}
                color={selectedCategory === cat.key ? "#0A0A0A" : "#8E8E93"}
              />
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === cat.key && styles.categoryButtonTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Cosmetics Grid */}
      <View style={styles.cosmeticsGrid}>
        {getFilteredCosmetics().map((cosmetic) => {
          const owned = isOwned(cosmetic.id);
          const equipped = isEquipped(cosmetic.id);
          const rarityColor = getRarityColor(cosmetic.rarity);

          return (
            <View
              key={cosmetic.id}
              style={[
                dynamicStyles.cosmeticCard,
                equipped && [dynamicStyles.cosmeticCardEquipped, { borderColor: theme.primary }],
              ]}
            >
              {/* Rarity Border */}
              <View
                style={[
                  dynamicStyles.rarityBorder,
                  { borderColor: rarityColor },
                ]}
              />

              {/* Cosmetic Preview */}
              {cosmetic.type === "jersey" || cosmetic.type === "accessory" || cosmetic.type === "shoe" || cosmetic.type === "ball" || cosmetic.type === "hat" ? (
                <View style={styles.avatarPreviewInCard}>
                  <PlayerAvatar size={80} showBall={cosmetic.type === "ball"} />
                </View>
              ) : cosmetic.type === "theme" ? (
                // Theme preview with full palette
                <View
                  style={[
                    dynamicStyles.themePreview,
                    { backgroundColor: getThemePalette(cosmetic.id).card },
                  ]}
                >
                  {/* Primary color bar */}
                  <View
                    style={[
                      dynamicStyles.themePreviewBar,
                      {
                        backgroundColor: getThemePalette(cosmetic.id).primary,
                        height: "30%",
                      },
                    ]}
                  />
                  {/* Secondary color bar */}
                  {getThemePalette(cosmetic.id).secondary && (
                    <View
                      style={[
                        dynamicStyles.themePreviewBar,
                        {
                          backgroundColor: getThemePalette(cosmetic.id).secondary,
                          height: "20%",
                        },
                      ]}
                    />
                  )}
                  {/* Accent dots */}
                  <View style={dynamicStyles.themePreviewDots}>
                    <View
                      style={[
                        dynamicStyles.themePreviewDot,
                        { backgroundColor: getThemePalette(cosmetic.id).primary },
                      ]}
                    />
                    <View
                      style={[
                        dynamicStyles.themePreviewDot,
                        { backgroundColor: getThemePalette(cosmetic.id).accent },
                      ]}
                    />
                    {getThemePalette(cosmetic.id).secondary && (
                      <View
                        style={[
                          dynamicStyles.themePreviewDot,
                          { backgroundColor: getThemePalette(cosmetic.id).secondary },
                        ]}
                      />
                    )}
                  </View>
                </View>
              ) : (
                <View
                  style={[
                    styles.cosmeticPreview,
                    { backgroundColor: cosmetic.color || "#1A1A1A" },
                  ]}
                >
                  {cosmetic.secondaryColor && (
                    <View
                      style={[
                        styles.cosmeticPreviewSecondary,
                        { backgroundColor: cosmetic.secondaryColor },
                      ]}
                    />
                  )}
                  {cosmetic.icon && (
                    <Ionicons
                      name={cosmetic.icon as any}
                      size={32}
                      color="#FFFFFF"
                    />
                  )}
                </View>
              )}

              {/* Cosmetic Info */}
              <View style={styles.cosmeticInfo}>
                <Text style={styles.cosmeticName}>{cosmetic.name}</Text>
                <View style={styles.cosmeticMeta}>
                  <View
                    style={[
                      styles.rarityBadge,
                      { backgroundColor: rarityColor + "20" },
                    ]}
                  >
                    <Text
                      style={[styles.rarityText, { color: rarityColor }]}
                    >
                      {cosmetic.rarity.toUpperCase()}
                    </Text>
                  </View>
                </View>
                {cosmetic.description && (
                  <Text style={styles.cosmeticDescription}>
                    {cosmetic.description}
                  </Text>
                )}
              </View>

              {/* Action Button */}
              {owned ? (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    equipped && styles.actionButtonEquipped,
                    { backgroundColor: equipped ? theme.primary + "20" : theme.primary },
                  ]}
                  onPress={() => handleEquip(cosmetic)}
                >
                  <Text
                    style={[
                      styles.actionButtonText,
                      equipped && styles.actionButtonTextEquipped,
                      { color: equipped ? theme.primary : "#0A0A0A" },
                    ]}
                  >
                    {equipped ? "Equipped" : "Equip"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    currency < cosmetic.cost && styles.actionButtonDisabled,
                    { backgroundColor: currency < cosmetic.cost ? "#2A2A2A" : theme.primary },
                  ]}
                  onPress={() => handleBuy(cosmetic)}
                  disabled={currency < cosmetic.cost}
                >
                  <Ionicons
                    name="diamond"
                    size={16}
                    color={currency < cosmetic.cost ? "#8E8E93" : "#0A0A0A"}
                  />
                  <Text
                    style={[
                      styles.actionButtonText,
                      currency < cosmetic.cost && styles.actionButtonTextDisabled,
                      { color: currency < cosmetic.cost ? "#8E8E93" : "#0A0A0A" },
                    ]}
                  >
                    {cosmetic.cost} VC
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  currencyHeader: {
    padding: 20,
    paddingTop: 20,
    alignItems: "flex-end",
  },
  currencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  currencyText: {
    fontSize: 18,
    fontWeight: "700",
  },
  avatarPreviewSection: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    margin: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  avatarPreviewTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  avatarPreviewContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPreviewInCard: {
    width: "100%",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
  },
  themePreview: {
    width: "100%",
    height: 120,
    borderRadius: 0,
    overflow: "hidden",
  },
  themePreviewBar: {
    width: "100%",
  },
  themePreviewDots: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  themePreviewDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  categorySelector: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    marginRight: 10,
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: "#39FF14",
    borderColor: theme.primary,
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
  },
  categoryButtonTextActive: {
    color: "#0A0A0A",
  },
  cosmeticsGrid: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  cosmeticCard: {
    width: "47%",
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    position: "relative",
  },
  cosmeticCardEquipped: {
    borderColor: theme.primary,
    borderWidth: 2,
  },
  rarityBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    zIndex: 1,
  },
  cosmeticPreview: {
    width: "100%",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cosmeticPreviewSecondary: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "50%",
    height: "100%",
  },
  cosmeticInfo: {
    padding: 12,
  },
  cosmeticName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  cosmeticMeta: {
    marginBottom: 6,
  },
  rarityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cosmeticDescription: {
    fontSize: 11,
    color: "#8E8E93",
    lineHeight: 14,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#39FF14",
    paddingVertical: 12,
    gap: 6,
  },
  actionButtonEquipped: {
    backgroundColor: "#2A2A2A",
  },
  actionButtonDisabled: {
    backgroundColor: "#2A2A2A",
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0A0A0A",
  },
  actionButtonTextEquipped: {
    color: "#39FF14",
  },
  actionButtonTextDisabled: {
    color: "#8E8E93",
  },
});

const styles = createStyles({ primary: "#39FF14" }); // Will be updated dynamically
