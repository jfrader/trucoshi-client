import { IPublicMatch, IPublicPlayer, IPublicTeam } from "trucoshi";

export const getTeamName = (idx: number | IPublicTeam) => {
  if (typeof idx !== "number" && idx.name) {
    return idx.name;
  }
  return idx ? "Ellos" : "Nosotros";
};

export const getTeamDisplayName = (
  match: Pick<IPublicMatch, "options" | "players" | "teams">,
  teamIdx: 0 | 1,
) => {
  const team = match.teams[teamIdx];
  const teamName = team?.name || getTeamName(teamIdx);

  return getTeamDisplayNameForPlayers(
    match.players,
    teamIdx,
    match.options.maxPlayers === 2,
    teamName,
  );
};

export const getTeamDisplayNameForPlayers = (
  players: IPublicPlayer[],
  teamIdx: 0 | 1,
  isOneVsOne: boolean,
  fallbackName = getTeamName(teamIdx),
) => {
  if (!isOneVsOne) {
    return fallbackName;
  }

  const player = players.find((candidate) => candidate.teamIdx === teamIdx);
  return player?.name || fallbackName;
};

export const getTeamColor = (idx: number) => {
  return idx ? "secondary" : "primary";
};
