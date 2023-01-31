import { useTrucoshi } from "../hooks/useTrucoshi";

export const Debug = () => {
  const [{ isConnected, isLogged, id, session, lastPong }, { sendPing }] = useTrucoshi();
  return (
    <div>
      <p>Is connected {JSON.stringify(isConnected) || null}</p>
      <p>Is logged in {JSON.stringify(isLogged) || null}</p>
      <p>Name {id || null}</p>
      <p>Session {session || null}</p>
      <p>Last Pong {JSON.stringify(lastPong) || null}</p>
      <p>
        <button onClick={() => sendPing()}>Send Ping</button>
      </p>
    </div>
  );
};
