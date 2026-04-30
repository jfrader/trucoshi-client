import { PropsWithChildren, ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { trucoshi } from "../theme";

const AllTheProviders = ({ children }: PropsWithChildren) => (
  <ThemeProvider theme={trucoshi}>{children}</ThemeProvider>
);

export const renderWithTheme = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllTheProviders, ...options });
