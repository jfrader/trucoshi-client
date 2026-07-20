import { createTheme, ThemeOptions } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import createPalette, { PaletteColorOptions } from "@mui/material/styles/createPalette";
import { BURNT_CARD } from "trucoshi";

declare module "@mui/material" {
  interface Palette {
    twitter: PaletteColorOptions;
  }

  interface PaletteOptions {
    twitter: PaletteColorOptions;
  }

  interface ButtonPropsColorOverrides {
    twitter: true;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    "0": true;
    "1": true;
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    card: true;
    emojicard: true;
  }
}

type TrucoshiUiTokens = {
  shell: {
    background: string;
    backgroundColor: string;
    featureBackground: string;
  };
  navigation: {
    appBarHeightMobile: string;
    appBarHeightDesktop: string;
    gameBarHeight: string;
    edgeInset: string;
    controlSize: string;
    gameTopBarWidth: string;
    drawerWidthSmall: string;
    drawerWidthMedium: string;
    drawerBackdrop: string;
  };
  content: {
    surface: string;
    navigationSurface: string;
    divider: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    accentSoft: string;
    cardShadow: string;
  };
  home: {
    panel: Record<string, any>;
  };
  account: {
    hero: Record<string, any>;
    panel: Record<string, any>;
    inset: Record<string, any>;
    iconFrame: Record<string, any>;
    divider: string;
  };
  board: {
    feltPrimary: string;
    feltSecondary: string;
    feltTertiary: string;
    woodPrimary: string;
    woodSecondary: string;
    shadow: string;
    shellBackground: string;
    shellOverlay: string;
    surfaceBackground: string;
    surfaceShadow: string;
    surfaceInsetBorder: string;
    surfaceInnerShade: string;
    layers: {
      center: number;
      seats: number;
      foregroundCenter: number;
      guidanceSeats: number;
    };
  };
  commandBar: {
    background: string;
    panelBorder: string;
    panelShadow: string;
    actionBorder: string;
    actionShadow: string;
    defaultActionColor: string;
    envidoBaseColor: string;
    envidoBestColor: string;
    actionColors: Record<string, string>;
  };
  match: {
    scoreCard: Record<string, any>;
    topBadge: Record<string, any>;
    settingsButton: Record<string, any>;
    emptySeat: Record<string, any>;
    announcementPanel: Record<string, any>;
    handPanel: Record<string, any>;
    waitingPanel: Record<string, any>;
    dockShell: Record<string, any>;
    dockDivider: Record<string, any>;
    dockCommandLane: Record<string, any>;
    dockChatButton: Record<string, any>;
    playedCardStack: {
      openScale: number;
      openSpreadRatio: number;
      restingShadow: string;
      openShadow: string;
      cardTransition: string;
    };
    cardPlayInteraction: {
      dragThresholdPx: number;
      returnDurationMs: number;
      dragScale: number;
      dragFilter: string;
      dropBorderRadius: string;
      dropOutline: string;
      activeDropOutline: string;
      activeDropShadow: string;
      activeDropBackground: string;
      dropCueTransition: string;
      returnTransition: string;
    };
    seatTurnRing: {
      alert: string;
      extension: string;
      normal: string;
      track: string;
      shadow: string;
    };
    seatAvatarFrame: Record<string, any>;
    seatNameBadge: Record<string, any>;
    seatNameBadgeMyTurn: Record<string, any>;
    seatStatusDot: Record<string, any>;
  };
  seatAvatarBadges: {
    badge: Record<string, any>;
    mateBadge: Record<string, any>;
    roleBadge: Record<string, any>;
    mateIcon: Record<string, any>;
    manoIcon: Record<string, any>;
    hostIcon: Record<string, any>;
  };
  seatChatBubble: {
    bubble: Record<string, any>;
    tail: Record<string, any>;
  };
  lobby: {
    seatCard: Record<string, any>;
    topPlayersCard: Record<string, any>;
    topSessionCard: Record<string, any>;
    topSettingsButton: Record<string, any>;
    rulesPanel: Record<string, any>;
    waitingHostCard: Record<string, any>;
  };
  queue: {
    panel: Record<string, any>;
    segment: Record<string, any>;
    activeSegment: Record<string, any>;
    statusPanel: Record<string, any>;
    cancelButton: Record<string, any>;
  };
  chatDrawer: {
    chatMessages: Record<string, any>;
    actionsPanelBorder: string;
    actionsPanelBackground: string;
    actionsPanelShadow: string;
    actionButtonBorder: string;
    actionButtonBackground: string;
    actionButtonShadow: string;
    announcementPanelBorder: string;
    announcementPanelBackground: string;
    announcementPanelShadow: string;
    drawerPanelBackground: string;
    drawerPanelBorderTop: string;
    railWidth: string;
    railBorder: string;
    railBackground: string;
    railShadow: string;
    railHeaderBackground: string;
    railHeaderBorderBottom: string;
  };
};

