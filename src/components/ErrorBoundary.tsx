// Global Error Boundary Component - Catches render errors and shows fallback UI

import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log full error details to console
    console.error("=== ERROR BOUNDARY CAUGHT RENDER ERROR ===");
    console.error("Error:", error);
    console.error("Error Message:", error.message);
    console.error("Error Stack:", error.stack);
    console.error("Component Stack:", errorInfo.componentStack);
    console.error("===========================================");

    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <Ionicons name="alert-circle" size={48} color="#FF4444" />
            <Text style={styles.title}>Render Error</Text>
            <Text style={styles.subtitle}>Something went wrong</Text>
          </View>

          <ScrollView style={styles.errorContainer} showsVerticalScrollIndicator>
            <View style={styles.errorSection}>
              <Text style={styles.sectionTitle}>Error Message</Text>
              <Text style={styles.errorText}>
                {this.state.error?.message || "Unknown error"}
              </Text>
            </View>

            {this.state.error?.stack && (
              <View style={styles.errorSection}>
                <Text style={styles.sectionTitle}>Error Stack</Text>
                <Text style={styles.stackText}>{this.state.error.stack}</Text>
              </View>
            )}

            {this.state.errorInfo?.componentStack && (
              <View style={styles.errorSection}>
                <Text style={styles.sectionTitle}>Component Stack</Text>
                <Text style={styles.stackText}>
                  {this.state.errorInfo.componentStack}
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Please restart the app or contact support if this persists.
            </Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#39FF14",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  errorText: {
    fontSize: 16,
    color: "#FF4444",
    fontFamily: "monospace",
    marginBottom: 12,
  },
  stackText: {
    fontSize: 12,
    color: "#8E8E93",
    fontFamily: "monospace",
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
  },
  footerText: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },
});
