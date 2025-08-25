import React from "react";
import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import { router } from "expo-router";
import { globalStyles, colors } from "../../styles";

export default function AuthIndexScreen() {
  const handleLogin = () => {
    router.push("/(auth)/login");
  };

  const handleSignUp = () => {
    router.push("/(auth)/register");
  };

  return (
    <View style={globalStyles.welcomeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* App Title */}
      <Text style={globalStyles.appTitle}>Find lost</Text>

      {/* Welcome Buttons */}
      <View style={globalStyles.welcomeButtonsContainer}>
        {/* Log In Button */}
        <TouchableOpacity
          style={globalStyles.welcomeButtonPrimary}
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <Text style={globalStyles.welcomeButtonTextPrimary}>Log In</Text>
        </TouchableOpacity>

        {/* Sign Up Button */}
        <TouchableOpacity
          style={globalStyles.welcomeButtonSecondary}
          onPress={handleSignUp}
          activeOpacity={0.8}
        >
          <Text style={globalStyles.welcomeButtonTextSecondary}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
