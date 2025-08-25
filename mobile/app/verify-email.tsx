// import React, { useEffect, useState } from "react";
// import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
// import { useLocalSearchParams } from "expo-router";
// import { authService } from "../services/auth";
// import { colors } from "../styles";

// export default function VerifyEmailPage() {
//   const { token } = useLocalSearchParams<{ token: string }>();
//   const [status, setStatus] = useState<"loading" | "success" | "error">(
//     "loading"
//   );
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     if (token) {
//       verifyEmail(token);
//     } else {
//       setStatus("error");
//       setMessage("Invalid verification link");
//     }
//   }, [token]);

//   const verifyEmail = async (verificationToken: string) => {
//     try {
//       const message = await authService.verifyEmail(verificationToken);
//       setStatus("success");
//       setMessage(message);

//       // Try to open mobile app with deep link
//       tryOpenMobileApp(verificationToken);
//     } catch (error: any) {
//       console.error("Verification error:", error);
//       setStatus("error");
//       setMessage(error.message || "Verification failed");
//     }
//   };

//   const tryOpenMobileApp = (verificationToken: string) => {
//     // Try to open mobile app with deep link
//     const deepLink = `opossum://verify-success?token=${verificationToken}`;

//     // Create invisible link and try to open it
//     if (typeof window !== "undefined" && window.document) {
//       const link = document.createElement("a");
//       link.href = deepLink;
//       link.click();
//     }

//     // If mobile app doesn't open in 2 seconds, user stays on web page
//     setTimeout(() => {
//       console.log("Mobile app did not open, user will see web page");
//     }, 2000);
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.content}>
//         {status === "loading" && (
//           <>
//             <ActivityIndicator size="large" color={colors.richOxblood} />
//             <Text style={styles.title}>Verifying your email...</Text>
//             <Text style={styles.subtitle}>Please wait a moment</Text>
//           </>
//         )}

//         {status === "success" && (
//           <>
//             <Text style={styles.successTitle}>{message}</Text>
//             <Text style={styles.instruction}>
//               You can now return to the OPOSSUM app to login with your account.
//             </Text>
//           </>
//         )}

//         {status === "error" && (
//           <>
//             <Text style={styles.errorTitle}>Verification Failed!</Text>
//             <Text style={styles.message}>{message}</Text>
//             <Text style={styles.instruction}>
//               Please try registering again or contact support if the problem
//               persists.
//             </Text>
//           </>
//         )}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   content: {
//     alignItems: "center",
//     maxWidth: 400,
//     width: "100%",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: colors.deepBurgundy,
//     marginTop: 20,
//     textAlign: "center",
//   },
//   subtitle: {
//     fontSize: 16,
//     color: colors.text.secondary,
//     marginTop: 8,
//     textAlign: "center",
//   },
//   successIcon: {
//     marginBottom: 20,
//   },
//   errorIcon: {
//     marginBottom: 20,
//   },
//   successEmoji: {
//     fontSize: 64,
//   },
//   errorEmoji: {
//     fontSize: 64,
//   },
//   successTitle: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: colors.success,
//     marginBottom: 16,
//     textAlign: "center",
//   },
//   errorTitle: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: colors.danger,
//     marginBottom: 16,
//     textAlign: "center",
//   },
//   message: {
//     fontSize: 18,
//     color: colors.text.primary,
//     marginBottom: 20,
//     textAlign: "center",
//     lineHeight: 24,
//   },
//   instruction: {
//     fontSize: 16,
//     color: colors.text.secondary,
//     textAlign: "center",
//     lineHeight: 22,
//     fontStyle: "italic",
//   },
// });
