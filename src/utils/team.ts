import type { IPublicMatch, IPublicPlayer, IPublicTeam } from "trucoshi";

export const DEFAULT_TEAM_NAMES: Record<0 | 1, string> = {
  0: "Naranja",
  1: "Violeta",
};

export const getDefaultTeamName = (teamIdx: 0 | 1) => DEFAULT_TEAM_NAMES[teamIdx];

export const getTeamName = (idx: number | IPublicTeam) => {
  if (typeof idx !== "number" && idx.name) {
    return idx.name;
  }
  return getDefaultTeamName(idx === 1 ? 1 : 0);
};

export const getTeamDisplayNameForPlayers = (
  players: IPublicPlayer[],
  teamIdx: 0 | 1,
  isOneVsOne: boolean,
  fallbackName = getTeamName(teamIdx),
) => {
  if (!isOneVsOne) return fallbackName;
  return players.find((candidate) => candidate.teamIdx === teamIdx)?.name || fallbackName;
};

export const getTeamDisplayName = (
  match: Pick<IPublicMatch, "options" | "players" | "teams">,
  teamIdx: 0 | 1,
) => {
  const teamName = match.teams[teamIdx]?.name || getTeamName(teamIdx);
  return getTeamDisplayNameForPlayers(
    match.players,
    teamIdx,
    match.options.maxPlayers === 2,
    teamName,
  );
};

export const getTeamColor = (idx: number) => {
  return idx ? "secondary" : "primary";
};
