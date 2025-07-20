import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { authService } from "../../services/auth";
import { globalStyles, colors } from "../../styles";

export default function VerifySuccessScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<
    "success" | "error" | null
  >(null);

  useEffect(() => {
    if (token) {
      handleVerification(token as string);
    } else {
      setVerificationStatus("error");
      setIsVerifying(false);
    }
  }, [token]);

  const handleVerification = async (verificationToken: string) => {
    try {
      const message = await authService.verifyEmail(verificationToken);
      setVerificationStatus("success");
      Toast.show({
        type: "success",
        text1: "Email Verified! ✅",
        text2: message,
        visibilityTime: 4000,
      });
    } catch (error: any) {
      console.error("Verification error:", error);
      setVerificationStatus("error");
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: error.message || "Please try again",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleContinueToLogin = () => {
    router.replace("/(auth)/login");
  };

  const handleBackToAuth = () => {
    router.replace("/(auth)/");
  };

  if (isVerifying) {
    return (
      <View style={globalStyles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
        />
        <View
          style={[globalStyles.authContainer, { justifyContent: "center" }]}
        >
          <ActivityIndicator size="large" color={colors.richOxblood} />
          <Text style={[globalStyles.authHeader, { marginTop: 20 }]}>
            Verifying your email...
          </Text>
          <Text style={globalStyles.caption}>Please wait a moment</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={globalStyles.authContainer}>
        <View style={styles.content}>
          {verificationStatus === "success" ? (
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
                Your email has been successfully verified. You can now login to
                your OPOSSUM account.
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
                We couldn't verify your email. The link may have expired or
                already been used.
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

import { StyleSheet } from "react-native";

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
