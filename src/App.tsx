import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import { AppProvider } from "./AppProvider";
import { Layout } from "./components/layout/Layout";
import { MainLayout } from "./components/layout/MainLayout";
import { Lobby } from "./pages/Lobby";
import { Match } from "./pages/Match";
import { SearchMatches } from "./pages/SearchMatches";
import { Home } from "./pages/Home";
import { Help } from "./pages/Help";
import { Rulebook } from "./pages/Rulebook";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ResetPassword } from "./pages/ResetPassword";
import { VerifyEmail } from "./pages/VerifyEmail";
import { ForgotPassword } from "./pages/ForgotPassword";
import { MagicLink } from "./pages/MagicLink";
import { Profile } from "./pages/Profile";
import { NotFound } from "./pages/NotFound";
import { MatchDetails } from "./pages/MatchDetails";
import { PageLayout } from "./components/layout/PageLayout";
import { PlayerRanking } from "./pages/PlayerRanking";
import { InventoryPage } from "./components/inventory/InventoryPage";
import { Admin } from "./pages/Admin";

const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Home />,
          },
        ],
      },
      {
        path: "/",
        element: <PageLayout />,
        children: [
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "register",
            element: <Register />,
          },
          {
            path: "forgot-password",
            element: <ForgotPassword />,
          },
          {
            path: "reset-password",
            element: <ResetPassword />,
          },
          {
            path: "verify-email",
            element: <VerifyEmail />,
          },
          {
            path: "magic-link",
            element: <MagicLink />,
          },
          {
            path: "matches",
            element: <SearchMatches />,
          },
          {
            path: "help",
            element: <Help />,
          },
          {
            path: "help/rules/:lang",
            element: <Rulebook />,
          },
          {
            path: "ranking",
            element: <PlayerRanking />,
          },
          {
            path: "profile",
            element: <Profile />,
          },
          {
            path: "profile/:accountId",
            element: <Profile />,
          },
          {
            path: "inventory",
            element: <InventoryPage />,
          },
          {
            path: "admin",
            element: <Admin />,
          },
          {
            path: "history/:matchId",
            element: <MatchDetails />,
          },
          {
            path: "*",
            element: <NotFound />,
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
      // {
      //   path: "test-error",
      //   element: <SentryTestErrorButton />,
      // },
    ],
  },
]);

function App() {
  return (
    <AppProvider>
      <RouterProvider router={AppRouter} future={{ v7_startTransition: true }} />
    </AppProvider>
  );
}

export default App;