declare module "@mui/material/styles" {
  interface Theme {
    trucoshiUi: TrucoshiUiTokens;
  }

  interface ThemeOptions {
    trucoshiUi?: Partial<TrucoshiUiTokens>;
  }
}

const TRUCOSHI_SHELL_BACKGROUND =
  "radial-gradient(circle at 82% 0%, rgba(236, 108, 52, 0.11), transparent 30rem), radial-gradient(circle at 8% 62%, rgba(47, 126, 91, 0.18), transparent 36rem), linear-gradient(145deg, #1f3828 0%, #15291e 46%, #0b1812 100%)";

const LIGHT_SHELL_BACKGROUND =
  "radial-gradient(circle at 82% 0%, rgba(236, 108, 52, 0.13), transparent 30rem), radial-gradient(circle at 8% 62%, rgba(47, 126, 91, 0.15), transparent 36rem), linear-gradient(145deg, #eef5ef 0%, #dfece3 48%, #f5eee7 100%)";

const DARK_SHELL_BACKGROUND =
  "radial-gradient(circle at 82% 0%, rgba(236, 108, 52, 0.045), transparent 30rem), radial-gradient(circle at 8% 62%, rgba(47, 126, 91, 0.065), transparent 36rem), linear-gradient(145deg, #0b0e0c 0%, #050806 46%, #010302 100%)";

const DARK_BOARD_SHELL_BACKGROUND =
  "radial-gradient(110% 75% at 50% 4%, rgba(255,255,255,0.035), transparent 64%), radial-gradient(130% 90% at 50% 100%, rgba(0,38,28,0.2), transparent 70%), linear-gradient(160deg, #101512 0%, #080e0b 62%, #020705 100%)";

