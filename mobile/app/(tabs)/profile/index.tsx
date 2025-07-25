import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView, // ✅ Added SafeAreaView import
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { useAuth } from "../../../contexts/AuthContext";
import { userService } from "../../../services/user";
import { globalStyles, colors } from "../../../styles";
import { UserProfileResponse } from "../../../types/profile";

export default function ProfileScreen() {
  const { user: authUser, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(
    null
  );
  const [userStats, setUserStats] = useState({
    totalAnnouncements: 0,
    activeAnnouncements: 0,
    resolvedAnnouncements: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);

      // Load user profile and stats
      const [profile, stats] = await Promise.all([
        userService.getCurrentUser(),
        userService.getUserStats(),
      ]);

      setUserProfile(profile);
      setUserStats(stats);
    } catch (error: any) {
      console.error("Failed to load user profile:", error);
      Toast.show({
        type: "error",
        text1: "Failed to Load Profile",
        text2: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadUserProfile();
    } catch (error) {
      // Error already handled in loadUserProfile
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEditProfile = () => {
    router.push("/(tabs)/profile/edit-profile");
  };

  const handleMyAnnouncements = () => {
    router.push("/(tabs)/profile/my-announcements");
  };

  const handleSettings = () => {
    router.push("/(tabs)/profile/settings");
  };

  // TODO: Implement avatar upload feature
  // This will be added later with:
  // 1. Camera/gallery picker
  // 2. Image cropping
  // 3. Upload to backend
  const handleUploadAvatar = () => {
    Toast.show({
      type: "info",
      text1: "Coming Soon",
      text2: "Avatar upload feature will be available soon!",
    });
  };

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const formatLastSeen = (dateString?: string) => {
    if (!dateString) return "Never";

    const lastLogin = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

    return lastLogin.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[globalStyles.container, styles.loadingContainer]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
        />
        <ActivityIndicator size="large" color={colors.richOxblood} />
        <Text
          style={[
            globalStyles.bodyText,
            { marginTop: 16, textAlign: "center" },
          ]}
        >
          Loading your profile...
        </Text>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={[globalStyles.container, styles.errorContainer]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
        />
        <Ionicons
          name="person-circle-outline"
          size={80}
          color={colors.text.secondary}
        />
        <Text
          style={[
            globalStyles.heading2,
            { textAlign: "center", marginTop: 16 },
          ]}
        >
          Failed to Load Profile
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserProfile}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.richOxblood]} // Android
            tintColor={colors.richOxblood} // iOS
          />
        }
      >
        {/* Profile Header */}
        <View style={styles.headerContainer}>
          <View style={styles.avatarContainer}>
            {/* TODO: Replace with actual avatar image when avatar upload is implemented */}
            {userProfile.avatarUrl ? (
              // When avatar upload is implemented, show actual image here
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={colors.white} />
              </View>
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={colors.white} />
              </View>
            )}

            {/* TODO: Avatar upload button - implement later */}
            <TouchableOpacity
              style={styles.avatarUploadButton}
              onPress={handleUploadAvatar}
            >
              <Ionicons name="camera" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.userInfoContainer}>
            <Text style={[globalStyles.heading1, styles.userName]}>
              {userProfile.firstName && userProfile.lastName
                ? `${userProfile.firstName} ${userProfile.lastName}`
                : userProfile.username}
            </Text>

            <Text style={[globalStyles.bodyText, styles.userEmail]}>
              {userProfile.email}
            </Text>

            <View style={styles.verificationContainer}>
              <Ionicons
                name={
                  userProfile.isVerified ? "checkmark-circle" : "time-outline"
                }
                size={16}
                color={userProfile.isVerified ? colors.success : colors.warning}
              />
              <Text
                style={[
                  globalStyles.caption,
                  {
                    color: userProfile.isVerified
                      ? colors.success
                      : colors.warning,
                    marginLeft: 4,
                  },
                ]}
              >
                {userProfile.isVerified
                  ? "Verified Account"
                  : "Pending Verification"}
              </Text>
            </View>

            <Text style={[globalStyles.caption, styles.joinDate]}>
              Member since {formatJoinDate(userProfile.createdAt)}
            </Text>

            <Text style={[globalStyles.caption, styles.lastSeen]}>
              Last seen {formatLastSeen(userProfile.lastLogin)}
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {userStats.totalAnnouncements}
            </Text>
            <Text style={styles.statLabel}>Total Posts</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {userStats.activeAnnouncements}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {userStats.resolvedAnnouncements}
            </Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>

        {/* Action Cards */}
        <View style={styles.actionCardsContainer}>
          {/* Edit Profile Card */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleEditProfile}
            activeOpacity={0.8}
          >
            <View style={styles.actionCardIcon}>
              <Ionicons
                name="person-outline"
                size={24}
                color={colors.richOxblood}
              />
            </View>
            <View style={styles.actionCardContent}>
              <Text style={styles.actionCardTitle}>Edit Profile</Text>
              <Text style={styles.actionCardSubtitle}>
                Update your personal information
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>

          {/* My Announcements Card */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleMyAnnouncements}
            activeOpacity={0.8}
          >
            <View style={styles.actionCardIcon}>
              <Ionicons
                name="list-outline"
                size={24}
                color={colors.richOxblood}
              />
            </View>
            <View style={styles.actionCardContent}>
              <Text style={styles.actionCardTitle}>My Announcements</Text>
              <Text style={styles.actionCardSubtitle}>
                Manage your posts and responses
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>

          {/* Settings Card */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleSettings}
            activeOpacity={0.8}
          >
            <View style={styles.actionCardIcon}>
              <Ionicons
                name="settings-outline"
                size={24}
                color={colors.richOxblood}
              />
            </View>
            <View style={styles.actionCardContent}>
              <Text style={styles.actionCardTitle}>Settings</Text>
              <Text style={styles.actionCardSubtitle}>
                Account preferences and security
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: colors.richOxblood,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  headerContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 24,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  avatarContainer: {
    position: "relative" as const,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.richOxblood,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  avatarUploadButton: {
    position: "absolute" as const,
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.deepBurgundy,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 2,
    borderColor: colors.white,
  },
  userInfoContainer: {
    flex: 1,
  },
  userName: {
    color: colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    color: colors.text.secondary,
    marginBottom: 8,
  },
  verificationContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 4,
  },
  joinDate: {
    color: colors.text.secondary,
    marginBottom: 2,
  },
  lastSeen: {
    color: colors.text.secondary,
  },
  statsContainer: {
    flexDirection: "row" as const,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.white,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    alignItems: "center" as const,
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: colors.richOxblood,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center" as const,
  },
  actionCardsContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  actionCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  actionCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.softRose,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 16,
  },
  actionCardContent: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginBottom: 4,
  },
  actionCardSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 32,
  },
});
