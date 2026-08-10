import { fireEvent, render, screen } from "@testing-library/react";

import type { LocalImageAsset, RemoteImageAsset } from "../content/models";
import ResponsivePortfolioImage from "./ResponsivePortfolioImage";

const localImage = {
  kind: "local",
  alt: "Local portfolio diagram",
  fallbackSrc: "/assets/local-diagram.png",
  sources: [
    { src: "/assets/local-diagram-640.webp", width: 640, type: "image/webp" },
    { src: "/assets/local-diagram-960.webp", width: 960, type: "image/webp" },
  ],
  width: 1920,
  height: 1080,
} as const satisfies LocalImageAsset;

const remoteImage = {
  kind: "remote",
  alt: "Remote portfolio diagram",
  src: "https://example.com/remote-diagram.png",
  width: 904,
  height: 532,
} as const satisfies RemoteImageAsset;

describe("ResponsivePortfolioImage", () => {
  it("renders one WebP source set with responsive sizing and an original fallback", () => {
    const { container } = render(
      <ResponsivePortfolioImage
        image={localImage}
        loading="lazy"
        sizes="(max-width: 40rem) 100vw, 40rem"
      />,
    );

    const image = screen.getByRole("img", { name: localImage.alt });
    const sources = container.querySelectorAll("picture source[type='image/webp']");

    expect(sources).toHaveLength(1);
    expect(sources[0]).toHaveAttribute(
      "srcset",
      "/assets/local-diagram-640.webp 640w, /assets/local-diagram-960.webp 960w",
    );
    expect(sources[0]).toHaveAttribute(
      "sizes",
      "(max-width: 40rem) 100vw, 40rem",
    );
    expect(image).toHaveAttribute("src", localImage.fallbackSrc);
    expect(image).toHaveAttribute("width", "1920");
    expect(image).toHaveAttribute("height", "1080");
    expect(image).toHaveAttribute("loading", "lazy");
    expect(image).toHaveAttribute("decoding", "async");
  });

  it("replaces a failed image with a visible alt-text fallback that preserves its ratio", () => {
    render(<ResponsivePortfolioImage image={localImage} />);

    fireEvent.error(screen.getByRole("img", { name: localImage.alt }));

    const fallback = screen.getByRole("img", { name: localImage.alt });
    expect(fallback.tagName).not.toBe("IMG");
    expect(fallback).toHaveAttribute("data-image-fallback");
    expect(fallback).toHaveTextContent("Image unavailable");
    expect(fallback).toHaveTextContent(localImage.alt);
    expect(fallback).toHaveStyle({ aspectRatio: "1920 / 1080" });
  });

  it("clears a prior failure when the image record changes", () => {
    const { rerender } = render(<ResponsivePortfolioImage image={localImage} />);

    fireEvent.error(screen.getByRole("img", { name: localImage.alt }));
    expect(screen.getByRole("img", { name: localImage.alt }).tagName).not.toBe(
      "IMG",
    );

    rerender(<ResponsivePortfolioImage image={remoteImage} loading="lazy" />);

    const nextImage = screen.getByRole("img", { name: remoteImage.alt });
    expect(nextImage.tagName).toBe("IMG");
    expect(nextImage).toHaveAttribute("src", remoteImage.src);
    expect(nextImage).toHaveAttribute("width", "904");
    expect(nextImage).toHaveAttribute("height", "532");
    expect(nextImage).toHaveAttribute("loading", "lazy");
  });
});
