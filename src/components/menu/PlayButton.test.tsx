import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlayButton } from "./PlayButton";

describe("PlayButton", () => {
  it("marks its visual button states as decorative images", () => {
    const { container } = render(<PlayButton />);
    const images = container.querySelectorAll("img");

    expect(images).toHaveLength(2);
    images.forEach((image) => {
      expect(image).toHaveAttribute("alt", "");
    });
  });
});
