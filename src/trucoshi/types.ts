import { Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ECommand,
  EMatchState,
  ICard,
  ILobbyOptions,
  IMatchPreviousHand,
  IPublicMatch,
  IPublicPlayer,
  IWaitingPlayData,
  ServerToClientEvents,
} from "trucoshi";
import { IPublicMatchInfo } from "trucoshi";
import { CardSources } from "./hooks/useCards";
import { Dispatch, SetStateAction } from "react";
import { User } from "lightning-accounts";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

export enum ETrucoshiStateActions {
  SET_SESSION,
  SET_ID,
  SET_LAST_PONG,
  SET_CONNECTED,
  SET_LOGGED,
}

export type PropsWithPlayer<P = unknown> = P & { player: IPublicPlayer };

export interface ITrucoshiMatchActions {
  startMatch(): void;
  leaveMatch(): void;
  createMatch(callback: ICallbackMatchUpdate): void;
  joinMatch(sessionId: string, cb: (success: boolean) => void, teamIdx?: 0 | 1): void;
  setReady(sessionId: string, ready: boolean, cb: (success: boolean) => void): void;
  setOptions(options: Partial<ILobbyOptions>, cb: (success: boolean) => void): void;
  playCard(cardIdx: number, card: ICard): void;
  sayCommand(command: ECommand | number): void;
  nextHand(): void;
  kickPlayer(key: string): void;
}

export interface ITrucoshiMatchState {
  turnPlayer: IPublicPlayer | null;
  previousHand: IMatchPreviousHand | null;
  match: IPublicMatch | null;
  me: IPublicPlayer | null;
  error: Error | null;
  canPlay: boolean;
  canSay: boolean;
}

export interface ITrucoshiActions {
  setDark: Dispatch<SetStateAction<"" | "true">>;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  setActiveMatches(activeMatches: IPublicMatchInfo[]): void;
  fetchPublicMatches(filters?: { state?: Array<EMatchState> }): void;
  sendPing(): void;
  sendUserId(id: string, callback?: (name: string) => void): void;
  setCardTheme(theme: ICardTheme): void;
  inspectCard: Dispatch<SetStateAction<ICard | null>>;
  refetchMe: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<AxiosResponse<User, any>, AxiosError<unknown, any>>>;
  logout(): void;
}

export interface ITrucoshiState {
  dark: "" | "true";
  account: User | null;
  isAccountPending: boolean;
  version: string;
  name: string | null;
  session: string | null;
  lastPong: number | null;
  serverAheadTime: number;
  isConnected: boolean;
  isLogged: boolean;
  publicMatches: Array<IPublicMatchInfo>;
  activeMatches: Array<IPublicMatchInfo>;
  cardTheme: ICardTheme;
  cardsReady: boolean;
  inspectedCard: ICard | null;
  cards: CardSources;
  isSidebarOpen: boolean;
}

export interface ITrucoshiContext {
  state: ITrucoshiState;
  dispatch: ITrucoshiActions;
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
}

export type ICardTheme = "default" | "classic" | "gnu" | "modern" | "";

export type ICallbackMatchUpdate = (error: unknown, match?: IPublicMatch) => void;

export type IWaitingPlayResolveFn = ((data: IWaitingPlayData) => void) | null;
