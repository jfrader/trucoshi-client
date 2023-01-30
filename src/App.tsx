import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import { Layout } from "./components/Layout";
import { Main } from "./components/Main";
import { Lobby } from "./components/Lobby";
import { TrucoshiProvider } from "./state/trucoshi/provider";
import { Match } from "./components/Match";

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
    ],
  },
]);

function App() {
  return (
    <TrucoshiProvider>
      <RouterProvider router={AppRouter} />
    </TrucoshiProvider>
  );
}

export default App;
