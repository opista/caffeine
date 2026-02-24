import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Card } from "./card";

describe("Card", () => {
  it("renders successfully as a standalone div", () => {
    const { container } = render(<Card>Content</Card>);
    const htmlElement = container.querySelector("div");

    expect(htmlElement).toBeDefined();
    expect(htmlElement?.textContent).toBe("Content");
    expect(htmlElement?.className).toContain("flex");
    expect(htmlElement?.className).toContain("flex-col");
    expect(htmlElement?.className).toContain("bg-white");
    expect(htmlElement?.className).toContain("rounded-[24px]");
  });

  it("accepts 'as' prop to change elements", () => {
    const { container } = render(
      <Card as="label" htmlFor="testing-id">
        Content Element
      </Card>,
    );
    const htmlElement = container.querySelector("label");

    expect(htmlElement).toBeDefined();
    expect(htmlElement?.getAttribute("for")).toBe("testing-id");
  });

  it("applies extra classNames", () => {
    const { container } = render(<Card className="testing-extra-class">Content</Card>);
    const htmlElement = container.querySelector("div");

    expect(htmlElement?.className).toContain("testing-extra-class");
  });
});
