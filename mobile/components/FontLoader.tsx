import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import * as Font from "expo-font";
import { colors } from "../styles/colors";

// Import Google Fonts
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";

import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from "@expo-google-fonts/nunito";

interface FontLoaderProps {
  children: React.ReactNode;
}

export default function FontLoader({ children }: FontLoaderProps) {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          // DM Sans family
          DMSans: DMSans_400Regular,
          "DMSans-Medium": DMSans_500Medium,
          "DMSans-SemiBold": DMSans_600SemiBold,
          "DMSans-Bold": DMSans_700Bold,

          // Nunito family
          Nunito: Nunito_400Regular,
          "Nunito-Medium": Nunito_500Medium,
          "Nunito-SemiBold": Nunito_600SemiBold,
          "Nunito-Bold": Nunito_700Bold,
        });
        setFontsLoaded(true);
      } catch (error) {
        console.warn("Error loading fonts:", error);
        // Fallback to system fonts
        setFontsLoaded(true);
      }
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.richOxblood} />
      </View>
    );
  }

  return <>{children}</>;
}
