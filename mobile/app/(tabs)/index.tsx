import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { globalStyles, colors } from "../../styles";

export default function DashboardHomeScreen() {
  const { user } = useAuth();

  const handleCreateAdvert = () => {
    // Navigate to create announcement screen
    console.log("Navigate to create advert");
    router.push("/(tabs)/announcements/create/basic-info");
  };

  const handleBrowseItems = () => {
    console.log("Navigate to browse items");
    router.push("/(tabs)/announcements");
  };

  const handleSearchOnMap = () => {
    // Navigate to map search
    console.log("Navigate to map search");
    // router.push("/map-search");
  };

  // const handleSearch = () => {
  //   // Open search functionality
  //   console.log("Open search");
  // };

  // const handleMenu = () => {
  //   // Open hamburger menu
  //   console.log("Open menu");
  // };

  return (
    <SafeAreaView style={globalStyles.dashboardContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        style={globalStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        {/* <View style={globalStyles.dashboardHeader}>
          <TouchableOpacity
            style={globalStyles.headerButton}
            onPress={handleMenu}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={24} color={colors.deepBurgundy} />
          </TouchableOpacity>

          <TouchableOpacity
            style={globalStyles.headerButton}
            onPress={handleSearch}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={24} color={colors.deepBurgundy} />
          </TouchableOpacity>
        </View> */}

        {/* Greeting */}
        <View style={globalStyles.greetingSection}>
          <Text style={globalStyles.greetingText}>Hello,</Text>
          <Text style={globalStyles.greetingName}>
            {user?.username || user?.firstName || "User"}
          </Text>
        </View>

        {/* Action Cards */}
        <View style={globalStyles.dashboardCardsContainer}>
          {/* Create an advert card */}
          <TouchableOpacity
            style={[globalStyles.dashboardCard, globalStyles.createAdvertCard]}
            onPress={handleCreateAdvert}
            activeOpacity={0.8}
          >
            <View style={globalStyles.cardIconContainer}>
              <Ionicons name="add-circle" size={32} color={colors.white} />
            </View>
            <Text style={globalStyles.dashboardCardTitle}>
              Create an advert
            </Text>
            <Text style={globalStyles.dashboardCardSubtitle}>
              Report if you find or lost an item
            </Text>
          </TouchableOpacity>

          {/* Lost & found items card */}
          <TouchableOpacity
            style={[globalStyles.dashboardCard, globalStyles.browseItemsCard]}
            onPress={handleBrowseItems}
            activeOpacity={0.8}
          >
            <View style={globalStyles.cardIconContainer}>
              <Ionicons name="search" size={32} color={colors.white} />
            </View>
            <Text style={globalStyles.dashboardCardTitle}>
              Lost & found items
            </Text>
            <Text style={globalStyles.dashboardCardSubtitle}>
              Go through the lost and found items
            </Text>
          </TouchableOpacity>

          {/* Search on map card */}
          <TouchableOpacity
            style={[globalStyles.dashboardCard, globalStyles.mapSearchCard]}
            onPress={handleSearchOnMap}
            activeOpacity={0.8}
          >
            <View style={globalStyles.cardIconContainer}>
              <Ionicons name="map" size={32} color={colors.white} />
            </View>
            <Text style={globalStyles.dashboardCardTitle}>Search on map</Text>
            <Text style={globalStyles.dashboardCardSubtitle}>
              Search for items on locations near you
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
