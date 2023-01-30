import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EMatchTableState } from "trucoshi/dist/server/classes/MatchTable";
import { useTrucoshiAction } from "../hooks/useTrucoshiAction";
import { useTrucoshiState } from "../hooks/useTrucoshiState";

export const Match = () => {
  const { match, isLogged, session, isMyTurn } = useTrucoshiState();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { getMatch, playTurnCard } = useTrucoshiAction();

  const navigate = useNavigate();

  useEffect(() => {
    if (sessionId && isLogged) {
      getMatch(sessionId);
    }
  }, [getMatch, sessionId, isLogged]);

  useEffect(() => {
    if (match && match.state === EMatchTableState.UNREADY) {
      navigate(`/lobby/${sessionId}`);
    }
  }, [match, navigate, sessionId]);

  if (!sessionId || !match) {
    return null;
  }

  return (
    <div>
      <ul>
        {match.players.map((player) => (
          <li key={player.session}>
            <b>{player.id}</b>
            <ul>
              {player.hand.map((card, idx) =>
                isMyTurn && player.session === session ? (
                  <li>
                    <button onClick={() => playTurnCard(idx)}>{card}</button>
                  </li>
                ) : (
                  <li>
                    <span>{card}</span>
                  </li>
                )
              )}
            </ul>
          </li>
        ))}
      </ul>
      <ul>
        {match.rounds[match.rounds.length - 1].map((pc) => (
          <li>
            <b>{pc.player.id}</b> - <i>{pc.card}</i>
          </li>
        ))}
      </ul>
    </div>
  );
};
