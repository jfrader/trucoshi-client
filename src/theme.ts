import { createTheme, ThemeOptions } from "@mui/material";
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
  treasure: {
    overlayBackground: string;
    stageGlow: string;
    chestShadow: string;
    panelSurface: string;
    panelBorder: string;
    progressTrack: string;
    progressFill: string;
    rewardFrame: Record<string, any>;
    actionButton: Record<string, any>;
    secondaryButton: Record<string, any>;
    rarityStyles: Record<string, Record<string, any>>;
  };
  inventory: {
    surfaceFrame: Record<string, any>;
    pageShell: Record<string, any>;
    pageHeader: Record<string, any>;
    displayTool: Record<string, any>;
    cardLabel: Record<string, any>;
    countBadge: Record<string, any>;
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
    seatTurnRing: {
      alert: string;
      extension: string;
      normal: string;
      track: string;
      shadow: string;
    };
    seatAvatarFrame: Record<string, any>;
    seatNameBadge: Record<string, any>;
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
    tutorialBubble: Record<string, any>;
    tutorialTail: Record<string, any>;
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
    segmentGroup: Record<string, any>;
    segment: Record<string, any>;
    activeSegment: Record<string, any>;
    statusPanel: Record<string, any>;
    cancelButton: Record<string, any>;
    cancelProgress: Record<string, any>;
    optionLabel: Record<string, any>;
    matchFoundContent: Record<string, any>;
    participantList: Record<string, any>;
    participantChip: Record<string, any>;
    participantReadyChip: Record<string, any>;
    participantPendingChip: Record<string, any>;
    participantStatusDot: Record<string, any>;
    participantReadyStatusDot: Record<string, any>;
    participantPendingStatusDot: Record<string, any>;
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

const defaultTrucoshiUiTokens: TrucoshiUiTokens = {
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
  treasure: {
    overlayBackground:
      "radial-gradient(circle at 50% 34%, rgba(248, 184, 55, 0.22), transparent 28%), radial-gradient(circle at 50% 72%, rgba(20, 96, 72, 0.32), transparent 38%), linear-gradient(180deg, rgba(7, 13, 11, 0.96), rgba(1, 3, 3, 0.98))",
    stageGlow:
      "radial-gradient(circle at 50% 54%, rgba(255, 196, 68, 0.44), rgba(255, 196, 68, 0.16) 24%, transparent 58%)",
    chestShadow:
      "drop-shadow(0 22px 24px rgba(0,0,0,0.5)) drop-shadow(0 0 24px rgba(255,177,40,0.22))",
    panelSurface: "linear-gradient(155deg, rgba(33, 26, 17, 0.92), rgba(10, 22, 18, 0.86))",
    panelBorder: "1px solid rgba(255,255,255,0.14)",
    progressTrack: "rgba(255,255,255,0.08)",
    progressFill: "linear-gradient(90deg, #d79a3e, #e4c46b)",
    rewardFrame: {
      borderRadius: "1rem",
      background: "linear-gradient(180deg, rgba(45, 29, 17, 0.92), rgba(12, 19, 16, 0.94))",
      border: "1px solid rgba(255,255,255,0.18)",
      boxShadow: "0 16px 34px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.08)",
    },
    actionButton: {
      borderRadius: "999px",
      px: 2.4,
      py: 0.8,
      fontWeight: 900,
      boxShadow: "0 10px 22px rgba(0,0,0,0.35)",
    },
    secondaryButton: {
      borderColor: "rgba(255,255,255,0.18)",
      color: "rgba(255,255,255,0.68)",
      fontWeight: 800,
      "&:hover": {
        borderColor: "rgba(255,255,255,0.28)",
        backgroundColor: "rgba(255,255,255,0.05)",
      },
    },
    rarityStyles: {
      COMMON: {
        color: "#f3e6bd",
        background: "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))",
        border: "1px solid rgba(255,255,255,0.22)",
        boxShadow: "0 0 14px rgba(255,255,255,0.08)",
        textShadow: "0 0 8px rgba(255,255,255,0.26)",
      },
      RARE: {
        color: "#9ff7a5",
        background: "linear-gradient(180deg, rgba(92,220,102,0.24), rgba(30,111,49,0.12))",
        border: "1px solid rgba(142,255,156,0.38)",
        boxShadow: "0 0 18px rgba(94,255,111,0.18)",
        textShadow: "0 0 10px rgba(130,255,142,0.5)",
      },
      EPIC: {
        color: "#d8b4ff",
        background: "linear-gradient(180deg, rgba(157,88,255,0.26), rgba(81,35,137,0.15))",
        border: "1px solid rgba(218,183,255,0.42)",
        boxShadow: "0 0 20px rgba(173,100,255,0.22)",
        textShadow: "0 0 12px rgba(216,180,255,0.55)",
      },
      LEGENDARY: {
        color: "#ffd35a",
        background: "linear-gradient(180deg, rgba(255,196,62,0.32), rgba(124,70,15,0.18))",
        border: "1px solid rgba(255,218,105,0.58)",
        boxShadow: "0 0 24px rgba(255,193,55,0.36), inset 0 1px 0 rgba(255,255,255,0.2)",
        textShadow: "0 0 14px rgba(255,213,79,0.8)",
      },
      PROMO: {
        color: "#8ef7ff",
        background: "linear-gradient(180deg, rgba(75,222,235,0.24), rgba(23,86,98,0.14))",
        border: "1px solid rgba(142,247,255,0.44)",
        boxShadow: "0 0 20px rgba(76,228,241,0.24)",
        textShadow: "0 0 12px rgba(142,247,255,0.6)",
      },
    },
  },
  inventory: {
    surfaceFrame: {
      borderRadius: "1.2rem",
      border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "0 12px 24px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.06)",
    },
    pageShell: {
      maxWidth: { xs: "100%", lg: "86rem", xl: "94rem" },
      px: { xs: 1.35, sm: 2.25, lg: 3.5 },
    },
    pageHeader: {
      px: { xs: 1.35, sm: 1.8, lg: 2.25 },
      py: { xs: 1.25, sm: 1.6, lg: 1.85 },
      borderRadius: "1.2rem",
      background: "linear-gradient(135deg, rgba(31, 61, 42, 0.68), rgba(10, 28, 21, 0.48))",
    },
    displayTool: {
      width: 44,
      height: 44,
      borderRadius: "0.9rem",
      backgroundColor: "rgba(255,255,255,0.07)",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "warning.light",
      "&:hover": {
        backgroundColor: "rgba(255,255,255,0.12)",
      },
    },
    cardLabel: {
      fontSize: { xs: "1rem", sm: "1.08rem", lg: "1.18rem" },
      lineHeight: 1.12,
      textShadow: "0 1px 4px rgba(0,0,0,0.42)",
    },
    countBadge: {
      fontSize: { xs: "1.05rem", sm: "1.14rem", lg: "1.24rem" },
      lineHeight: 1,
      textShadow: "0 2px 5px rgba(0,0,0,0.55)",
    },
  },
  match: {
    scoreCard: {
      px: { xs: 1.2, sm: 1.35 },
      py: { xs: 0.55, sm: 0.7 },
      minWidth: { xs: "5.2rem", sm: "5.55rem" },
      borderRadius: "0.95rem",
      background: "linear-gradient(170deg, rgba(19, 43, 35, 0.9), rgba(7, 24, 20, 0.92))",
      border: "1px solid rgba(255,255,255,0.16)",
      boxShadow: "0 10px 20px rgba(0,0,0,0.34)",
    },
    topBadge: {
      px: { xs: 1.35, sm: 1.6 },
      py: { xs: 0.56, sm: 0.7 },
      borderRadius: "0.8rem",
      bgcolor: "rgba(13, 27, 22, 0.89)",
      border: "1px solid rgba(255,255,255,0.15)",
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
      background: "linear-gradient(180deg, rgba(44,27,18,0.92) 0%, rgba(31,20,13,0.96) 100%)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
    },
    dockChatButton: {
      border: "1px solid rgba(255,255,255,0.2)",
      background: "linear-gradient(165deg, rgba(56,56,50,0.97), rgba(34,33,31,0.98))",
      boxShadow: "0 6px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)",
      color: "rgba(255,255,255,0.92)",
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
      border: "1px solid rgba(255,255,255,0.13)",
      boxShadow: "0 6px 10px rgba(0,0,0,0.24)",
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
    tutorialBubble: {
      px: 1.05,
      py: 0.72,
      color: "#1f1a14",
      background: "rgba(255,255,255,0.96)",
      border: "1px solid rgba(255,255,255,0.8)",
      boxShadow: "0 10px 22px rgba(0,0,0,0.34)",
      backdropFilter: "blur(10px)",
    },
    tutorialTail: {
      background: "rgba(255,255,255,0.96)",
      border: "1px solid rgba(255,255,255,0.8)",
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
      background: "linear-gradient(170deg, rgba(17, 43, 35, 0.86), rgba(6, 25, 20, 0.86))",
      border: "1px solid rgba(255,255,255,0.14)",
    },
    topSessionCard: {
      bgcolor: "rgba(12, 24, 19, 0.85)",
      border: "1px solid rgba(255,255,255,0.14)",
    },
    topSettingsButton: {
      bgcolor: "rgba(16, 27, 22, 0.9)",
      border: "1px solid rgba(255,255,255,0.14)",
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
      background: "linear-gradient(180deg, rgba(23,38,31,0.76), rgba(11,22,18,0.78))",
      border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
    },
    segmentGroup: {
      gap: "0.375rem",
    },
    segment: {
      color: "rgba(255,255,255,0.72)",
      borderColor: "rgba(255,255,255,0.16)",
      background: "rgba(8,16,13,0.34)",
      borderRadius: "0.55rem !important",
      minHeight: "2.5rem",
      fontWeight: 800,
      minWidth: 0,
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
      padding: "0.375rem 0.5rem",
    },
    cancelButton: {
      border: "1px solid rgba(255,255,255,0.14)",
      background: "rgba(0,0,0,0.2)",
      width: "2.75rem",
      height: "2.75rem",
    },
    cancelProgress: {
      marginRight: "0.5rem",
      position: "absolute",
    },
    optionLabel: {
      margin: 0,
      minWidth: 0,
    },
    matchFoundContent: {
      gap: "1.1rem",
      paddingTop: "2em",
      paddingBottom: "2em",
      justifyContent: "center",
      alignItems: "center",
      display: "flex",
      minWidth: "min(88vw, 420px)",
      borderRadius: "2em",
      border: "1px solid rgba(255,255,255,0.1)",
      backgroundColor: "rgba(148, 52, 44, 0.1)",
    },
    participantList: {
      gap: "0.5rem",
      justifyContent: "center",
      maxWidth: "100%",
    },
    participantChip: {
      gap: "0.4rem",
      borderRadius: "0.32rem",
      padding: "0.375rem 0.55rem",
      minWidth: 128,
      maxWidth: 180,
    },
    participantReadyChip: {
      border: "1px solid #5d751c",
      backgroundColor: "rgba(116, 148, 36, 0.18)",
    },
    participantPendingChip: {
      border: "1px solid #6f2821",
      backgroundColor: "rgba(148, 52, 44, 0.15)",
    },
    participantStatusDot: {
      width: 10,
      height: 10,
      borderRadius: "50%",
      flex: "0 0 auto",
    },
    participantReadyStatusDot: {
      boxShadow: "0 0 0 3px rgba(116, 148, 36, 0.2)",
    },
    participantPendingStatusDot: {
      boxShadow: "0 0 0 3px rgba(148, 52, 44, 0.18)",
    },
  },
  chatDrawer: {
    chatMessages:   {
      background: "linear-gradient(180deg, rgba(45, 29, 17, 0.92), rgba(12, 19, 16, 0.94))",
    },
    actionsPanelBorder: "1px solid rgba(255,255,255,0.12)",
    actionsPanelBackground:
      "linear-gradient(180deg, rgba(92,58,34,0.95), rgba(63,39,24,0.98) 40%, rgba(42,27,17,0.98))",
    actionsPanelShadow: "0 8px 18px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.06)",
    actionButtonBorder: "1px solid rgba(255,255,255,0.2)",
    actionButtonBackground: "linear-gradient(165deg, rgba(52,52,48,0.97), rgba(31,30,28,0.97))",
    actionButtonShadow: "0 6px 12px rgba(0,0,0,0.35)",
    announcementPanelBorder: "1px solid rgba(255,255,255,0.12)",
    announcementPanelBackground: "rgba(9,16,14,0.94)",
    announcementPanelShadow: "0 10px 26px rgba(0,0,0,0.4)",
    drawerPanelBackground: "linear-gradient(180deg, rgba(17,24,22,0.98), rgba(9,14,13,0.99))",
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
        // {
        //   props: { variant: "emojicard", name: "1e" },
        //   style: () => ({
        //     animation: `${glow} 1s infinite alternate`,
        //   }),
        // },
        // {
        //   props: { variant: "card", name: "1e" },
        //   style: () => ({
        //     animation: `${glow} 1s infinite alternate`,
        //   }),
        // },
        {
          props: { variant: "emojicard", name: BURNT_CARD },
          style: ({ theme }) => ({
            border: "1px solid",
            color: theme.palette.background.paper,
            background: theme.palette.error.main,
            // backgroundImage: "url(/trucoshi-logo.svg)",
            // backgroundRepeat: "no-repeat",
            // backgroundPosition: "center center",
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
} satisfies ThemeOptions);

export const dark = createTheme({
  palette: darkPalette,
  ...base,
} satisfies ThemeOptions);

export const trucoshi = createTheme({
  palette: defaultPalette,
  ...base,
} satisfies ThemeOptions);

export const themes = { trucoshi, light, dark };
