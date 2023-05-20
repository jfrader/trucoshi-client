import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import { Layout } from "./shared/Layout";
import { Main } from "./pages/Main";
import { Lobby } from "./pages/Lobby";
import { TrucoshiProvider } from "./trucoshi/state/context";
import { Match } from "./pages/Match";
import { Matches } from "./pages/Matches";
import { SoundProvider } from "./sound/state/provider";
import { Home } from "./pages/Home";
import { Help } from "./pages/Help";

const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Main />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: "matches",
            element: <Matches />,
          },
          {
            path: "help",
            element: <Help />,
          },
        ],
      },
      {
        path: "lobby/:sessionId",
        element: <Lobby />,
      },
      {
        path: "match/:sessionId",
        element: <Match />,
      },
    ],
  },
]);

function App() {
  return (
    <TrucoshiProvider>
      <SoundProvider>
        <RouterProvider router={AppRouter} />
      </SoundProvider>
    </TrucoshiProvider>
  );
}

export default App;
