import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },

  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  primaryButton: {
    backgroundColor: colors.lost,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },

  foundButton: {
    backgroundColor: colors.found,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },

  outlineButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    backgroundColor: "transparent",
  },

  heading1: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 8,
  },

  heading2: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 6,
  },

  heading3: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 4,
  },

  bodyText: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.text.primary,
    lineHeight: 24,
  },

  secondaryText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },

  caption: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.text.secondary,
    lineHeight: 16,
  },

  lostBadge: {
    backgroundColor: colors.lost,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: "flex-start",
  },

  foundBadge: {
    backgroundColor: colors.found,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: "flex-start",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.white,
    textTransform: "uppercase",
  },

  inputContainer: {
    marginBottom: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.surface,
  },

  inputFocused: {
    borderColor: colors.richOxblood,
  },

  inputError: {
    borderColor: colors.danger,
  },

  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
  },

  marginXs: { margin: 4 },
  marginSm: { margin: 8 },
  marginMd: { margin: 12 },
  marginLg: { margin: 16 },
  marginXl: { margin: 20 },
  marginXxl: { margin: 24 },

  paddingXs: { padding: 4 },
  paddingSm: { padding: 8 },
  paddingMd: { padding: 12 },
  paddingLg: { padding: 16 },
  paddingXl: { padding: 20 },
  paddingXxl: { padding: 24 },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  spaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  center: {
    justifyContent: "center",
    alignItems: "center",
  },
});
