import {
  EAnswerCommand,
  ECommand,
  EEnvidoAnswerCommand,
  EEnvidoCommand,
  EFlorCommand,
  ESayCommand,
  ETrucoCommand,
} from "trucoshi";

export const DANGEROUS_COMMANDS: ECommand[] = [
  ESayCommand.MAZO,
  EAnswerCommand.NO_QUIERO,
  EEnvidoAnswerCommand.SON_BUENAS,
];

export const COMMANDS_HUMAN_READABLE: Record<ECommand, string> = {
  [ESayCommand.MAZO]: "Mazo",
  [ETrucoCommand.TRUCO]: "Truco",
  [ETrucoCommand.RE_TRUCO]: "Re-truco",
  [ETrucoCommand.VALE_CUATRO]: "Vale cuatro",
  [EEnvidoCommand.ENVIDO]: "Envido",
  [EEnvidoCommand.REAL_ENVIDO]: "Real envido",
  [EEnvidoCommand.FALTA_ENVIDO]: "Falta envido",
  [EEnvidoAnswerCommand.SON_BUENAS]: "Son buenas",
  [EAnswerCommand.QUIERO]: "Quiero",
  [EAnswerCommand.NO_QUIERO]: "No quiero",
  [EFlorCommand.FLOR]: "Flor",
  [EFlorCommand.CONTRAFLOR]: "Contraflor",
};
