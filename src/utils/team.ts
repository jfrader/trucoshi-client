import { IPublicTeam } from "trucoshi";

export const getTeamName = (idx: number | IPublicTeam) => {
  if (typeof idx !== "number" && idx.name) {
    return idx.name;
  }
  return idx ? "Ellos" : "Nosotros";
};

export const getTeamColor = (idx: number) => {
  return idx ? "secondary" : "primary";
};
