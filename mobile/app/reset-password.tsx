import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { authService } from "../services/auth";
import { colors } from "../styles";

export default function ResetPasswordPage() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      setIsTokenValid(true);
      tryOpenMobileApp(token as string);
    } else {
      setIsTokenValid(false);
    }
  }, [token]);

  const tryOpenMobileApp = (resetToken: string) => {
    const deepLink = `opossum://reset-password?token=${resetToken}`;
    if (typeof window !== "undefined" && window.document) {
      const link = document.createElement("a");
      link.href = deepLink;
      link.click();
    }
    setTimeout(() => {
      console.log("Mobile app did not open, user will see web page");
    }, 2000);
  };

  const handleResetPassword = async () => {
    if (!formData.newPassword || !formData.confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill in both password fields",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      Toast.show({
        type: "error",
        text1: "Password Too Short",
        text2: "Password must be at least 6 characters long",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Passwords Don't Match",
        text2: "Please make sure both passwords are the same",
      });
      return;
    }

    try {
      setIsLoading(true);
      const message = await authService.resetPassword(
        token as string,
        formData.newPassword,
        formData.confirmPassword
      );

      setResetSuccess(true);
      Toast.show({
        type: "success",
        text1: "Password Reset Successfully! ✅",
        text2: message,
        visibilityTime: 5000,
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      Toast.show({
        type: "error",
        text1: "Reset Failed",
        text2: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Loading state
  if (isTokenValid === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.richOxblood} />
        <Text style={styles.subtitle}>Loading reset form...</Text>
      </View>
    );
  }

  if (isTokenValid === false) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorTitle}>Invalid Reset Link</Text>
          <Text style={styles.instruction}>
            This password reset link is invalid or has expired. Please request a
            new one.
          </Text>
        </View>
      </View>
    );
  }

  if (resetSuccess) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.successTitle}>Password Reset Successfully!</Text>
          <Text style={styles.instruction}>
            Your password has been successfully reset. You can now return to the
            OPOSSUM app to login with your new password.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Toast />
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your new password below.</Text>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="NEW PASSWORD"
            placeholderTextColor={colors.text.secondary}
            secureTextEntry
            style={styles.input}
            value={formData.newPassword}
            onChangeText={(text) => updateField("newPassword", text)}
            onFocus={() => setFocusedField("newPassword")}
            onBlur={() => setFocusedField(null)}
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="CONFIRM PASSWORD"
            placeholderTextColor={colors.text.secondary}
            secureTextEntry
            style={styles.input}
            value={formData.confirmPassword}
            onChangeText={(text) => updateField("confirmPassword", text)}
            onFocus={() => setFocusedField("confirmPassword")}
            onBlur={() => setFocusedField(null)}
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity
          style={[styles.resetButton, isLoading && styles.resetButtonLoading]}
          onPress={handleResetPassword}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.resetButtonText}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
    maxWidth: 400,
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.deepBurgundy,
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    width: "100%",
    backgroundColor: colors.white,
  },
  input: {
    fontSize: 16,
    color: colors.text.primary,
    width: "100%",
  },
  resetButton: {
    backgroundColor: colors.richOxblood,
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  resetButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  resetButtonLoading: {
    backgroundColor: colors.warmTaupe,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.success,
    marginBottom: 16,
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.danger,
    marginBottom: 16,
    textAlign: "center",
  },
  instruction: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
    fontStyle: "italic",
  },
});
