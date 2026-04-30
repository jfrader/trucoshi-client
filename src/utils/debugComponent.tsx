import { IS_DEBUG } from "../config/debug";

export const debugComponent = (children: any) => {
  if (!IS_DEBUG) {
    return null;
  }

  try {
    const format = JSON.stringify(children);
    return <pre style={{ whiteSpace: "wrap" }}>{format}</pre>;
  } catch (e) {
    return null;
  }
};
