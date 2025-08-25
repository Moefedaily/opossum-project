// app/(tabs)/map/components/FilterModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../../styles";

// Filter types
export interface FilterState {
  type: "ALL" | "LOST" | "FOUND";
  radius: number;
  category: string;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  currentFilters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
}

// Categories matching your backend
const CATEGORIES = [
  { key: "ALL", label: "All Categories", icon: "apps-outline" },
  { key: "ELECTRONICS", label: "Electronics", icon: "phone-portrait-outline" },
  { key: "CLOTHING", label: "Clothing", icon: "shirt-outline" },
  { key: "DOCUMENTS", label: "Documents", icon: "document-text-outline" },
  { key: "BAGS", label: "Bags", icon: "bag-outline" },
  { key: "KEYS", label: "Keys", icon: "key-outline" },
  { key: "JEWELRY", label: "Jewelry", icon: "diamond-outline" },
  { key: "BOOKS", label: "Books", icon: "book-outline" },
  { key: "HOUSEHOLD", label: "Household", icon: "home-outline" },
  { key: "VEHICLE", label: "Vehicle", icon: "car-outline" },
  { key: "SPORTS", label: "Sports", icon: "football-outline" },
  { key: "PETS", label: "Pets", icon: "paw-outline" },
  { key: "WALLET", label: "Wallet", icon: "wallet-outline" },
  { key: "OTHER", label: "Other", icon: "ellipsis-horizontal-outline" },
];

// Distance options
const RADIUS_OPTIONS = [
  { value: 5, label: "5km" },
  { value: 10, label: "10km" },
  { value: 20, label: "20km" },
  { value: 50, label: "50km" },
];

const { width } = Dimensions.get("window");

export default function FilterModal({
  visible,
  onClose,
  currentFilters,
  onApplyFilters,
}: FilterModalProps) {
  // Local state for filters (so user can cancel changes)
  const [localFilters, setLocalFilters] = useState<FilterState>(currentFilters);

  // Reset local filters when modal opens
  useEffect(() => {
    if (visible) {
      setLocalFilters(currentFilters);
    }
  }, [visible, currentFilters]);

  // Handle type selection
  const handleTypeSelect = (type: FilterState["type"]) => {
    setLocalFilters((prev) => ({ ...prev, type }));
  };

  // Handle radius selection
  const handleRadiusSelect = (radius: number) => {
    setLocalFilters((prev) => ({ ...prev, radius }));
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setLocalFilters((prev) => ({ ...prev, category }));
  };

  // Apply filters and close modal
  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  // Reset to default filters
  const handleReset = () => {
    const defaultFilters: FilterState = {
      type: "ALL",
      radius: 10,
      category: "ALL",
    };
    setLocalFilters(defaultFilters);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#7C444F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filters</Text>
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Type Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Item Type</Text>
            <View style={styles.typeRow}>
              {[
                { key: "ALL", label: "All Items" },
                { key: "LOST", label: "Lost" },
                { key: "FOUND", label: "Found" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.typeButton,
                    localFilters.type === option.key && styles.typeButtonActive,
                  ]}
                  onPress={() =>
                    handleTypeSelect(option.key as FilterState["type"])
                  }
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      localFilters.type === option.key &&
                        styles.typeButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Distance Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Search Distance</Text>
            <View style={styles.radiusRow}>
              {RADIUS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.radiusButton,
                    localFilters.radius === option.value &&
                      styles.radiusButtonActive,
                  ]}
                  onPress={() => handleRadiusSelect(option.value)}
                >
                  <Text
                    style={[
                      styles.radiusButtonText,
                      localFilters.radius === option.value &&
                        styles.radiusButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏷️ Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.categoryButton,
                    localFilters.category === category.key &&
                      styles.categoryButtonActive,
                  ]}
                  onPress={() => handleCategorySelect(category.key)}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={20}
                    color={
                      localFilters.category === category.key
                        ? "#FFFFFF"
                        : "#7C444F"
                    }
                  />
                  <Text
                    style={[
                      styles.categoryButtonText,
                      localFilters.category === category.key &&
                        styles.categoryButtonTextActive,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF7F0",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FAF7F0",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    fontFamily: "System",
  },

  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  resetText: {
    fontSize: 16,
    color: "#7C444F",
    fontWeight: "600",
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  section: {
    marginTop: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
    fontFamily: "System",
  },

  // Type Filter Styles
  typeRow: {
    flexDirection: "row",
    gap: 12,
  },

  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },

  typeButtonActive: {
    backgroundColor: "#7C444F",
    borderColor: "#7C444F",
  },

  typeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },

  typeButtonTextActive: {
    color: "#FFFFFF",
  },

  // Radius Filter Styles
  radiusRow: {
    flexDirection: "row",
    gap: 12,
  },

  radiusButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },

  radiusButtonActive: {
    backgroundColor: "#4ECDC4",
    borderColor: "#4ECDC4",
  },

  radiusButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },

  radiusButtonTextActive: {
    color: "#FFFFFF",
  },

  // Category Filter Styles
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  categoryButton: {
    width: (width - 64) / 2, // 2 columns with gaps
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
    gap: 8,
  },

  categoryButtonActive: {
    backgroundColor: "#7C444F",
    borderColor: "#7C444F",
  },

  categoryButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
  },

  categoryButtonTextActive: {
    color: "#FFFFFF",
  },

  // Footer Styles
  footer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  applyButton: {
    backgroundColor: "#7C444F",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },

  applyButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    fontFamily: "System",
  },
});
