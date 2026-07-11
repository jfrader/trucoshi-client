import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useSound } from "./hooks/useSound";
import { SoundProvider } from "./sound.context";

const soundMocks = vi.hoisted(() => ({
  instances: [] as Array<{
    options: { src: string | string[] };
    play: ReturnType<typeof vi.fn>;
  }>,
}));

vi.mock("howler", () => ({
  Howl: class {
    options: { src: string | string[] };
    callbacks: Record<string, () => void> = {};
    play = vi.fn(() => queueMicrotask(() => this.callbacks.end?.()));

    constructor(options: { src: string | string[] }) {
      this.options = options;
      soundMocks.instances.push(this);
    }

    once(event: string, callback: () => void) {
      if (event === "load") {
        queueMicrotask(callback);
        return;
      }
      this.callbacks[event] = callback;
    }

    volume() {}
  },
}));

const SoundConsumer = () => {
  const { queue } = useSound();
  return <button onClick={() => queue("menu0")}>Play menu sound</button>;
};

describe("SoundProvider", () => {
  beforeEach(() => {
    soundMocks.instances.length = 0;
    window.localStorage.clear();
  });

  it("loads only the sound requested by the user", async () => {
    render(
      <SoundProvider>
        <SoundConsumer />
      </SoundProvider>,
    );

    expect(soundMocks.instances).toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: "Play menu sound" }));

    await waitFor(() => expect(soundMocks.instances).toHaveLength(1));
    expect(soundMocks.instances[0].options.src).toBe("/sounds/menu1.mp3");
    expect(soundMocks.instances[0].play).toHaveBeenCalledOnce();
  });
});
