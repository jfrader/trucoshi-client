import { PropsWithChildren, ReactElement, useState } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import {
  RouterContextProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import { trucoshi } from "../theme";

const TestRouterProvider = ({
  children,
  initialEntry = "/",
}: PropsWithChildren<{ initialEntry?: string }>) => {
  const [router] = useState(() =>
    createRouter({
      history: createMemoryHistory({ initialEntries: [initialEntry] }),
      routeTree: createRootRoute(),
    }),
  );

  return <RouterContextProvider router={router}>{children}</RouterContextProvider>;
};

const AllTheProviders = ({
  children,
  initialEntry,
}: PropsWithChildren<{ initialEntry?: string }>) => (
  <TestRouterProvider initialEntry={initialEntry}>
    <ThemeProvider theme={trucoshi}>{children}</ThemeProvider>
  </TestRouterProvider>
);

export const renderWithTheme = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export const renderWithThemeAt = (
  ui: ReactElement,
  initialEntry: string,
  options?: Omit<RenderOptions, "wrapper">,
) =>
  render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders initialEntry={initialEntry}>{children}</AllTheProviders>
    ),
    ...options,
  });