const defaultTrucoshiUiTokens: TrucoshiUiTokens = {
  shell: {
    background: TRUCOSHI_SHELL_BACKGROUND,
    backgroundColor: "#0b1812",
    featureBackground:
      "radial-gradient(circle at 92% 10%, rgba(236,108,52,0.12), transparent 35%), linear-gradient(120deg, #0d1d15, #0a1510)",
  },
  navigation: {
    appBarHeightMobile: "50px",
    appBarHeightDesktop: "52px",
    gameBarHeight: "44px",
    edgeInset: "0.75rem",
    controlSize: "2rem",
    gameTopBarWidth: "calc(100% - 7.5rem)",
    drawerWidthSmall: "24rem",
    drawerWidthMedium: "26rem",
    drawerBackdrop: "rgba(0, 0, 0, 0.38)",
  },
  content: {
    surface: "#0d1b14",
    navigationSurface: "rgba(255,255,255,0.035)",
    divider: "rgba(231, 238, 230, 0.13)",
    textPrimary: "#f5efe3",
    textSecondary: "#b8c5bb",
    accent: "#ec6c34",
    accentSoft: "rgba(236, 108, 52, 0.14)",
    cardShadow: "0 30px 54px rgba(0,0,0,0.5), 0 5px 14px rgba(0,0,0,0.35)",
  },
  home: {
    panel: {
      borderRadius: "1.2rem",
      border: "1px solid rgba(226,190,112,0.16)",
      background: "#102018",
      boxShadow: "none",
      overflow: "hidden",
    },
  },
  account: {
    hero: {
      borderRadius: "1.35rem",
      border: "1px solid rgba(230, 186, 81, 0.2)",
      background:
        "radial-gradient(circle at 86% 18%, rgba(215,154,62,0.18), transparent 30%), radial-gradient(circle at 8% 92%, rgba(45,132,91,0.22), transparent 36%), linear-gradient(145deg, rgba(21,54,37,0.94), rgba(6,23,16,0.96))",
      boxShadow: "0 18px 38px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)",
    },
    panel: {
      borderRadius: "1.15rem",
      border: "1px solid rgba(255,255,255,0.1)",
      background: "linear-gradient(155deg, rgba(18,45,31,0.82), rgba(5,20,14,0.88))",
      boxShadow: "0 12px 26px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.045)",
    },
    inset: {
      borderRadius: "0.9rem",
      border: "1px solid rgba(255,255,255,0.075)",
      background: "rgba(2, 13, 9, 0.28)",
    },
    iconFrame: {
      width: 40,
      height: 40,
      borderRadius: "0.78rem",
      color: "warning.light",
      background: "rgba(215,154,62,0.1)",
      border: "1px solid rgba(226,178,70,0.18)",
    },
    divider: "rgba(255,255,255,0.09)",
  },
  board: {
    feltPrimary: "#1b6250",
    feltSecondary: "#0f4a3d",
    feltTertiary: "#0a332a",
    woodPrimary: "#7d4e2d",
    woodSecondary: "#442916",
    shadow: "rgba(0, 0, 0, 0.5)",
    shellBackground:
      "radial-gradient(110% 75% at 50% 4%, rgba(255,255,255,0.08), transparent 64%), radial-gradient(130% 90% at 50% 100%, rgba(0,0,0,0.42), transparent 70%), linear-gradient(160deg, #243728 0%, #192b1d 62%, #08211d 100%)",
    shellOverlay:
      "radial-gradient(circle at 10% 8%, rgba(255,255,255,0.05), transparent 30%), radial-gradient(circle at 88% 12%, rgba(255,255,255,0.04), transparent 28%), radial-gradient(circle at 18% 92%, rgba(0,0,0,0.3), transparent 25%), radial-gradient(circle at 84% 88%, rgba(0,0,0,0.34), transparent 26%)",
    surfaceBackground:
      "radial-gradient(circle at 34% 28%, rgba(255,255,255,0.09), transparent 23%), radial-gradient(circle at 70% 72%, rgba(255,255,255,0.045), transparent 20%), radial-gradient(circle at 50% 50%, rgba(0,0,0,0.22), transparent 68%), linear-gradient(166deg, var(--felt-primary), var(--felt-secondary) 66%, var(--felt-tertiary) 100%)",
    surfaceShadow:
      "0 16px 36px var(--board-shadow), inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 -24px 35px rgba(0,0,0,0.24)",
    surfaceInsetBorder: "1px solid rgba(255,255,255,0.18)",
    surfaceInnerShade: "inset 0 0 45px rgba(0,0,0,0.26)",
    layers: {
      center: 2,
      seats: 3,
      foregroundCenter: 4,
      guidanceSeats: 5,
    },
  },
  commandBar: {
    background:
      "linear-gradient(164deg, rgba(63, 36, 22, 0.97) 0%, rgba(32, 20, 12, 0.98) 70%, rgba(25, 16, 11, 0.98) 100%)",
    panelBorder: "1px solid rgba(255,255,255,0.16)",
    panelShadow: "0 10px 24px rgba(0,0,0,0.42)",
    actionBorder: "1px solid rgba(255,255,255,0.13)",
    actionShadow: "0 3px 10px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.1)",
    defaultActionColor: "#3d7051",
    envidoBaseColor: "#7a3229",
    envidoBestColor: "#3d7a45",
    actionColors: {
      truco: "#ab3a2a",
      reTruco: "#b43a29",
      valeCuatro: "#c03d2b",
      envido: "#3d546a",
      realEnvido: "#7a6640",
      faltaEnvido: "#6c5b36",
      flor: "#4b6938",
      contraflor: "#4e6a39",
      contraflorAlResto: "#4e6a39",
      quiero: "#3d7a45",
      noQuiero: "#4a3224",
      sonBuenas: "#5c3e2c",
      achico: "#5b3b2a",
      paso: "#435260",
      mazo: "#5f2e24",
    },
  },
  match: {
    scoreCard: {
      px: { xs: 0.8, sm: 2 },
      py: 0.55,
      borderRadius: "0 0 0.95rem 0.95rem",
      background: "linear-gradient(170deg, rgba(19, 43, 35, 0.9), rgba(7, 24, 20, 0.92))",
      border: "1px solid rgba(255,255,255,0.16)",
      borderTop: "none",
      boxShadow: "0 10px 20px rgba(0,0,0,0.34)",
    },
    topBadge: {
      px: { xs: 0.8, sm: 1.6 },
      py: 0.45,
      borderRadius: "0 0 0.8rem 0.8rem",
      bgcolor: "rgba(13, 27, 22, 0.89)",
      border: "1px solid rgba(255,255,255,0.15)",
      borderTop: "none",
      boxShadow: "0 8px 18px rgba(0,0,0,0.28)",
    },
    settingsButton: {
      bgcolor: "rgba(23, 18, 13, 0.96)",
      color: "warning.light",
      border: "1px solid rgba(255,255,255,0.2)",
      boxShadow: "0 8px 16px rgba(0,0,0,0.35)",
    },
    emptySeat: {
      borderRadius: "999px",
      border: "1px dashed rgba(255,255,255,0.35)",
      bgcolor: "rgba(7,15,12,0.5)",
      px: 1.05,
      py: 0.45,
      textAlign: "center",
      minWidth: "4.2rem",
    },
    announcementPanel: {
      borderRadius: "0.8rem",
      bgcolor: "rgba(14, 23, 20, 0.88)",
      border: "1px solid rgba(255,255,255,0.14)",
      boxShadow: "0 8px 14px rgba(0,0,0,0.28)",
    },
    handPanel: {
      borderRadius: "0.86rem",
      background:
        "linear-gradient(180deg, rgba(112,72,39,0.96) 0%, rgba(70,45,27,0.98) 18%, rgba(45,28,18,0.98) 100%)",
      border: "1px solid rgba(255,255,255,0.16)",
      overflow: "hidden",
      boxShadow:
        "0 10px 20px rgba(0,0,0,0.35), inset 0 2px 0 rgba(255,255,255,0.08), inset 0 -5px 12px rgba(0,0,0,0.28)",
    },
    waitingPanel: {
      borderRadius: "0.75rem",
      bgcolor: "rgba(33, 23, 16, 0.82)",
      border: "1px solid rgba(255,255,255,0.12)",
      boxShadow: "0 6px 14px rgba(0,0,0,0.24)",
    },
    dockShell: {
      borderRadius: "1rem 1rem 0 0",
      background:
        "linear-gradient(180deg, rgba(115,72,39,0.96) 0%, rgba(73,47,29,0.98) 16%, rgba(44,29,19,0.98) 100%)",
      border: "1px solid rgba(255,255,255,0.16)",
      borderBottom: "none",
      boxShadow:
        "0 11px 24px rgba(0,0,0,0.36), inset 0 2px 0 rgba(255,255,255,0.08), inset 0 -7px 14px rgba(0,0,0,0.28)",
      overflow: "visible",
    },
    dockDivider: {
      height: "1px",
      background:
        "linear-gradient(90deg, rgba(0,0,0,0), rgba(255,255,255,0.24) 18%, rgba(255,255,255,0.18) 82%, rgba(0,0,0,0))",
      opacity: 0.9,
    },
    dockCommandLane: {
      background:
        "linear-gradient(180deg, rgba(44,27,18,0.92) 0%, rgba(31,20,13,0.96) 100%)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
    },
    dockChatButton: {
      border: "1px solid rgba(255,255,255,0.2)",
      background:
        "linear-gradient(165deg, rgba(56,56,50,0.97), rgba(34,33,31,0.98))",
      boxShadow: "0 6px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)",
      color: "rgba(255,255,255,0.92)",
    },
    playedCardStack: {
      openScale: 1.45,
      openSpreadRatio: 0.52,
      restingShadow: "0 2px 3px rgba(0,0,0,0.16)",
      openShadow: "0 8px 12px rgba(0,0,0,0.24)",
      cardTransition:
        "transform 190ms cubic-bezier(0.2, 0.8, 0.2, 1), width 190ms cubic-bezier(0.2, 0.8, 0.2, 1), height 190ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 190ms ease",
    },
    cardPlayInteraction: {
      dragThresholdPx: 7,
      returnDurationMs: 180,
      dragScale: 1.055,
      dragFilter: "drop-shadow(0 14px 16px rgba(0,0,0,0.42))",
      dropBorderRadius: "clamp(1.4rem, 6vw, 4.2rem)",
      dropOutline: "1px dashed rgba(255,255,255,0.14)",
      activeDropOutline: "1px solid rgba(246,183,72,0.38)",
      activeDropShadow:
        "0 0 0 1px rgba(246,183,72,0.04), inset 0 0 24px rgba(246,183,72,0.065)",
      activeDropBackground: "rgba(246,183,72,0.02)",
      dropCueTransition:
        "outline-color 120ms ease, box-shadow 120ms ease, background-color 120ms ease",
      returnTransition:
        "left 180ms cubic-bezier(0.22, 1, 0.36, 1), top 180ms cubic-bezier(0.22, 1, 0.36, 1), width 180ms cubic-bezier(0.22, 1, 0.36, 1), height 180ms cubic-bezier(0.22, 1, 0.36, 1), transform 180ms cubic-bezier(0.22, 1, 0.36, 1)",
    },
    seatTurnRing: {
      alert: "#f6b748",
      extension: "#ff6554",
      normal: "#44cc7b",
      track: "rgba(255,255,255,0.14)",
      shadow: "drop-shadow(0 2px 5px rgba(0,0,0,0.35))",
    },
    seatAvatarFrame: {
      bgcolor: "rgba(0,0,0,0.28)",
      border: "2px solid rgba(201,126,59,0.95)",
      boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
    },
    seatNameBadge: {
      bgcolor: "rgba(11, 19, 16, 0.9)",
      color: "#f5efe3",
      border: "1px solid rgba(255,255,255,0.13)",
      boxShadow: "0 6px 10px rgba(0,0,0,0.24)",
    },
    seatNameBadgeMyTurn: {
      bgcolor: "rgba(245, 239, 227, 0.96)",
      color: "#102018",
      border: "1px solid rgba(255,255,255,0.74)",
      boxShadow: "0 6px 12px rgba(0,0,0,0.3)",
    },
    seatStatusDot: {
      border: "2px solid rgba(17,24,20,0.95)",
      boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
    },
  },
  seatAvatarBadges: {
    badge: {
      position: "absolute",
      zIndex: 5,
      width: "1.2rem",
      height: "1.2rem",
      borderRadius: "50%",
      display: "grid",
      placeItems: "center",
      background: "rgba(10, 18, 15, 0.94)",
      border: "1px solid rgba(255,255,255,0.22)",
      boxShadow: "0 3px 7px rgba(0,0,0,0.38)",
      pointerEvents: "auto",
    },
    mateBadge: {
      left: "-0.42rem",
      top: "-0.42rem",
      background: "linear-gradient(160deg, rgba(42,104,68,0.98), rgba(17,46,34,0.98))",
      borderColor: "rgba(136, 221, 157, 0.46)",
    },
    roleBadge: {
      left: "-0.36rem",
      bottom: "-0.36rem",
    },
    mateIcon: {
      color: "#9df0ad",
      fontSize: "0.84rem",
    },
    manoIcon: {
      color: "#f4d38a",
      fontSize: "0.78rem",
    },
    hostIcon: {
      color: "#ffd25f",
      fontSize: "0.78rem",
    },
  },
  seatChatBubble: {
    bubble: {
      px: 0.82,
      py: 0.46,
      borderRadius: "0.72rem",
      color: "rgba(255,255,255,0.96)",
      background: "rgba(9, 17, 15, 0.94)",
      border: "1px solid rgba(255,255,255,0.16)",
      boxShadow: "0 8px 16px rgba(0,0,0,0.35)",
      backdropFilter: "blur(8px)",
    },
    tail: {
      width: "0.58rem",
      height: "0.58rem",
      background: "rgba(9, 17, 15, 0.94)",
      border: "1px solid rgba(255,255,255,0.16)",
    },
  },
  lobby: {
    seatCard: {
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      background: "rgba(17, 28, 24, 0.87)",
      border: "1px solid rgba(255,255,255,0.12)",
      boxShadow: "0 10px 22px rgba(0,0,0,0.34)",
    },
    topPlayersCard: {
      px: 1.2,
      py: 0.8,
      borderRadius: "0 0 0.95rem 0.95rem",
      background:
        "linear-gradient(170deg, rgba(17, 43, 35, 0.86), rgba(6, 25, 20, 0.86))",
      border: "1px solid rgba(255,255,255,0.14)",
      borderTop: "none",
      boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
    },
    topSessionCard: {
      px: 1.6,
      py: 0.8,
      borderRadius: "0 0 0.9rem 0.9rem",
      bgcolor: "rgba(12, 24, 19, 0.85)",
      border: "1px solid rgba(255,255,255,0.14)",
      borderTop: "none",
      boxShadow: "0 9px 18px rgba(0,0,0,0.28)",
    },
    topSettingsButton: {
      px: 1,
      py: 0.8,
      borderRadius: "0 0 0.9rem 0.9rem",
      bgcolor: "rgba(16, 27, 22, 0.9)",
      border: "1px solid rgba(255,255,255,0.14)",
      borderTop: "none",
      boxShadow: "0 9px 18px rgba(0,0,0,0.28)",
    },
    rulesPanel: {
      background: "rgba(10, 18, 15, 0.74)",
      border: "1px solid rgba(255,255,255,0.1)",
    },
    waitingHostCard: {
      bgcolor: "rgba(18, 27, 23, 0.84)",
      border: "1px solid rgba(255,255,255,0.1)",
    },
  },
  queue: {
    panel: {
      borderRadius: "0.75rem",
      background:
        "linear-gradient(180deg, rgba(23,38,31,0.76), rgba(11,22,18,0.78))",
      border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
    },
    segment: {
      color: "rgba(255,255,255,0.72)",
      borderColor: "rgba(255,255,255,0.16)",
      background: "rgba(8,16,13,0.34)",
    },
    activeSegment: {
      color: "rgba(255,255,255,0.95)",
      borderColor: "rgba(236,108,52,0.58)",
      background: "linear-gradient(180deg, rgba(236,108,52,0.86), rgba(179,76,36,0.88))",
    },
    statusPanel: {
      borderRadius: "0.62rem",
      background: "rgba(0,0,0,0.22)",
      border: "1px solid rgba(255,255,255,0.08)",
    },
    cancelButton: {
      border: "1px solid rgba(255,255,255,0.14)",
      background: "rgba(0,0,0,0.2)",
    },
  },
  chatDrawer: {
    chatMessages: {
      background: "linear-gradient(180deg, rgba(45, 29, 17, 0.92), rgba(12, 19, 16, 0.94))",
    },
    actionsPanelBorder: "1px solid rgba(255,255,255,0.12)",
    actionsPanelBackground:
      "linear-gradient(180deg, rgba(92,58,34,0.95), rgba(63,39,24,0.98) 40%, rgba(42,27,17,0.98))",
    actionsPanelShadow: "0 8px 18px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.06)",
    actionButtonBorder: "1px solid rgba(255,255,255,0.2)",
    actionButtonBackground:
      "linear-gradient(165deg, rgba(52,52,48,0.97), rgba(31,30,28,0.97))",
    actionButtonShadow: "0 6px 12px rgba(0,0,0,0.35)",
    announcementPanelBorder: "1px solid rgba(255,255,255,0.12)",
    announcementPanelBackground: "rgba(9,16,14,0.94)",
    announcementPanelShadow: "0 10px 26px rgba(0,0,0,0.4)",
    drawerPanelBackground:
      "linear-gradient(180deg, rgba(17,24,22,0.98), rgba(9,14,13,0.99))",
    drawerPanelBorderTop: "1px solid rgba(255,255,255,0.12)",
    railWidth: "19.5rem",
    railBorder: "1px solid rgba(255,255,255,0.14)",
    railBackground:
      "radial-gradient(120% 90% at 8% 8%, rgba(255,255,255,0.07), transparent 52%), linear-gradient(175deg, rgba(74,46,28,0.95), rgba(40,26,18,0.98) 28%, rgba(18,22,20,0.98) 72%, rgba(12,17,15,0.99))",
    railShadow: "0 12px 26px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.06)",
    railHeaderBackground: "linear-gradient(180deg, rgba(18,30,25,0.66), rgba(11,18,16,0.35))",
    railHeaderBorderBottom: "1px solid rgba(255,255,255,0.12)",
  },
};

