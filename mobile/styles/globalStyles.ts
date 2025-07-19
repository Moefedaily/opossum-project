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

  // ========================================
  // WELCOME/AUTH INDEX SCREEN STYLES
  // ========================================

  // Main welcome container
  welcomeContainer: {
    flex: 1,
    backgroundColor: colors.background, // soft rose
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },

  // App title/branding
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.deepBurgundy,
    marginBottom: 60,
    textAlign: "center",
  },

  // Welcome buttons container
  welcomeButtonsContainer: {
    width: "100%",
    gap: 16,
  },

  // Primary welcome button (Log In)
  welcomeButtonPrimary: {
    backgroundColor: colors.richOxblood,
    borderRadius: 25, // More rounded like design
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },

  // Secondary welcome button (Sign Up)
  welcomeButtonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.richOxblood,
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
  },

  // Button text styles
  welcomeButtonTextPrimary: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },

  welcomeButtonTextSecondary: {
    color: colors.richOxblood,
    fontSize: 16,
    fontWeight: "600",
  },

  // ========================================
  // AUTH SCREENS (LOGIN/REGISTER) STYLES
  // ========================================

  // Auth screen container
  authContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 40,
    paddingTop: 80,
    paddingBottom: 40,
  },

  // Auth screen headers
  authHeader: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.deepBurgundy,
    textAlign: "center",
    marginBottom: 40,
  },

  // Form container
  authFormContainer: {
    flex: 1,
    justifyContent: "center",
  },

  // Custom input styling (white containers)
  authInputContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  authInput: {
    fontSize: 16,
    color: colors.text.primary,
    paddingVertical: 12,
    borderWidth: 0, // Remove default border
  },

  // Auth action button
  authButton: {
    backgroundColor: colors.richOxblood,
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },

  authButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },

  // ========================================
  // SOCIAL LOGIN BUTTONS
  // ========================================

  // Social buttons container
  socialButtonsContainer: {
    gap: 12,
    marginTop: 20,
    marginBottom: 30,
  },

  socialButtonsTitle: {
    textAlign: "center",
    color: colors.text.secondary,
    fontSize: 14,
    marginBottom: 16,
  },

  socialButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },

  // Individual social buttons
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  googleButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dadce0",
  },

  facebookButton: {
    backgroundColor: "#1877f2",
  },

  twitterButton: {
    backgroundColor: "#1da1f2",
  },

  // ========================================
  // AUTH LINKS AND NAVIGATION
  // ========================================

  // Bottom links container
  authLinksContainer: {
    alignItems: "center",
    marginTop: 20,
  },

  // Auth links (Sign up, Forgot password, etc.)
  authLink: {
    color: colors.richOxblood,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginVertical: 8,
  },

  // Back navigation
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
  },

  // ========================================
  // FORM VALIDATION & STATES
  // ========================================

  // Loading state for buttons
  authButtonLoading: {
    backgroundColor: colors.warmTaupe,
  },

  // Input focus state
  authInputFocused: {
    borderWidth: 2,
    borderColor: colors.richOxblood,
  },

  // Input error state
  authInputError: {
    borderWidth: 2,
    borderColor: colors.danger,
  },
});
