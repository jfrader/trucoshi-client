import {
  useState,
  useCallback,
  useEffect,
  PropsWithChildren,
  useMemo,
  useRef,
  SetStateAction,
} from "react";
import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  EClientEvent,
  EServerEvent,
  ICard,
  IJoinQueueOptions,
  IPublicNoticeBanner,
  IPublicMatchInfo,
  IQueueStatus,
  ServerToClientEvents,
  EMatchState,
  ITreasureOpenResult,
  ITreasureStatus,
  ITrucoshiStats,
} from "trucoshi";
import useStateStorage from "../hooks/useStateStorage";
import { createContext } from "react";
import { ICardTheme, IRewardCodeRedeemOutcome, ITrucoshiContext } from "./types";
import { CardDisplayMode } from "./cards/cardSkinResolver";
import { CardInspectionInput, normalizeCardInspection } from "./cards/cardInspection";
import { CardSkinId, IEquippedDeck, IInventoryCardGroup } from "./cards/skinRegistry";
import { useCards } from "./hooks/useCards";
import { useMe } from "../api/hooks/useMe";
import { useCookies } from "react-cookie";
import { User } from "lightning-accounts";
import { useLogout } from "../api/hooks/useLogout";
import { useRefreshTokens } from "../api/hooks/useRefreshTokens";
import { is401 } from "../api/apiClient";
import { useLogin } from "../api/hooks/useLogin";
import { useToast } from "../hooks/useToast";
import { useUpdateProfile } from "../api/hooks/useUpdateProfile";
import { getCookieName, getIdentityCookie } from "../utils/cookie";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

const HOST = import.meta.env.VITE_APP_HOST || "http://localhost:4001";
const CLIENT_VERSION = import.meta.env.VITE_APP_VERSION || "";
export const CLIENT_ENVIRONMENT = import.meta.env.VITE_APP_ENVIRONMENT || "development";

export const TrucoshiContext = createContext<ITrucoshiContext | null>(null);

const emptyTreasureStatus: ITreasureStatus = {
  progress: 0,
  threshold: 3,
  unopenedChests: [],
};

const sendPing = (socket: Socket<ServerToClientEvents, ClientToServerEvents>) => {
  socket.emit(EClientEvent.PING, Date.now());
};

