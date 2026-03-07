// Avatar visual mapping - maps cosmetic IDs to visual styles and shapes

import { Cosmetic } from "../models/cosmetics";

export interface AvatarVisualStyle {
  primaryColor: string;
  secondaryColor?: string;
  pattern?: "solid" | "stripes" | "gradient" | "checker";
  shape?: "cap" | "headband" | "beanie" | "bucket";
}

// Map cosmetic IDs to visual styles for avatar rendering
export function getAvatarVisualStyle(cosmetic: Cosmetic | null | undefined): AvatarVisualStyle {
  if (!cosmetic) {
    return { primaryColor: "#1A1A1A", pattern: "solid" };
  }

  const id = cosmetic.id;

  // Jersey styles
  if (id.startsWith("jersey_")) {
    if (id === "jersey_classic_white") {
      return { primaryColor: "#FFFFFF", pattern: "solid" };
    }
    if (id === "jersey_neon_green") {
      return { primaryColor: "#39FF14", pattern: "solid" };
    }
    if (id === "jersey_lakers_purple") {
      return {
        primaryColor: "#552583",
        secondaryColor: "#FDB927",
        pattern: "stripes",
      };
    }
    if (id === "jersey_miami_night") {
      return {
        primaryColor: "#98002E",
        secondaryColor: "#F9A01B",
        pattern: "gradient",
      };
    }
    if (id === "jersey_blackout") {
      return { primaryColor: "#000000", pattern: "solid" };
    }
  }

  // Hat styles
  if (id.startsWith("hat_")) {
    if (id === "hat_cap") {
      return { primaryColor: "#1A1A1A", shape: "cap", pattern: "solid" };
    }
    if (id === "hat_headband") {
      return { primaryColor: "#FFFFFF", shape: "headband", pattern: "solid" };
    }
    if (id === "hat_beanie") {
      return { primaryColor: "#2A2A2A", shape: "beanie", pattern: "solid" };
    }
  }

  // Accessory styles
  if (id.startsWith("accessory_")) {
    if (id.includes("headband")) {
      if (id === "accessory_headband_none") {
        return { primaryColor: "transparent", pattern: "solid" };
      }
      return {
        primaryColor: cosmetic.color || "#FFFFFF",
        pattern: "solid",
      };
    }
    if (id.includes("arm_sleeve") || id.includes("shooting_sleeve")) {
      return { primaryColor: cosmetic.color || "#000000", pattern: "solid" };
    }
  }

  // Shoe styles
  if (id.startsWith("shoe_")) {
    if (id === "shoe_classic_white") {
      return { primaryColor: "#FFFFFF", pattern: "solid" };
    }
    if (id === "shoe_black_red") {
      return {
        primaryColor: "#000000",
        secondaryColor: "#FF0000",
        pattern: "stripes",
      };
    }
    if (id === "shoe_neon_green") {
      return { primaryColor: "#39FF14", pattern: "solid" };
    }
    if (id === "shoe_gold") {
      return { primaryColor: "#FFD700", pattern: "solid" };
    }
    if (id === "shoe_legendary") {
      return {
        primaryColor: "#9D00FF",
        secondaryColor: "#FFD700",
        pattern: "gradient",
      };
    }
  }

  // Ball styles
  if (id.startsWith("ball_")) {
    if (id === "ball_classic_orange") {
      return { primaryColor: "#FF8C00", pattern: "solid" };
    }
    if (id === "ball_midnight_black") {
      return { primaryColor: "#000000", pattern: "solid" };
    }
    if (id === "ball_glitch_neon") {
      return {
        primaryColor: "#39FF14",
        secondaryColor: "#FF00FF",
        pattern: "gradient",
      };
    }
    if (id === "ball_gold") {
      return { primaryColor: "#FFD700", pattern: "solid" };
    }
  }

  // Default fallback
  return {
    primaryColor: cosmetic.color || "#1A1A1A",
    secondaryColor: cosmetic.secondaryColor,
    pattern: "solid",
  };
}

// Get hat shape type
export function getHatShape(cosmetic: Cosmetic | null | undefined): "cap" | "headband" | "beanie" | "none" {
  if (!cosmetic) return "none";
  const style = getAvatarVisualStyle(cosmetic);
  return (style.shape as any) || "none";
}
