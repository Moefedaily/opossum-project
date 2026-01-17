import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../styles";

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  currentCategory: string;
}

export default function SearchModal({
  visible,
  onClose,
  onSearch,
  currentCategory,
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setSearchQuery("");
      setTimeout(() => textInputRef.current?.focus(), 100);
    }
  }, [visible]);

  const handleSearch = () => {
    const query = searchQuery.trim();
    onSearch(query);
    onClose();
  };

  const handleClear = () => {
    setSearchQuery("");
    onSearch("");
    textInputRef.current?.focus();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.5)" />

      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContent}
            onPress={() => {}}
          >
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>

              <Text style={styles.title}>Search Items</Text>

              <View style={styles.placeholder} />
            </View>

            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color={colors.text.secondary}
                style={styles.searchIcon}
              />

              <TextInput
                ref={textInputRef}
                style={styles.searchInput}
                placeholder="Search all items..."
                placeholderTextColor={colors.text.secondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />

              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClear}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              activeOpacity={0.7}
            >
              <Text style={styles.searchButtonText}>
                {searchQuery.trim() ? "Search" : "Clear Search"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.infoText}>
              Search will look through all categories
            </Text>

            {searchQuery.length === 0 && (
              <View style={styles.quickActions}>
                <Text style={styles.quickActionsTitle}>Popular searches:</Text>
                <View style={styles.quickActionButtons}>
                  {["iPhone", "keys", "wallet", "documents"].map((term) => (
                    <TouchableOpacity
                      key={term}
                      style={styles.quickActionButton}
                      onPress={() => {
                        setSearchQuery(term);
                        onSearch(term);
                        onClose();
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.quickActionText}>{term}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  container: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
  },
  placeholder: {
    width: 32,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warmTaupe + "20",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border?.light || colors.warmTaupe + "40",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  searchButton: {
    backgroundColor: colors.richOxblood,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  searchButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 20,
  },
  quickActions: {
    marginTop: 8,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
    marginBottom: 12,
  },
  quickActionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickActionButton: {
    backgroundColor: colors.warmTaupe + "20",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border?.light || colors.warmTaupe + "40",
  },
  quickActionText: {
    fontSize: 14,
    color: colors.text.primary,
  },
});
