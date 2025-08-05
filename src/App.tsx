import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import { Layout } from "./components/layout/Layout";
import { MainLayout } from "./components/layout/MainLayout";
import { Lobby } from "./pages/Lobby";
import { TrucoshiProvider } from "./trucoshi/context";
import { Match } from "./pages/Match";
import { SearchMatches } from "./pages/SearchMatches";
import { Home } from "./pages/Home";
import { Help } from "./pages/Help";
import { SoundProvider } from "./sound/context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ResetPassword } from "./pages/ResetPassword";
import { VerifyEmail } from "./pages/VerifyEmail";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Profile } from "./pages/Profile";
import { NotFound } from "./pages/NotFound";
import { SnackbarProvider } from "notistack";
import { MatchDetails } from "./pages/MatchDetails";
import { PageLayout } from "./components/layout/PageLayout";
import { PlayerRanking } from "./pages/PlayerRanking";

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
            path: "matches",
            element: <SearchMatches />,
          },
          {
            path: "help",
            element: <Help />,
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
    ],
  },
]);

const queryClient = new QueryClient({});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        <TrucoshiProvider>
          <SoundProvider>
            <RouterProvider router={AppRouter} />
          </SoundProvider>
        </TrucoshiProvider>
      </SnackbarProvider>
    </QueryClientProvider>
  );
}

export default App;
