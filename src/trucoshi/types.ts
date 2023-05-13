import { Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ECommand,
  EMatchState,
  ICard,
  IMatchPreviousHand,
  IPublicMatch,
  IPublicPlayer,
  IWaitingPlayData,
  ServerToClientEvents,
} from "trucoshi";
import { IPublicMatchInfo } from "trucoshi";

export enum ETrucoshiStateActions {
  SET_SESSION,
  SET_ID,
  SET_LAST_PONG,
  SET_CONNECTED,
  SET_LOGGED,
}

export interface ITrucoshiState {
  version: string;
  id: string | null;
  session: string | null;
  lastPong: number | null;
  serverAheadTime: number;
  isConnected: boolean;
  isLogged: boolean;
  publicMatches: Array<IPublicMatchInfo>;
  activeMatches: Array<IPublicMatchInfo>;
}

export type PropsWithPlayer<P = unknown> = P & { player: IPublicPlayer };

export interface ITrucoshiActions {
  setActiveMatches(activeMatches: IPublicMatchInfo[]): void;
  fetchPublicMatches(filters?: { state?: Array<EMatchState> }): void;
  sendPing(): void;
  sendUserId(id: string, callback?: () => void): void;
}

export interface ITrucoshiMatchActions {
  startMatch(): void;
  leaveMatch(): void;
  createMatch(callback: ICallbackMatchUpdate): void;
  joinMatch(sessionId: string, teamIdx?: 0 | 1): void;
  setReady(sessionId: string, ready: boolean): void;
  playCard(cardIdx: number, card: ICard): void;
  sayCommand(command: ECommand | number): void;
  nextHand(): void;
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

export interface ITrucoshiContext {
  state: ITrucoshiState;
  dispatch: ITrucoshiActions;
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
}

export type ICallbackMatchUpdate = (error: unknown, match?: IPublicMatch) => void;

export type IWaitingPlayResolveFn = ((data: IWaitingPlayData) => void) | null;