export const lightPalette = createPalette({
  mode: "light",
  primary: {
    main: "#ec6c34",
    dark: "#d15829",
    light: "#f17e59",
    contrastText: "#000",
  },
  secondary: {
    main: "#9c548c",
    dark: "#6d315e",
    light: "#c28fb5",
    contrastText: "#000",
  },
  success: {
    main: "#749424",
    dark: "#5d751c",
    light: "#8bc450",
    contrastText: "#000",
  },
  warning: {
    main: "#c4941c",
    dark: "#a0721a",
    light: "#e2b246",
    contrastText: "#000",
  },
  info: {
    main: "#248493",
    dark: "#1c6a7a",
    light: "#4a9bb2",
    contrastText: "#000",
  },
  twitter: {
    main: "#00acee",
    dark: "#1381ab",
    light: "#40bbea",
    contrastText: "#000",
  },
  error: {
    main: "#94342c",
    dark: "#6f2821",
    light: "#b54940",
    contrastText: "#000",
  },
  background: {
    default: "#f0f4f3",
    paper: "#FEFFFD",
  },
  text: {
    primary: "rgba(0, 0, 0, 0.87)",
    secondary: "#03030b",
    disabled: "rgba(0, 0, 0, 0.33)",
  },
});

export const defaultPalette = createPalette({
  mode: "dark",
  primary: {
    main: "#ec6c34",
    dark: "#d15829",
    light: "#f17e59",
    contrastText: "#fff",
  },
  secondary: {
    main: "#9c548c",
    dark: "#6d315e",
    light: "#c28fb5",
    contrastText: "#fff",
  },
  success: {
    main: "#749424",
    dark: "#5d751c",
    light: "#8bc450",
    contrastText: "#fff",
  },
  warning: {
    main: "#c4941c",
    dark: "#a0721a",
    light: "#e2b246",
    contrastText: "#fff",
  },
  info: {
    main: "#248493",
    dark: "#1c6a7a",
    light: "#4a9bb2",
    contrastText: "#fff",
  },
  error: {
    main: "#94342c",
    dark: "#6f2821",
    light: "#b54940",
    contrastText: "#fff",
  },
  twitter: {
    main: "#00acee",
    dark: "#1381ab",
    light: "#40bbea",
    contrastText: "#000",
  },
  background: {
    paper: "#182c1c",
    default: "#243728",
  },
  text: {
    primary: "rgba(255, 255, 255, 0.87)",
    secondary: "#f9eefb",
    disabled: "rgba(255, 255, 255, 0.3)",
  },
});

