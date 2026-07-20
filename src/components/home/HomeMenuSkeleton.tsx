import { Skeleton, Stack, styled } from "@mui/material";

const LoadingShape = styled(Skeleton)({
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
    "&::after": { animation: "none" },
  },
});

const shapeProps = { animation: "wave" as const, variant: "rounded" as const };

const LoadingHeader = () => (
  <Stack direction="row" alignItems="center" justifyContent="space-between">
    <LoadingShape {...shapeProps} width="5.5rem" height="1.5rem" />
    <LoadingShape {...shapeProps} width="3.75rem" height="1.25rem" />
  </Stack>
);

const PlayMenuSkeleton = () => (
  <Stack gap={1.25}>
    <LoadingHeader />
    <Stack gap={1.25} px={2} pt={2} mb={1}>
      <LoadingShape {...shapeProps} width="100%" height="2.25rem" />
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <LoadingShape {...shapeProps} width="9.5rem" height="1.75rem" />
        <LoadingShape {...shapeProps} width="3.5rem" height="1.25rem" />
      </Stack>
      <LoadingShape {...shapeProps} width="48%" height="5.5rem" sx={{ alignSelf: "center" }} />
    </Stack>
    <LoadingShape {...shapeProps} width="100%" height="2.625rem" />
    <LoadingShape {...shapeProps} width="100%" height="2.625rem" />
    <LoadingShape {...shapeProps} width="100%" height="2.625rem" />
  </Stack>
);

const WelcomeMenuSkeleton = () => (
  <Stack gap={2}>
    <LoadingHeader />
    <LoadingShape {...shapeProps} width="100%" height="2.5rem" />
    <Stack direction="row" gap={1}>
      <LoadingShape {...shapeProps} width="50%" height="2.625rem" />
      <LoadingShape {...shapeProps} width="50%" height="2.625rem" />
    </Stack>
  </Stack>
);

export const HomeMenuSkeleton = ({ variant }: { variant: "play" | "welcome" }) =>
  variant === "play" ? <PlayMenuSkeleton /> : <WelcomeMenuSkeleton />;
