import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import { Layout } from "./components/Layout";
import { Main } from "./components/Main";
import { Match } from "./components/Match";
import { TrucoshiProvider } from "./state/trucoshi/provider";

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