export const darkPalette = createPalette({
  mode: "dark",
  primary: {
    main: "#ec6c34",
    dark: "#d15829",
    light: "#f17e59",
    contrastText: "#fff",
  },
  secondary: {
    main: "#9c548c",
    dark: "#6d315e",
    light: "#c28fb5",
    contrastText: "#fff",
  },
  success: {
    main: "#4c944c",
    dark: "#3c703c",
    light: "#5fa65f",
    contrastText: "#fff",
  },
  warning: {
    main: "#d79a3e",
    dark: "#ad7d31",
    light: "#e1b665",
    contrastText: "#fff",
  },
  info: {
    main: "#4e9dbd",
    dark: "#3a7a99",
    light: "#6fb9d1",
    contrastText: "#fff",
  },
  error: {
    main: "#c13f3a",
    dark: "#9f3430",
    light: "#d77772",
    contrastText: "#fff",
  },
  twitter: {
    main: "#00acee",
    dark: "#1381ab",
    light: "#40bbea",
    contrastText: "#000",
  },
  background: {
    paper: "#161516",
    default: "#000",
  },
  text: {
    primary: "rgba(255, 255, 255, 0.87)",
    secondary: "#f9eefb",
    disabled: "rgba(255, 255, 255, 0.3)",
  },
});

