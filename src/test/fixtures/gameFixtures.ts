import {
  ECommand,
  EMatchState,
  ETrucoCommand,
  ICard,
  IChatMessage,
  IPlayedCard,
  IPublicMatch,
  IPublicPlayer,
} from "trucoshi";
import { BoardLayoutModel, BoardSurface, buildBoardLayoutModel } from "../../board";
import { SeatLike, buildAlternatingSlots } from "../../components/game/TrucoBoardLayout";

type PlayerOverrides = Partial<IPublicPlayer> & { key: string; teamIdx: 0 | 1 };

export const buildPlayer = ({ key, teamIdx, ...overrides }: PlayerOverrides): IPublicPlayer =>
  ({
    id: Number(key.replace(/\D/g, "")) || 1,
    key,
    name: overrides.name || `Player ${key}`,
    avatarUrl: null,
    bot: false,
    teamIdx,
    hand: (overrides.hand || ["1e", "7o", "3c"]) as ICard[],
    isTurn: false,
    isMe: false,
    isOwner: false,
    ready: false,
    disabled: false,
    abandoned: false,
    points: 0,
    commands: [] as ECommand[],
    envido: [],
    isEnvidoTurn: false,
    ...overrides,
  }) as unknown as IPublicPlayer;

export const buildPlayers = (count: 2 | 4 | 6, meKey = "p1"): IPublicPlayer[] =>
  Array.from({ length: count }, (_, idx) => {
    const key = `p${idx + 1}`;
    return buildPlayer({
      key,
      teamIdx: (idx % 2) as 0 | 1,
      isMe: key === meKey,
      isOwner: key === meKey,
      ready: idx % 2 === 0,
      isTurn: idx === 0,
    });
  });

export const buildMatch = ({
  players = buildPlayers(4),
  maxPlayers = 4,
  state = EMatchState.READY,
}: {
  players?: IPublicPlayer[];
  maxPlayers?: 2 | 4 | 6;
  state?: EMatchState;
} = {}): IPublicMatch =>
  ({
    id: 77,
    state,
    busy: false,
    handState: "TRUCO",
    me: players.find((player) => player.isMe) || players[0],
    players,
    options: {
      matchPoint: 30,
      faltaEnvido: false,
      turnTime: 20,
      maxPlayers,
      flor: true,
      satsPerPlayer: 0,
    },
    teams: [
      { points: { malas: 12, buenas: 0 } },
      { points: { malas: 9, buenas: 0 } },
    ],
  }) as unknown as IPublicMatch;

export const buildLayout = (surface: BoardSurface, seats: number): BoardLayoutModel =>
  buildBoardLayoutModel({
    surface,
    totalSeats: seats,
    viewport: { width: 390, height: 844, aspectRatio: 390 / 844 },
  });

export const buildSlots = <T extends SeatLike>(players: T[], fill?: number) =>
  buildAlternatingSlots(players, fill);

export const buildAnnouncements = (): {
  latest: IChatMessage;
  previous: IChatMessage;
  third: IChatMessage;
} => ({
  latest: {
    id: 3,
    date: new Date().toISOString(),
    message: "Quiero",
    content: "Quiero",
    sound: null,
    command: ETrucoCommand.TRUCO,
    system: false,
    user: { key: "0" } as any,
  } as unknown as IChatMessage,
  previous: {
    id: 2,
    date: new Date().toISOString(),
    message: "Truco",
    content: "Truco",
    sound: null,
    command: ETrucoCommand.TRUCO,
    system: false,
    user: { key: "1" } as any,
  } as unknown as IChatMessage,
  third: {
    id: 1,
    date: new Date().toISOString(),
    message: "Envido",
    content: "Envido",
    sound: null,
    command: ETrucoCommand.TRUCO,
    system: false,
    user: { key: "0" } as any,
  } as unknown as IChatMessage,
});

export const buildRounds = (players: IPublicPlayer[]): IPlayedCard[][] => [
  players.slice(0, 4).map((player, idx) => ({
    key: `r1-${player.key}`,
    player,
    card: (["1e", "2e", "3e", "4e"][idx] || "1e") as ICard,
  })),
  players.slice(0, 4).map((player, idx) => ({
    key: `r2-${player.key}`,
    player,
    card: (["5e", "6e", "7e", "1o"][idx] || "5e") as ICard,
  })),
  players.slice(0, 4).map((player, idx) => ({
    key: `r3-${player.key}`,
    player,
    card: (["2o", "3o", "4o", "5o"][idx] || "2o") as ICard,
  })),
];