export const TrucoshiProvider = ({ children }: PropsWithChildren) => {
  const [loggingOut, setLoggingOut] = useState(false);
  const [session, setSession] = useStateStorage<string | null>("session", null);
  const [dark, setDark] = useStateStorage<"true" | "">("isDarkTheme", "true");
  const [name, setName] = useStateStorage<string>("id", "Satoshi");
  const [account, setAccount] = useState<User | null>(null);
  const [publicMatches, setPublicMatches] = useState<Array<IPublicMatchInfo>>([]);
  const [activeMatches, setActiveMatches] = useState<Array<IPublicMatchInfo>>([]);
  const [queueStatus, setQueueStatus] = useState<IQueueStatus | null>(null);
  const [isQueueing, setQueueing] = useState(false);
  const [queueReplayOptions, setQueueReplayOptions] = useState<IJoinQueueOptions | null>(null);
  const [isLoadingAccount, setLoadingAccount] = useState(true);
  const [isConnected, setConnected] = useState<boolean>(false);
  const [isLogged, setLogged] = useState<boolean>(false);
  const [lastPong, setLastPong] = useState<number | null>(null);
  const [serverAheadTime, setServerAheadTime] = useState<number>(0);
  const [cardTheme, setCardTheme] = useStateStorage<ICardTheme>("cardtheme", "default");
  const [cardDisplayMode, setCardDisplayMode] = useStateStorage<CardDisplayMode>(
    "cardDisplayMode",
    "skins"
  );
  const [inventory, setInventory] = useState<IInventoryCardGroup[]>([]);
  const [equippedDeck, setEquippedDeck] = useState<IEquippedDeck>({});
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [treasureStatus, setTreasureStatus] = useState<ITreasureStatus>(emptyTreasureStatus);
  const [treasureLoading, setTreasureLoading] = useState(false);
  const [treasureOpening, setTreasureOpening] = useState(false);
  const [treasureResult, setTreasureResult] = useState<ITreasureOpenResult | null>(null);
  const [cards, cardsReady, cardsLoading] = useCards({ theme: cardTheme });
  const [inspectedCard, setInspectedCard] = useState(normalizeCardInspection(null));
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [version, setVersion] = useState("");
  const [shouldConnect, setShouldConnect] = useState(false);
  const [stats, setStats] = useState<ITrucoshiStats>({ onlinePlayers: [] });
  const [noticeBanner, setNoticeBanner] = useState<IPublicNoticeBanner | null>(null);
  const [, , removeCookie] = useCookies([getCookieName("identity")]);

  const { me, error, isFetching: isPendingMe, refetch: refetchMe } = useMe();
  const { isPending: isPendingRefreshTokens } = useRefreshTokens();
  const { logout: apiLogout } = useLogout();
  const { isPending: isPendingLogin } = useLogin();
  const { updateProfile, isPending: isPendingUpdateProfile } = useUpdateProfile();
  const toast = useToast();
  const queryClient = useQueryClient();
  const timer = useRef<NodeJS.Timer | null>(null);

  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents>>(() =>
    io(HOST, {
      withCredentials: true,
      autoConnect: false,
      secure: import.meta.env.MODE === "production",
      auth: (cb) => {
        const cachedMe = queryClient.getQueryData<AxiosResponse<User>>(["me"])?.data;
        cb({
          sessionID: localStorage.getItem(`trucoshi:session`),
          name,
          identity: cachedMe ? getIdentityCookie() : undefined,
          user: cachedMe,
        });
      },
    })
  );

  useEffect(() => {
    setShouldConnect(!isPendingLogin && !isPendingMe && !!(me || error) && !loggingOut);
  }, [error, isPendingMe, loggingOut, me, isPendingLogin]);

  useEffect(() => {
    if (shouldConnect) {
      timer.current && clearInterval(timer.current);
      setSocket((current) => {
        let userId;
        let authName;

        (current as any).auth((data: any) => {
          userId = data.user?.id;
          authName = data.name;
        });

        const meId = account?.id;

        if (me && userId === meId) {
          setAccount(me);
        } else {
          setAccount(null);
        }

        if (current.active && userId === meId && authName === name) {
          if (!current.connected) {
            current.connect();
          }
          return current;
        }

        current.io.reconnection(false);
        current.disconnect();

        const newSocket = io(HOST, {
          withCredentials: true,
          autoConnect: false,
          secure: import.meta.env.MODE === "production",
          auth: (cb) => {
            const cachedMe = queryClient.getQueryData<AxiosResponse<User>>(["me"])?.data;
            cb({
              sessionID: localStorage.getItem(`trucoshi:session`),
              name,
              identity: cachedMe ? getIdentityCookie() : undefined,
              user: cachedMe,
            });
          },
        });
        newSocket.connect();
        return newSocket;
      });
    }
  }, [account?.id, me, name, queryClient, session, shouldConnect]);

  const logout = useCallback(() => {
    setLoggingOut(true);
    setLoadingAccount(true);
    setShouldConnect(false);
    socket.io.reconnection(false);
    socket.emit(EClientEvent.LOGOUT, () => {});
    apiLogout(
      { withCredentials: true },
      {
        onError(e) {
          toast.error(e.message);
        },
        onSettled() {
          queryClient.setQueryData(["me"], () => ({ data: null }));
          removeCookie(getCookieName("identity"));
          setLogged(false);
          setAccount(null);
          setActiveMatches([]);
          setQueueStatus(null);
          setQueueing(false);
          setQueueReplayOptions(null);
          setInventory([]);
          setEquippedDeck({});
          setInventoryLoading(false);
          setTimeout(() => {
            setLoggingOut(false);
            setShouldConnect(true);
          }, 1000);
        },
      }
    );
  }, [socket, apiLogout, toast, queryClient, removeCookie]);

  useEffect(() => {
    socket.on("connect", () => {
      setConnected(true);
      sendPing(socket);
      socket.emit(EClientEvent.JOIN_ROOM, "stats");
      socket.emit(EClientEvent.FETCH_NOTICE_BANNER, ({ success, noticeBanner }) => {
        if (success) {
          setNoticeBanner(noticeBanner);
        }
      });
      timer.current && clearInterval(timer.current);
    });

    socket.on("connect_error", () => {
      setLogged(false);
      setConnected(false);
      setLoadingAccount(true);
      setLoggingOut(true);

      timer.current && clearInterval(timer.current);
      timer.current = setInterval(() => {
        setLoggingOut(false);
        setShouldConnect(true);
      }, 5000);
    });

    socket.on("disconnect", () => {
      setLogged(false);
      setConnected(false);
      setLoadingAccount(true);
      setLoggingOut(true);

      timer.current && clearInterval(timer.current);
      timer.current = setInterval(() => {
        setLoggingOut(false);
        setShouldConnect(true);
      }, 5000);
    });

    socket.on(EServerEvent.UPDATE_STATS, (updated) => setStats(updated));
    socket.on(EServerEvent.UPDATE_NOTICE_BANNER, (updated) => setNoticeBanner(updated));

    socket.on(EServerEvent.SET_SESSION, ({ session, account }, serverVersion, newActiveMatches) => {
      if (account) {
        const logged = Boolean(me && me.id === account.id);
        if (logged && me) {
          setAccount(me);
        }
        setLogged(logged);
      } else {
        const cachedMe = queryClient.getQueryData<AxiosResponse<User>>(["me"])?.data;

        if (cachedMe?.id) {
          setShouldConnect(true);
          socket.disconnect();
          return;
        }

        setSession(session);
        setLogged(true);
      }

      setActiveMatches(newActiveMatches);
      setVersion(`${CLIENT_VERSION}-${serverVersion}`);
      setLoadingAccount(false);
    });

    socket.on(EServerEvent.UPDATE_ACTIVE_MATCHES, (newActiveMatches) => {
      setActiveMatches(newActiveMatches);
    });

    socket.on(EServerEvent.MATCH_DELETED, (deletedMatchSessionId) => {
      setActiveMatches((current) =>
        current.filter((m) => m.matchSessionId !== deletedMatchSessionId)
      );
    });

    socket.on(EServerEvent.PONG, (serverTime, clientTime) => {
      setLastPong(serverTime);
      setServerAheadTime(serverTime - clientTime);
    });

    socket.on(EServerEvent.REFRESH_IDENTITY, (userId, cb) => {
      if (!account || userId !== account.id) {
        return cb(null);
      }
      setShouldConnect(false);
      refetchMe()
        .then(() => {
          setTimeout(() => {
            const token = getIdentityCookie();
            if (token) {
              cb(token);
              setShouldConnect(true);
            }
          });
        })
        .catch(() => {
          cb(null);
        });
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off(EServerEvent.SET_SESSION);
      socket.off(EServerEvent.UPDATE_ACTIVE_MATCHES);
      socket.off(EServerEvent.MATCH_DELETED);
      socket.off(EServerEvent.PONG);
      socket.off(EServerEvent.REFRESH_IDENTITY);
      socket.off(EServerEvent.UPDATE_STATS);
      socket.off(EServerEvent.UPDATE_NOTICE_BANNER);
      timer.current && clearInterval(timer.current);
    };
  }, [socket, setSession, account, refetchMe, removeCookie, toast, logout, me, queryClient]);

  const sendUserId = useCallback(
    (newName: string, callback?: (name: string) => void) => {
      if (newName.length > 16) {
        toast.warning("Maximo 16 caracteres");
        return callback?.(account ? account.name : name);
      }

      if (account) {
        return updateProfile(
          { name: newName },
          {
            onSuccess() {
              refetchMe()
                .then((res) => {
                  if (res.data?.data) {
                    setAccount(res.data.data);
                    callback?.(res.data.data.name);
                  }
                })
                .catch((e) => {
                  toast.error(e.message);
                  callback?.(newName);
                });
            },
            onError(e) {
              toast.error(e.message);
              callback?.(newName);
            },
          }
        );
      }
      setName(newName);
      callback?.(newName);
    },
    [account, name, refetchMe, setName, toast, updateProfile]
  );

  const fetchPublicMatches = useCallback(
    (filters: { state?: Array<EMatchState> } = {}) => {
      socket.emit(EClientEvent.LIST_MATCHES, filters, ({ matches }) => {
        setPublicMatches(matches);
      });
    },
    [socket]
  );

  const fetchInventory = useCallback(() => {
    if (!account?.id || !isConnected) {
      setInventory([]);
      setEquippedDeck({});
      setInventoryLoading(false);
      return;
    }

    setInventoryLoading(true);
    socket.emit(EClientEvent.FETCH_INVENTORY, ({ success, inventory, equippedDeck, error }) => {
      setInventoryLoading(false);

      if (error) {
        toast.error(error.message);
      }

      if (success) {
        setInventory(inventory);
        setEquippedDeck(equippedDeck);
      }
    });
  }, [account?.id, isConnected, socket, toast]);

  const setDeckCardSkin = useCallback(
    (card: ICard, cardSkinId: CardSkinId | null) =>
      new Promise<boolean>((resolve) => {
        if (!account?.id || !isConnected) {
          resolve(false);
          return;
        }

        const previousInventory = inventory;
        const previousDeck = equippedDeck;

        const optimisticDeck = { ...equippedDeck };
        if (cardSkinId) {
          optimisticDeck[card] = cardSkinId;
        } else {
          delete optimisticDeck[card];
        }

        setEquippedDeck(optimisticDeck);
        setInventory((current) =>
          current.map((group) =>
            group.card === card
              ? {
                  ...group,
                  equippedCardSkinId: cardSkinId || undefined,
                  skins: group.skins.map((skin) => ({
                    ...skin,
                    equipped: skin.id === cardSkinId,
                  })),
                }
              : group
          )
        );

        socket.emit(
          EClientEvent.SET_DECK_CARD_SKIN,
          card,
          cardSkinId,
          ({ success, inventory, equippedDeck, error }) => {
            if (success) {
              setInventory(inventory);
              setEquippedDeck(equippedDeck);
              resolve(true);
              return;
            }

            setInventory(previousInventory);
            setEquippedDeck(previousDeck);

            if (error) {
              toast.error(error.message);
            }

            resolve(false);
          }
        );
      }),
    [account?.id, equippedDeck, inventory, isConnected, socket, toast]
  );

  const fetchTreasureStatus = useCallback(() => {
    if (!account?.id || !isConnected) {
      setTreasureStatus(emptyTreasureStatus);
      setTreasureLoading(false);
      return;
    }

    setTreasureLoading(true);
    socket.emit(EClientEvent.FETCH_TREASURE_STATUS, ({ success, treasureStatus, error }) => {
      setTreasureLoading(false);

      if (error) {
        toast.error(error.message);
      }

      if (success) {
        setTreasureStatus(treasureStatus);
      }
    });
  }, [account?.id, isConnected, socket, toast]);

  const openTreasureChest = useCallback(
    (chestId: number) =>
      new Promise<boolean>((resolve) => {
        if (!account?.id || !isConnected) {
          resolve(false);
          return;
        }

        setTreasureOpening(true);
        setTreasureResult(null);
        socket.emit(
          EClientEvent.OPEN_TREASURE_CHEST,
          chestId,
          ({ success, treasureStatus, treasureResult, inventory, equippedDeck, error }) => {
            setTreasureOpening(false);

            if (success) {
              setTreasureStatus(treasureStatus);
              setTreasureResult(treasureResult);
              setInventory(inventory);
              setEquippedDeck(equippedDeck);
              resolve(true);
              return;
            }

            if (error) {
              toast.error(error.message);
            }

            resolve(false);
          }
        );
      }),
    [account?.id, isConnected, socket, toast]
  );

  const devGrantTreasureChest = useCallback(
    () =>
      new Promise<boolean>((resolve) => {
        if (!account?.id || !isConnected) {
          resolve(false);
          return;
        }

        setTreasureLoading(true);
        socket.emit(EClientEvent.DEV_GRANT_TREASURE_CHEST, ({ success, treasureStatus, error }) => {
          setTreasureLoading(false);

          if (success) {
            setTreasureStatus(treasureStatus);
            resolve(true);
            return;
          }

          if (error) {
            toast.error(error.message);
          }

          resolve(false);
        });
      }),
    [account?.id, isConnected, socket, toast]
  );

  const redeemRewardCode = (code: string, options?: { silent?: boolean }) =>
    new Promise<IRewardCodeRedeemOutcome>((resolve) => {
      if (!account?.id || !isConnected) {
        resolve({ success: false });
        return;
      }

      setTreasureLoading(true);
      socket.emit(
        EClientEvent.REDEEM_REWARD_CODE,
        code,
        ({ success, treasureStatus, error }) => {
          setTreasureLoading(false);

          if (success) {
            setTreasureStatus(treasureStatus);
            if (!options?.silent) {
              toast.success("Cofre agregado al inventario");
            }
            resolve({ success: true });
            return;
          }

          if (error) {
            toast.error(error.message);
          }

          resolve({ success: false, errorCode: error?.code });
        }
      );
    });

  useEffect(() => {
    if (account?.id && isConnected) {
      fetchInventory();
      fetchTreasureStatus();
      return;
    }

    if (!account?.id) {
      setInventory([]);
      setEquippedDeck({});
      setInventoryLoading(false);
      setTreasureStatus(emptyTreasureStatus);
      setTreasureLoading(false);
      setTreasureOpening(false);
      setTreasureResult(null);
    }
  }, [account?.id, fetchInventory, fetchTreasureStatus, isConnected]);

  useEffect(() => {
    if (is401(error)) {
      logout();
    }
  }, [error, logout]);

  const inspectCard = useCallback((input: SetStateAction<CardInspectionInput>) => {
    setInspectedCard((current) => normalizeCardInspection(input, current));
  }, []);

  return (
    <TrucoshiContext.Provider
      value={{
        socket,
        state: {
          stats,
          noticeBanner,
          dark,
          account,
          version,
          publicMatches,
          session,
          name,
          isConnected,
          isLogged,
          lastPong,
          activeMatches,
          queueStatus,
          isQueueing,
          queueReplayOptions,
          serverAheadTime,
          cardTheme,
          inventory,
          equippedDeck,
          inventoryLoading,
          treasureStatus,
          treasureLoading,
          treasureOpening,
          treasureResult,
          cardDisplayMode,
          cardsReady,
          cardsLoading,
          isSidebarOpen,
          inspectedCard,
          isLoggingIn: isLoadingAccount || isPendingLogin,
          isAccountPending: useMemo(
            () =>
              isPendingMe ||
              isPendingRefreshTokens ||
              isLoadingAccount ||
              isPendingLogin ||
              isPendingUpdateProfile,
            [
              isPendingMe,
              isPendingRefreshTokens,
              isLoadingAccount,
              isPendingLogin,
              isPendingUpdateProfile,
            ]
          ),
          cards,
        },
        dispatch: {
          setDark,
          setCardTheme,
          fetchInventory,
          setDeckCardSkin,
          fetchTreasureStatus,
          openTreasureChest,
          devGrantTreasureChest,
          redeemRewardCode,
          setCardDisplayMode,
          setSidebarOpen,
          sendPing: () => sendPing(socket),
          sendUserId,
          setActiveMatches,
          setQueueStatus,
          setQueueing,
          setQueueReplayOptions,
          fetchPublicMatches,
          inspectCard,
          logout,
          refetchMe,
        },
      }}
    >
      {children}
    </TrucoshiContext.Provider>
  );
};
