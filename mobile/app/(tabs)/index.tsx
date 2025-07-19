import React from "react";
import { View, ScrollView } from "react-native";
import { Text, Button, Card } from "@rneui/themed";
import { useAuth } from "../../contexts/AuthContext";
import { globalStyles, colors } from "../../styles";

export default function HomeScreen() {
  const { user, logout, isLoading } = useAuth();

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={globalStyles.paddingLg}
    >
      <View style={[globalStyles.center, globalStyles.marginXxl]}>
        <Text style={globalStyles.heading1}>OPOSSUM</Text>
        <Text style={globalStyles.heading3}>
          Welcome back, {user?.firstName || user?.username}! 👋
        </Text>
        <Text style={globalStyles.secondaryText}>
          Ready to help reunite lost items?
        </Text>
      </View>

      <Card containerStyle={[globalStyles.card, globalStyles.marginLg]}>
        <Text style={globalStyles.heading3}>Your Profile</Text>
        <Text style={globalStyles.bodyText}>
          <Text style={{ fontWeight: "600" }}>Username:</Text> {user?.username}
        </Text>
        <Text style={globalStyles.bodyText}>
          <Text style={{ fontWeight: "600" }}>Email:</Text> {user?.email}
        </Text>
        <Text style={globalStyles.bodyText}>
          <Text style={{ fontWeight: "600" }}>Role:</Text> {user?.role}
        </Text>
        {user?.firstName && (
          <Text style={globalStyles.bodyText}>
            <Text style={{ fontWeight: "600" }}>Name:</Text> {user.firstName}{" "}
            {user.lastName}
          </Text>
        )}
      </Card>

      <View style={globalStyles.marginLg}>
        <Button
          title="📝 Report Lost Item"
          buttonStyle={[
            globalStyles.primaryButton,
            { backgroundColor: colors.lost },
            globalStyles.marginLg,
          ]}
          titleStyle={{ fontSize: 16, fontWeight: "600" }}
          onPress={() => console.log("Report Lost pressed")}
        />

        <Button
          title="🔍 Report Found Item"
          buttonStyle={[globalStyles.foundButton, globalStyles.marginLg]}
          titleStyle={{ fontSize: 16, fontWeight: "600" }}
          onPress={() => console.log("Report Found pressed")}
        />

        <Button
          title="🗺️ Browse Nearby Items"
          buttonStyle={[
            globalStyles.outlineButton,
            { borderColor: colors.richOxblood },
            globalStyles.marginLg,
          ]}
          titleStyle={{
            color: colors.richOxblood,
            fontSize: 16,
            fontWeight: "600",
          }}
          onPress={() => console.log("Browse pressed")}
        />
      </View>

      <Card containerStyle={[globalStyles.card, globalStyles.marginLg]}>
        <Text style={globalStyles.heading3}>Quick Stats</Text>
        <View style={globalStyles.row}>
          <View style={{ flex: 1 }}>
            <Text style={globalStyles.caption}>Your Posts</Text>
            <Text style={globalStyles.heading2}>0</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={globalStyles.caption}>Items Reunited</Text>
            <Text style={globalStyles.heading2}>0</Text>
          </View>
        </View>
      </Card>

      <Button
        title="Logout"
        type="outline"
        loading={isLoading}
        buttonStyle={[
          globalStyles.outlineButton,
          { borderColor: colors.danger },
          globalStyles.marginXxl,
        ]}
        titleStyle={{ color: colors.danger }}
        onPress={logout}
        disabled={isLoading}
      />
    </ScrollView>
  );
}