const base = {
  trucoshiUi: defaultTrucoshiUiTokens,
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme: Theme) => ({
        html: {
          minHeight: "100%",
          overscrollBehaviorY: "none",
          backgroundColor: theme.trucoshiUi.shell.backgroundColor,
        },
        body: {
          minHeight: "var(--trucoshi-viewport-height, 100dvh)",
          overscrollBehaviorY: "none",
          background: theme.trucoshiUi.shell.background,
        },
      }),
    },
    MuiLinearProgress: {
      styleOverrides: {
        bar: {
          transition: "none",
        },
      },
    },
    MuiButton: {
      variants: [
        {
          props: { variant: "card" },
          style: ({ theme }) => ({
            padding: 0,
            minWidth: "initial",
            minHeight: "initial",
            color: theme.palette.background.paper,
            border: "none",
            ":hover": {},
          }),
        },
        {
          props: { variant: "emojicard" },
          style: ({ theme }) => ({
            minWidth: "initial",
            padding: 0,
            backgroundColor: theme.palette.text.secondary,
            color: theme.palette.getContrastText(theme.palette.text.secondary),
            border: `1px solid ${theme.palette.background.paper}`,
            ":active": {
              background: theme.palette.text.secondary,
            },
            ":hover": {
              backgroundColor: theme.palette.text.secondary,
            },
          }),
        },
        {
          props: { variant: "emojicard", name: BURNT_CARD },
          style: ({ theme }) => ({
            border: "1px solid",
            color: theme.palette.background.paper,
            background: theme.palette.error.main,
            ":active": {
              background: theme.palette.error.main,
            },
            ":hover": {
              background: theme.palette.error.main,
            },
          }),
        },
      ],
    },
    MuiPaper: {
      styleOverrides: {
        root: () => ({
          backgroundImage: "none",
        }),
      },
    },
    MuiListItem: {
      styleOverrides: {
        divider: ({ theme }) => ({
          borderColor: theme.palette.background.default,
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          background: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.background.default}`,
        }),
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: ({ theme }) => ({
          background: theme.palette.background.paper,
        }),
      },
    },
    MuiTypography: {
      variants: [
        {
          props: { color: "success" },
          style: ({ theme }) => ({
            color: theme.palette.success.main,
          }),
        },
        {
          props: { color: "warning" },
          style: ({ theme }) => ({
            color: theme.palette.warning.main,
          }),
        },
      ],
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: "none",
          "&:hover": {
            opacity: 0.5,
          },
        },
      },
    },
  },
} satisfies ThemeOptions;

export const light = createTheme({
  palette: lightPalette,
  ...base,
  trucoshiUi: {
    ...defaultTrucoshiUiTokens,
    shell: {
      ...defaultTrucoshiUiTokens.shell,
      background: LIGHT_SHELL_BACKGROUND,
      backgroundColor: "#f5eee7",
    },
    content: {
      ...defaultTrucoshiUiTokens.content,
      surface: "rgba(255,255,255,0.76)",
      navigationSurface: "rgba(22,54,38,0.055)",
      divider: "rgba(31,58,43,0.16)",
      textPrimary: "#173022",
      textSecondary: "#4d6255",
      cardShadow: "0 24px 46px rgba(48,68,54,0.18), 0 4px 12px rgba(48,68,54,0.12)",
    },
    home: {
      panel: {
        ...defaultTrucoshiUiTokens.home.panel,
        border: "1px solid rgba(62,54,43,0.13)",
        background: "rgba(255,255,255,0.55)",
      },
    },
  },
} satisfies ThemeOptions);

export const dark = createTheme({
  palette: darkPalette,
  ...base,
  trucoshiUi: {
    ...defaultTrucoshiUiTokens,
    shell: {
      ...defaultTrucoshiUiTokens.shell,
      background: DARK_SHELL_BACKGROUND,
      backgroundColor: "#010302",
    },
    home: {
      panel: {
        ...defaultTrucoshiUiTokens.home.panel,
        border: "1px solid rgba(245,239,226,0.11)",
        background: "rgba(255,255,255,0.045)",
      },
    },
    board: {
      ...defaultTrucoshiUiTokens.board,
      shellBackground: DARK_BOARD_SHELL_BACKGROUND,
    },
  },
} satisfies ThemeOptions);

export const trucoshi = createTheme({
  palette: defaultPalette,
  ...base,
} satisfies ThemeOptions);

export const themes = { trucoshi, light, dark };
