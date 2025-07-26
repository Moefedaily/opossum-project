import React, { useEffect } from "react";
import { Stack, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CreateAnnouncementProvider } from "../../../../contexts/CreateAnnouncementContext";
import { colors } from "../../../../styles";

// Simple layout without any reset logic - we'll handle it in basic-info
export default function CreateAnnouncementLayout() {
  return (
    <CreateAnnouncementProvider>
      <StatusBar style="dark" backgroundColor={colors.background} />
      <Stack
        screenOptions={{
          headerShown: false, // Custom headers in each screen
          animation: "slide_from_right", // Smooth navigation between steps
        }}
      >
        <Stack.Screen
          name="basic-info"
          options={{
            title: "Basic Information",
          }}
        />
        <Stack.Screen
          name="photos"
          options={{
            title: "Add Photos",
          }}
        />
        <Stack.Screen
          name="location"
          options={{
            title: "Location & Submit",
          }}
        />
      </Stack>
    </CreateAnnouncementProvider>
  );
}
