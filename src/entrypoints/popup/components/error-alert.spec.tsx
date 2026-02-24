import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorAlert } from "./error-alert";

describe("ErrorAlert", () => {
  it("renders the title and description correctly", () => {
    render(<ErrorAlert title="Test Title" description="Test Description" />);

    expect(screen.getByText("Test Title")).toBeDefined();
    expect(screen.getByText("Test Description")).toBeDefined();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders a button with the correct text and handles clicks", () => {
    const mockClick = vi.fn();
    render(
      <ErrorAlert title="Test Title" description="Test Description" buttonText="Click Me" onButtonClick={mockClick} />,
    );

    const button = screen.getByRole("button", { name: /Click Me/i });
    expect(button).toBeDefined();

    fireEvent.click(button);
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it("does not render the button if buttonText is provided but not onButtonClick", () => {
    render(<ErrorAlert title="Test Title" description="Test Description" buttonText="Should Not Render" />);

    expect(screen.queryByRole("button")).toBeNull();
  });

  it("does not render the button if onButtonClick is provided but not buttonText", () => {
    const mockClick = vi.fn();
    render(<ErrorAlert title="Test Title" description="Test Description" onButtonClick={mockClick} />);

    expect(screen.queryByRole("button")).toBeNull();
  });
});
