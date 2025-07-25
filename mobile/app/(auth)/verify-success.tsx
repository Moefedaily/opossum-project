import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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
    <ScrollView style={globalStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Back Button */}
      <TouchableOpacity
        style={globalStyles.backButton}
        onPress={handleBackToAuth}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color={colors.deepBurgundy} />
      </TouchableOpacity>

      <View style={globalStyles.authContainer}>
        <View style={styles.successContainer}>
          {status === "success" ? (
            <>
              {/* Success State */}
              <View style={styles.iconContainer}>
                <Ionicons
                  name="checkmark-circle"
                  size={80}
                  color={colors.success}
                />
              </View>

              <Text
                style={[globalStyles.authHeader, { color: colors.success }]}
              >
                Email Verified!
              </Text>

              <Text
                style={[
                  globalStyles.bodyText,
                  { textAlign: "center", marginBottom: 20 },
                ]}
              >
                {message ||
                  "Your email has been successfully verified. You can now login to your OPOSSUM account."}
              </Text>

              <Text
                style={[
                  globalStyles.secondaryText,
                  {
                    textAlign: "center",
                    marginBottom: 40,
                    lineHeight: 22,
                  },
                ]}
              >
                Welcome to OPOSSUM! You're all set to start using the app.
              </Text>

              {/* Action Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleContinueToLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Continue to Login</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Error State */}
              <View style={styles.iconContainer}>
                <Ionicons name="close-circle" size={80} color={colors.danger} />
              </View>

              <Text style={[globalStyles.authHeader, { color: colors.danger }]}>
                Verification Failed
              </Text>

              <Text
                style={[
                  globalStyles.bodyText,
                  { textAlign: "center", marginBottom: 20 },
                ]}
              >
                {message ||
                  "We couldn't verify your email. The link may have expired or already been used."}
              </Text>

              <Text
                style={[
                  globalStyles.secondaryText,
                  {
                    textAlign: "center",
                    marginBottom: 40,
                    lineHeight: 22,
                  },
                ]}
              >
                Please try registering again or contact support if the problem
                persists.
              </Text>

              {/* Action Buttons */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleBackToAuth}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>
                  Back to Registration
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleContinueToLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>
                  Try Login Instead
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  successContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 30,
    alignItems: "center" as const,
  },
  primaryButton: {
    backgroundColor: colors.richOxblood,
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: "100%",
    alignItems: "center" as const,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.richOxblood,
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: "100%",
    alignItems: "center" as const,
  },
  secondaryButtonText: {
    color: colors.richOxblood,
    fontSize: 16,
    fontWeight: "600" as const,
  },
});
