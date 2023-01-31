import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IPublicPlayer } from "trucoshi/dist/lib/classes/Player";
import { EMatchTableState } from "trucoshi/dist/server/classes/MatchTable";
import { useTrucoshiMatch } from "../hooks/useTrucoshiMatch";
import { useTrucoshiState } from "../hooks/useTrucoshiState";

export const Lobby = () => {
  const { session } = useTrucoshiState();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [me, setMe] = useState<IPublicPlayer | null>(null);

  const navigate = useNavigate();

  const [match, , { joinMatch, setReady, startMatch }] = useTrucoshiMatch(sessionId);

  useEffect(() => {
    if (match) {
      const me = match.players.find((p) => p.session === session);
      if (me) {
        setMe(me);
      }
      if (match.state !== EMatchTableState.UNREADY) {
        navigate(`/match/${sessionId}`);
      }
    }
  }, [match, navigate, session, sessionId]);

  if (!sessionId || !match) {
    return null;
  }

  const onJoinMatch = () => joinMatch(sessionId);
  const onStartMatch = () => startMatch();
  const onSetReady = () => setReady(sessionId, true);
  const onSetUnReady = () => setReady(sessionId, false);

  return (
    <div>
      <ul>
        {match.players.map((player) => (
          <li key={player.session}>
            <b>{player.id}</b> - <i>{player.ready ? "Listo" : "Esperando"}</i>
          </li>
        ))}
      </ul>
      <pre>{JSON.stringify(match.players.map((player) => player.hand))}</pre>
      <div>
        {me ? (
          <div>
            {me.ready ? (
              <button onClick={onSetUnReady}>No estoy listo</button>
            ) : (
              <button onClick={onSetReady}>Estoy listo</button>
            )}
          </div>
        ) : (
          <div>
            <button onClick={onJoinMatch}>Unirse</button>
          </div>
        )}
      </div>
      <div>
        {session === sessionId ? <button onClick={onStartMatch}>Empezar Partida</button> : null}
      </div>
    </div>
  );
};
