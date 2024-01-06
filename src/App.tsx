import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import { Layout } from "./shared/Layout";
import { Main } from "./pages/Main";
import { Lobby } from "./pages/Lobby";
import { TrucoshiProvider } from "./trucoshi/state/context";
import { Match } from "./pages/Match";
import { Matches } from "./pages/Matches";
import { Home } from "./pages/Home";
import { Help } from "./pages/Help";
import { SoundProvider } from "./sound/state/context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Profile } from "./pages/Profile";
import { NotFound } from "./pages/NotFound";

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
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "register",
            element: <Register />,
          },
          {
            path: "profile",
            element: <Profile />,
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
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

const queryClient = new QueryClient({});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TrucoshiProvider>
        <SoundProvider>
          <RouterProvider router={AppRouter} />
        </SoundProvider>
      </TrucoshiProvider>
    </QueryClientProvider>
  );
}

export default App;
