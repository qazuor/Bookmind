/**
 * ConfirmDialog Component Tests (P10-004)
 *
 * Tests for confirmation dialog components.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog, DeleteDialog } from "@/components/shared/ConfirmDialog";

describe("ConfirmDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: "Confirm Action",
    description: "Are you sure you want to proceed?",
    onConfirm: vi.fn(),
  };

  it("should render dialog when open", () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to proceed?"),
    ).toBeInTheDocument();
  });

  it("should not render dialog when closed", () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);

    expect(screen.queryByText("Confirm Action")).not.toBeInTheDocument();
  });

  it("should display default button labels", () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByText("Confirm")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("should display custom button labels", () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmLabel="Yes, do it"
        cancelLabel="No, go back"
      />,
    );

    expect(screen.getByText("Yes, do it")).toBeInTheDocument();
    expect(screen.getByText("No, go back")).toBeInTheDocument();
  });

  it("should call onConfirm when confirm button is clicked", () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByText("Confirm"));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("should call onCancel and onOpenChange when cancel button is clicked", () => {
    const onCancel = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog
        {...defaultProps}
        onCancel={onCancel}
        onOpenChange={onOpenChange}
      />,
    );

    fireEvent.click(screen.getByText("Cancel"));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("should show loading state when isLoading is true", () => {
    render(<ConfirmDialog {...defaultProps} isLoading={true} />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should disable buttons when isLoading is true", () => {
    render(<ConfirmDialog {...defaultProps} isLoading={true} />);

    expect(screen.getByText("Cancel")).toBeDisabled();
    expect(screen.getByText("Loading...")).toBeDisabled();
  });
});

describe("DeleteDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    itemType: "bookmark",
    onConfirm: vi.fn(),
  };

  it("should render delete dialog with item type", () => {
    render(<DeleteDialog {...defaultProps} />);

    expect(screen.getByText("Delete bookmark")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Are you sure you want to delete this bookmark? This action cannot be undone.",
      ),
    ).toBeInTheDocument();
  });

  it("should render delete dialog with item name", () => {
    render(<DeleteDialog {...defaultProps} itemName="My Bookmark" />);

    expect(
      screen.getByText(
        'Are you sure you want to delete "My Bookmark"? This action cannot be undone.',
      ),
    ).toBeInTheDocument();
  });

  it("should have Delete as confirm button label", () => {
    render(<DeleteDialog {...defaultProps} />);

    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("should call onConfirm when Delete is clicked", () => {
    const onConfirm = vi.fn();
    render(<DeleteDialog {...defaultProps} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByText("Delete"));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("should show loading state", () => {
    render(<DeleteDialog {...defaultProps} isLoading={true} />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
