import { Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ECommand,
  EMatchTableState,
  ICard,
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
  id: string | null;
  session: string | null;
  lastPong: string | null;
  isConnected: boolean;
  isLogged: boolean;
  publicMatches: Array<IPublicMatchInfo>;
  activeMatches: Array<IPublicMatchInfo>;
}

export interface ITrucoshiActions {
  fetchPublicMatches(filters?: { state?: Array<EMatchTableState> }): void;
  sendPing(): void;
  sendUserId(id: string): void;
}

export interface ITrucoshiMatchActions {
  startMatch(): void;
  createMatch(callback: ICallbackMatchUpdate): void;
  joinMatch(sessionId: string, teamIdx?: 0 | 1): void;
  setReady(sessionId: string, ready: boolean): void;
  playCard(cardIdx: number, card: ICard): void;
  sayCommand(command: ECommand): void;
  isMe(player: IPublicPlayer): boolean;
}

export interface ITrucoshiContext {
  state: ITrucoshiState;
  dispatch: ITrucoshiActions;
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
}

export type ICallbackMatchUpdate = (error: unknown, match?: IPublicMatch) => void;

export type IWaitingPlayResolveFn = ((data: IWaitingPlayData) => void) | null;
