import React from "react";
import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";

import { globalStyles, colors } from "../../styles";

export default function VerifySuccessScreen() {
  const { status, message } = useLocalSearchParams<{
    status: "success" | "error";
    message: string;
  }>();

  const handleContinueToLogin = () => {
    router.replace("/(auth)/login");
  };

  const handleBackToAuth = () => {
    router.replace("/(auth)/");
  };

  return (
    <View style={globalStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={globalStyles.authContainer}>
        <View style={styles.content}>
          {status === "success" ? (
            <>
              {/* Success State */}
              <View style={styles.iconContainer}>
                <Text style={styles.successIcon}>✅</Text>
              </View>

              <Text
                style={[
                  globalStyles.heading1,
                  { color: colors.success, textAlign: "center" },
                ]}
              >
                Email Verified!
              </Text>

              <Text
                style={[
                  globalStyles.bodyText,
                  { textAlign: "center", marginBottom: 40 },
                ]}
              >
                {message ||
                  "Your email has been successfully verified. You can now login to your OPOSSUM account."}
              </Text>

              <TouchableOpacity
                style={globalStyles.authButton}
                onPress={handleContinueToLogin}
                activeOpacity={0.8}
              >
                <Text style={globalStyles.authButtonText}>
                  Continue to Login
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Error State */}
              <View style={styles.iconContainer}>
                <Text style={styles.errorIcon}>❌</Text>
              </View>

              <Text
                style={[
                  globalStyles.heading1,
                  { color: colors.danger, textAlign: "center" },
                ]}
              >
                Verification Failed
              </Text>

              <Text
                style={[
                  globalStyles.bodyText,
                  { textAlign: "center", marginBottom: 40 },
                ]}
              >
                {message ||
                  "We couldn't verify your email. The link may have expired or already been used."}
              </Text>

              <TouchableOpacity
                style={globalStyles.authButton}
                onPress={handleBackToAuth}
                activeOpacity={0.8}
              >
                <Text style={globalStyles.authButtonText}>
                  Back to Registration
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 30,
    alignItems: "center" as const,
  },
  successIcon: {
    fontSize: 80,
  },
  errorIcon: {
    fontSize: 80,
  },
});
