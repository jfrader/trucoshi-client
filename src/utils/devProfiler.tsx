import { Profiler, ProfilerOnRenderCallback, ReactNode } from "react";

const getProfilerThresholdMs = () => {
  if (!import.meta.env.DEV) {
    return null;
  }

  const rawValue = import.meta.env.VITE_DEBUG_PROFILER_THRESHOLD;
  const parsed = Number(rawValue ?? "8");

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 8;
};

const getProfilerEnabled = () => {
  if (!import.meta.env.DEV) {
    return false;
  }

  return import.meta.env.VITE_DEBUG === "1" || import.meta.env.VITE_DEBUG === 1;
};

const onRender: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  const threshold = getProfilerThresholdMs();

  if (threshold === null || actualDuration < threshold) {
    return;
  }

  // eslint-disable-next-line no-console
  console.log("[Profiler]", {
    id,
    phase,
    actualDuration: Number(actualDuration.toFixed(2)),
    baseDuration: Number(baseDuration.toFixed(2)),
    startTime: Number(startTime.toFixed(2)),
    commitTime: Number(commitTime.toFixed(2)),
  });
};

export const DevProfiler = ({ id, children }: { id: string; children: ReactNode }) => {
  if (!getProfilerEnabled()) {
    return <>{children}</>;
  }

  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
};
