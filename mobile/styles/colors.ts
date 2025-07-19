export const colors = {
  deepBurgundy: "#320f13",
  richOxblood: "#4a0001",
  mediumBurgundy: "#5b191a",
  warmTaupe: "#b69a99",
  softRose: "#dacccc",

  lost: "#4a0001",
  found: "#2d5a3d",
  success: "#2d5a3d",
  warning: "#8b5a2b",
  info: "#4a4a4a",
  danger: "#4a0001",

  primary: "#4a0001",
  secondary: "#2d5a3d",

  white: "#ffffff",
  black: "#000000",

  background: "#dacccc",
  surface: "#ffffff",

  text: {
    primary: "#320f13",
    secondary: "#b69a99",
    light: "#b69a99",
    inverse: "#dacccc",
  },

  border: {
    light: "#dacccc",
    medium: "#b69a99",
    dark: "#5b191a",
  },
};

export const getStatusColor = (status: "ACTIVE" | "RESOLVED" | "ARCHIVED") => {
  switch (status) {
    case "ACTIVE":
      return colors.richOxblood;
    case "RESOLVED":
      return colors.success;
    case "ARCHIVED":
      return colors.warmTaupe;
    default:
      return colors.warmTaupe;
  }
};

export const getTypeColor = (type: "LOST" | "FOUND") => {
  return type === "LOST" ? colors.lost : colors.found;
};
