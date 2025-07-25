import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  Alert,
  Switch,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { useAuth } from "../../../contexts/AuthContext";
import { userService } from "../../../services/user";
import { globalStyles, colors } from "../../../styles";

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // TODO: These will be implemented when we add notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);

  const handleChangePassword = () => {
    router.push("/(tabs)/profile/change-password");
  };

  const handlePrivacyPolicy = () => {
    // TODO: Navigate to privacy policy screen or open web view
    Toast.show({
      type: "info",
      text1: "Privacy Policy",
      text2: "Privacy policy will be available soon!",
    });
  };

  const handleTermsOfService = () => {
    // TODO: Navigate to terms of service screen or open web view
    Toast.show({
      type: "info",
      text1: "Terms of Service",
      text2: "Terms of service will be available soon!",
    });
  };

  const handleContactSupport = () => {
    // TODO: Open email client or support chat
    Toast.show({
      type: "info",
      text1: "Contact Support",
      text2: "Support contact will be available soon!",
    });
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            setIsLoggingOut(true);
            await logout();

            Toast.show({
              type: "success",
              text1: "Logged Out",
              text2: "You have been successfully logged out",
            });

            // Navigate to auth screen
            router.replace("/(auth)/");
          } catch (error: any) {
            console.error("Logout error:", error);
            Toast.show({
              type: "error",
              text1: "Logout Failed",
              text2: error.message || "Please try again",
            });
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "⚠️ Delete Account",
      "This action cannot be undone. All your announcements, messages, and account data will be permanently deleted.\n\nAre you absolutely sure you want to delete your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: () => confirmDeleteAccount(),
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      "🚨 Final Warning",
      `Type your username "${user?.username}" to confirm account deletion.\n\nThis will permanently delete:\n• All your announcements\n• All your messages\n• Your profile data\n• Everything associated with your account`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "I Understand, Delete My Account",
          style: "destructive",
          onPress: () => executeDeleteAccount(),
        },
      ]
    );
  };

  const executeDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);

      await userService.deleteAccount();

      Toast.show({
        type: "success",
        text1: "Account Deleted",
        text2: "Your account has been permanently deleted",
        visibilityTime: 4000,
      });

      // Navigate to auth screen after deletion
      setTimeout(() => {
        router.replace("/(auth)/");
      }, 2000);
    } catch (error: any) {
      console.error("Delete account error:", error);
      Toast.show({
        type: "error",
        text1: "Deletion Failed",
        text2: error.message || "Please try again or contact support",
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode,
    danger?: boolean
  ) => {
    return (
      <TouchableOpacity
        style={[styles.settingItem, danger && styles.settingItemDanger]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={!onPress}
      >
        <View style={styles.settingItemLeft}>
          <View
            style={[styles.settingIcon, danger && styles.settingIconDanger]}
          >
            <Ionicons
              name={icon as any}
              size={20}
              color={danger ? colors.white : colors.richOxblood}
            />
          </View>
          <View style={styles.settingContent}>
            <Text
              style={[styles.settingTitle, danger && styles.settingTitleDanger]}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[
                  styles.settingSubtitle,
                  danger && styles.settingSubtitleDanger,
                ]}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {rightComponent ||
          (onPress && (
            <Ionicons
              name="chevron-forward"
              size={20}
              color={danger ? colors.danger : colors.text.secondary}
            />
          ))}
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = (title: string) => {
    return <Text style={styles.sectionHeader}>{title}</Text>;
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.deepBurgundy} />
        </TouchableOpacity>

        <Text style={[globalStyles.heading2, styles.headerTitle]}>
          Settings
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          {/* Account Section */}
          {renderSectionHeader("Account")}
          <View style={styles.sectionContainer}>
            {renderSettingItem(
              "key-outline",
              "Change Password",
              "Update your account password",
              handleChangePassword
            )}

            {renderSettingItem(
              "person-outline",
              "Account Information",
              `Logged in as ${user?.email}`,
              undefined,
              <Text style={styles.infoText}>View Only</Text>
            )}
          </View>

          {/* Notifications Section */}
          {renderSectionHeader("Notifications")}
          <View style={styles.sectionContainer}>
            {renderSettingItem(
              "mail-outline",
              "Email Notifications",
              "Receive updates via email",
              undefined,
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: colors.info, true: colors.warmTaupe }}
                thumbColor={
                  emailNotifications
                    ? colors.richOxblood
                    : colors.text.secondary
                }
              />
            )}

            {renderSettingItem(
              "notifications-outline",
              "Push Notifications",
              "Receive push notifications",
              undefined,
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: colors.info, true: colors.warmTaupe }}
                thumbColor={
                  pushNotifications ? colors.richOxblood : colors.text.secondary
                }
              />
            )}
          </View>

          {/* Privacy Section */}
          {renderSectionHeader("Privacy")}
          <View style={styles.sectionContainer}>
            {renderSettingItem(
              "location-outline",
              "Location Sharing",
              "Allow approximate location sharing",
              undefined,
              <Switch
                value={locationSharing}
                onValueChange={setLocationSharing}
                trackColor={{ false: colors.info, true: colors.warmTaupe }}
                thumbColor={
                  locationSharing ? colors.richOxblood : colors.text.secondary
                }
              />
            )}

            {renderSettingItem(
              "shield-outline",
              "Privacy Policy",
              "Read our privacy policy",
              handlePrivacyPolicy
            )}

            {renderSettingItem(
              "document-text-outline",
              "Terms of Service",
              "Read our terms of service",
              handleTermsOfService
            )}
          </View>

          {/* Support Section */}
          {renderSectionHeader("Support")}
          <View style={styles.sectionContainer}>
            {renderSettingItem(
              "help-circle-outline",
              "Contact Support",
              "Get help with your account",
              handleContactSupport
            )}

            {renderSettingItem(
              "information-circle-outline",
              "App Version",
              "Version 1.0.0",
              undefined,
              <Text style={styles.infoText}>1.0.0</Text>
            )}
          </View>

          {/* Danger Zone */}
          {renderSectionHeader("Account Actions")}
          <View style={styles.sectionContainer}>
            {renderSettingItem(
              "log-out-outline",
              "Logout",
              "Sign out of your account",
              handleLogout,
              isLoggingOut ? (
                <ActivityIndicator size="small" color={colors.text.secondary} />
              ) : undefined
            )}

            {renderSettingItem(
              "trash-outline",
              "Delete Account",
              "Permanently delete your account and all data",
              handleDeleteAccount,
              isDeletingAccount ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : undefined,
              true
            )}
          </View>

          {/* Warning Text */}
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              ⚠️ Deleting your account will permanently remove all your
              announcements, messages, and profile data. This action cannot be
              undone.
            </Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center" as const,
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  settingItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  settingItemDanger: {
    backgroundColor: colors.danger + "10",
  },
  settingItemLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.warmTaupe + "15",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 12,
  },
  settingIconDanger: {
    backgroundColor: colors.danger,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: colors.text.primary,
    marginBottom: 2,
  },
  settingTitleDanger: {
    color: colors.danger,
    fontWeight: "600" as const,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  settingSubtitleDanger: {
    color: colors.danger + "CC",
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: "500" as const,
  },
  warningContainer: {
    backgroundColor: colors.warmTaupe + "15",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning + "40",
  },
  warningText: {
    fontSize: 14,
    color: colors.warning,
    lineHeight: 20,
    textAlign: "center" as const,
  },
  bottomSpacing: {
    height: 32,
  },
});
