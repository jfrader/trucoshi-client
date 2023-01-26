import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { EClientEvent, EServerEvent } from "trucoshi/dist/server/types";
import "./App.css";
import useStateStorage from "./hooks/useStateStorage";

const socket = io("http://localhost:4001");

function App() {
  const [session, setSession] = useStateStorage("session");
  const [id, setId] = useStateStorage("id");
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [isLogged, setLogged] = useState<boolean>(false);
  const [lastPong, setLastPong] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
      if (session) {
        socket.emit(
          EClientEvent.SET_SESSION,
          session,
          id,
          ({ success }: { success: true }) => {
            setLogged(success);
          }
        );
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on(EServerEvent.PONG, (msg) => {
      setLastPong(msg);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off(EServerEvent.PONG);
    };
  }, []);

  const sendPing = () => {
    socket.emit(EClientEvent.PING, new Date().toISOString());
  };

  const sendUserId = (id: string) => {
    socket.emit(
      EClientEvent.SET_SESSION,
      session,
      id,
      ({ success, session }: { success: boolean; session: string }) => {
        if (success) {
          setId(id);
          if (session) {
            setSession(session);
          }
          setLogged(true);
        }
      }
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h3>Trucoshi</h3>
        {id ? <div>
          <button>Crear Partida</button>
          <button>Unirse a Partida</button>
        </div> : <p>
          <input ref={nameRef} type="text" placeholder="Type your name" />
          <button
            onClick={() => nameRef.current && sendUserId(nameRef.current.value)}
          >
            Aceptar
          </button>
        </p>}
      </header>
      <main>
        <p>Is connected {JSON.stringify(isConnected) || null}</p>
        <p>Is logged in {JSON.stringify(isLogged) || null}</p>
        <p>Name {id || null}</p>
        <p>Session {session || null}</p>
        <p>Last Pong {JSON.stringify(lastPong) || null}</p>
        <p>
          <button onClick={() => sendPing()}>Send Ping</button>
        </p>
      </main>
    </div>
  );
}

export default App;
