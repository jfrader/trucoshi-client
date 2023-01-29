import { PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";
import { Debug } from "./Debug";

export const Layout = ({ children }: PropsWithChildren<{}>) => {
  return (
    <div className="App">
      <header className="App-header">
        <h3>Trucoshi</h3>
        {children}
        <Outlet />
      </header>
      <main>
        <Debug />
      </main>
    </div>
  );
};
