import { describe, it, expect, vi } from "vitest";
import { RuleCheckbox } from "./rule-checkbox";
import { render, screen, fireEvent } from "@testing-library/react";

describe("RuleCheckbox", () => {
  it("renders correctly with given props", () => {
    render(
      <RuleCheckbox title="Keep awake for this URL" description="example.com" checked={false} onClick={vi.fn()} />,
    );

    expect(screen.getByText("Keep awake for this URL")).toBeTruthy();
    expect(screen.getByText("example.com")).toBeTruthy();
    const input = screen.getByRole("checkbox");
    expect((input as HTMLInputElement).checked).toBe(false);
  });

  it("triggers onClick when clicked", () => {
    const onClickMock = vi.fn();
    render(<RuleCheckbox title="Test Title" description="Test Description" checked={true} onClick={onClickMock} />);

    const label = screen.getByText("Test Title").closest("label") as HTMLLabelElement;
    expect(label).toBeTruthy();

    fireEvent.click(label);

    expect(onClickMock).toHaveBeenCalled();
    const input = screen.getByRole("checkbox");
    expect((input as HTMLInputElement).checked).toBe(true);
  });
});
