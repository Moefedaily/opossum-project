import { StyleSheet } from "react-native";
import { colors } from "./colors";

// 🎨 TYPOGRAPHY SYSTEM - DM Sans + Nunito
const fonts = {
  primary: "DMSans", // DM Sans for headers and important text
  secondary: "Nunito", // Nunito for body text and secondary content
  system: "System", // Fallback to system font
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchIndicator: {
    backgroundColor: colors.background,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  searchIndicatorText: {
    color: colors.text.primary,
    fontSize: 16,
    fontFamily: fonts.primary,
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

  // 🎨 TYPOGRAPHY HIERARCHY WITH FONTS
  heading1: {
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: fonts.primary, // DM Sans for main headers
    color: colors.text.primary,
    marginBottom: 8,
  },

  heading2: {
    fontSize: 24,
    fontWeight: "600",
    fontFamily: fonts.primary, // DM Sans for section headers
    color: colors.text.primary,
    marginBottom: 6,
  },

  heading3: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: fonts.primary, // DM Sans for card titles
    color: colors.text.primary,
    marginBottom: 4,
  },

  bodyText: {
    fontSize: 16,
    fontWeight: "400",
    fontFamily: fonts.secondary, // Nunito for body text
    color: colors.text.primary,
    lineHeight: 24,
  },

  secondaryText: {
    fontSize: 14,
    fontFamily: fonts.secondary, // Nunito for secondary text
    color: colors.text.secondary,
    lineHeight: 20,
  },

  caption: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: fonts.secondary, // Nunito for captions
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
    fontFamily: fonts.primary, // DM Sans for status badges
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
    fontFamily: fonts.secondary, // Nunito for input text
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
    fontFamily: fonts.secondary,
    marginTop: 4,
  },

  // Spacing utilities
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
    fontFamily: fonts.primary, // DM Sans for app branding
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
    borderRadius: 25,
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
    fontFamily: fonts.primary, // DM Sans for button text
  },

  welcomeButtonTextSecondary: {
    color: colors.richOxblood,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: fonts.primary, // DM Sans for button text
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
    fontFamily: fonts.primary, // DM Sans for auth headers
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
    minHeight: 60,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },

  authInputFocused: {
    borderColor: colors.richOxblood,
    borderWidth: 2,
  },

  authInput: {
    fontSize: 16,
    fontFamily: fonts.secondary, // Nunito for input text
    color: colors.text.primary,
    paddingVertical: 12,
    flex: 1,
  },

  // Auth button styles
  authButton: {
    backgroundColor: colors.richOxblood,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },

  authButtonLoading: {
    opacity: 0.7,
  },

  authButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: fonts.primary, // DM Sans for button text
  },

  // Back button
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 1,
    padding: 8,
  },

  // Social login styles
  socialButtonsContainer: {
    marginVertical: 24,
    alignItems: "center",
  },

  socialButtonsTitle: {
    fontSize: 12,
    fontFamily: fonts.secondary,
    color: colors.text.secondary,
    marginBottom: 16,
    textAlign: "center",
  },

  socialButtonsRow: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
  },

  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },

  googleButton: {
    backgroundColor: colors.google,
    borderColor: colors.googleBorder,
  },

  facebookButton: {
    backgroundColor: colors.facebook,
    borderColor: colors.facebook,
  },

  twitterButton: {
    backgroundColor: colors.twitter,
    borderColor: colors.twitter,
  },

  // Auth links
  authLinksContainer: {
    alignItems: "center",
    marginTop: 16,
  },

  authLink: {
    fontSize: 14,
    fontFamily: fonts.secondary,
    color: colors.text.secondary,
    textAlign: "center",
  },

  authLinkHighlight: {
    color: colors.richOxblood,
    fontWeight: "600",
  },

  // Forgot password link
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 24,
  },

  forgotPasswordText: {
    fontSize: 14,
    fontFamily: fonts.secondary,
    color: colors.richOxblood,
  },

  // ========================================
  // DASHBOARD/HOME SCREEN STYLES
  // ========================================

  // Dashboard container
  dashboardContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Dashboard header
  dashboardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
  },

  headerButton: {
    padding: 8,
  },

  // Greeting section
  greetingSection: {
    marginTop: 10,
    marginBottom: 30,
  },

  greetingText: {
    fontSize: 18,
    fontFamily: fonts.secondary, // Nunito
    color: colors.text.secondary, // Better contrast
    fontWeight: "400",
    marginBottom: 4,
  },

  greetingName: {
    fontSize: 32,
    fontFamily: fonts.primary, // DM Sans
    color: colors.deepBurgundy,
    fontWeight: "bold",
  },

  // Dashboard cards
  dashboardCardsContainer: {
    gap: 16,
    paddingBottom: 30,
  },

  dashboardCard: {
    borderRadius: 16,
    padding: 24,
    minHeight: 120,
    justifyContent: "space-between",
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  cardIconContainer: {
    alignSelf: "flex-start",
    marginBottom: 12,
  },

  dashboardCardTitle: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: fonts.primary, // DM Sans
    color: colors.white,
    marginBottom: 4,
  },

  dashboardCardSubtitle: {
    fontSize: 14,
    fontFamily: fonts.secondary, // Nunito
    color: colors.white,
    opacity: 0.9,
    lineHeight: 18,
  },

  // ========================================
  // ANNOUNCEMENTS SCREEN STYLES
  // ========================================
  announcementsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
  },

  announcementsHeaderTitle: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: fonts.primary, // DM Sans
    color: colors.deepBurgundy,
  },

  // Category tabs
  categoryContainer: {
    backgroundColor: colors.background,
    paddingVertical: 8,
  },

  categoryScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },

  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.light,
  },

  categoryTabActive: {
    backgroundColor: colors.richOxblood,
    borderColor: colors.richOxblood,
  },

  categoryTabText: {
    fontSize: 14,
    fontFamily: fonts.secondary, // Nunito
    color: colors.text.secondary,
    fontWeight: "500",
  },

  categoryTabTextActive: {
    color: colors.white,
    fontWeight: "600",
  },

  // Announcements list
  announcementsList: {
    padding: 16,
  },

  announcementsRow: {
    justifyContent: "space-between",
  },

  // Announcement card
  announcementCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "48%",
  },

  // Card image
  announcementImageContainer: {
    height: 120,
    backgroundColor: colors.border.light,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
  },

  announcementImage: {
    width: "100%",
    height: "100%",
  },

  announcementImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.softRose,
  },

  // Card content
  announcementCardContent: {
    padding: 12,
  },

  announcementCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: fonts.primary, // DM Sans
    color: colors.text.primary,
    marginBottom: 8,
    lineHeight: 18,
  },

  announcementCardMeta: {
    marginBottom: 12,
  },

  announcementLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  announcementLocationText: {
    fontSize: 12,
    fontFamily: fonts.secondary, // Nunito
    color: colors.text.secondary,
    marginLeft: 4,
    flex: 1,
  },

  announcementTimeText: {
    fontSize: 11,
    fontFamily: fonts.secondary, // Nunito
    color: colors.warmTaupe,
  },

  // Card actions
  announcementCardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  announcementShareButton: {
    backgroundColor: colors.richOxblood,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },

  announcementShareButtonText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: fonts.primary, // DM Sans
    color: colors.white,
  },

  announcementFavoriteButton: {
    padding: 6,
  },

  // Loading states
  announcementsLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },

  announcementsLoadingText: {
    fontSize: 16,
    fontFamily: fonts.secondary, // Nunito
    color: colors.text.secondary,
    marginTop: 12,
  },

  // Error states
  announcementsErrorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  announcementsErrorText: {
    fontSize: 16,
    fontFamily: fonts.secondary, // Nunito
    color: colors.text.secondary,
    textAlign: "center",
    marginVertical: 16,
  },

  announcementsRetryButton: {
    backgroundColor: colors.richOxblood,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  announcementsRetryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: fonts.primary, // DM Sans
    color: colors.white,
  },

  // Empty state
  announcementsEmptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },

  announcementsEmptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: fonts.primary, // DM Sans
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },

  announcementsEmptySubtitle: {
    fontSize: 14,
    fontFamily: fonts.secondary, // Nunito
    color: colors.text.secondary,
    textAlign: "center",
    paddingHorizontal: 40,
  },

  // Specific dashboard card colors
  createAdvertCard: {
    backgroundColor: colors.cardPrimary, // #7C444F
  },

  browseItemsCard: {
    backgroundColor: colors.cardSecondary, // #944E63
  },

  mapSearchCard: {
    backgroundColor: colors.cardTertiary, // #B47B84
  },
});

// Export fonts for use in other components
export { fonts };
