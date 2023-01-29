import { IPublicMatch } from "trucoshi/dist/server/classes/MatchTable";

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
  match: IPublicMatch | null;
  isConnected: boolean;
  isLogged: boolean;
}

export interface ITrucoshiActions {
  sendPing(): void;
  setReady(sessionId: string, ready: boolean): void;
  getMatch(sessionId: string): void;
  startMatch(): void;
  createMatch(callback: ICallbackMatchUpdate): void;
  joinMatch(sessionId: string, callback: ICallbackMatchUpdate): void;
  sendUserId(id: string): void;
}

export interface ITrucoshiContext {
  state: ITrucoshiState;
  dispatch: ITrucoshiActions;
}

export type ICallbackMatchUpdate = (error: unknown, match?: IPublicMatch) => void;
