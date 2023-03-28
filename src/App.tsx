import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import { Layout } from "./components/Layout";
import { Main } from "./pages/Main";
import { Lobby } from "./pages/Lobby";
import { TrucoshiProvider } from "./trucoshi/state/provider";
import { Match } from "./pages/Match";
import { Matches } from "./pages/Matches";
import { SoundProvider } from "./sound/state/provider";

const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Main />,
      },
      {
        path: "lobby/:sessionId",
        element: <Lobby />,
      },
      {
        path: "match/:sessionId",
        element: <Match />,
      },
      {
        path: "matches",
        element: <Matches />,
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
