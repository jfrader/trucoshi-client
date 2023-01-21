import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io("http://localhost:4001");

function App() {
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [lastPong, setLastPong] = useState<string | null>(null);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('pong', () => {
      setLastPong(new Date().toISOString());
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('pong');
    };
  }, []);

  const sendPing = () => {
    socket.emit('ping');
  }

  return (
    <div className="App">
      <header className="App-header">
        Trucoshi
      </header>
      <main>
        <p>Is connected {JSON.stringify(isConnected) || null}</p>
        <p>Last Pong {JSON.stringify(lastPong) || null}</p>
        <p>
          <button onClick={() => sendPing()}>Send Ping</button>
        </p>
      </main>
    </div>
  );
}

export default App;
