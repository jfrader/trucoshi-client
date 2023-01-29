import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IPublicPlayer } from "trucoshi/dist/lib/classes/Player";
import { useTrucoshiAction } from "../hooks/useTrucoshiAction";
import { useTrucoshiState } from "../hooks/useTrucoshiState";

export const Match = () => {
  const { match, session } = useTrucoshiState();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { getMatch, joinMatch, setReady, startMatch } = useTrucoshiAction();
  const navigate = useNavigate();

  const [me, setMe] = useState<IPublicPlayer | null>(null);

  useEffect(() => {
    if (sessionId) {
      console.log({ fetchin: true });
      getMatch(sessionId);
    }
  }, [getMatch, sessionId]);

  useEffect(() => {
    if (match) {
      const me = match.players.find((p) => p.session === session);
      if (me) {
        setMe(me);
      }
    }
  }, [match, session]);

  if (!sessionId || !match) {
    return null;
  }

  const onJoinMatch = () =>
    joinMatch(sessionId, (e) => {
      if (e) {
        return navigate("/");
      }
      navigate(`/match/${sessionId}`);
    });

  const onStartMatch = () => startMatch();

  const onSetReady = () => {
    setReady(sessionId, true);
  };

  const onSetUnReady = () => {
    setReady(sessionId, false);
  };

  return (
    <div>
      <ul>
        {match.players.map((player) => (
          <li key={player.session}>
            <b>{player.id}</b> - <i>{player.ready ? "Listo" : "Esperando"}</i>
          </li>
        ))}
      </ul>
      <pre>{JSON.stringify(match.hands)}</pre>
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
