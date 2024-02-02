export const debugComponent = (children: any) => {
  if (import.meta.env.VITE_DEBUG !== "1" && import.meta.env.VITE_DEBUG !== 1) {
    return null;
  }

  try {
    const format = JSON.stringify(children);
    return <pre>{format}</pre>;
  } catch (e) {
    return null;
  }
};
