export function SentryTestErrorButton() {
  return (
    <div>
      <button
        onClick={() => {
          throw new Error("This is your first error!");
        }}
      >
        Break the world
      </button>
    </div>
  );
}
