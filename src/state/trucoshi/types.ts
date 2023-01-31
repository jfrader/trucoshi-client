import { Socket } from "socket.io-client";
import { IPublicMatch } from "trucoshi/dist/server/classes/MatchTable";
import { IWaitingPlayData } from "trucoshi/dist/server/types";

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
}

export interface ITrucoshiActions {
  sendPing(): void;
  sendUserId(id: string): void;
}

export interface ITrucoshiMatchActions {
  startMatch(): void;
  createMatch(callback: ICallbackMatchUpdate): void;
  fetchMatch(sessionId: string): void;
  joinMatch(sessionId: string): void;
  setReady(sessionId: string, ready: boolean): void;
  playCard(cardIdx: number): void;
}

export interface ITrucoshiContext {
  state: ITrucoshiState;
  dispatch: ITrucoshiActions;
  socket: Socket;
}

export type ICallbackMatchUpdate = (error: unknown, match?: IPublicMatch) => void;

export type IWaitingPlayResolveFn = ((data: IWaitingPlayData) => void) | null;
