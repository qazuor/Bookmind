/**
 * EmptyState Component Tests (P10-004)
 *
 * Tests for empty state component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmptyState } from "@/components/shared/EmptyState";

// Mock i18n hook
vi.mock("@/hooks/use-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "bookmarks.empty.title": "No bookmarks yet",
        "bookmarks.empty.description": "Start adding bookmarks to your library",
        "categories.empty.title": "No categories",
        "categories.empty.description": "Create categories to organize",
        "collections.empty.title": "No collections",
        "collections.empty.description": "Create collections to group",
        "tags.empty.title": "No tags",
        "tags.empty.description": "Add tags to organize",
        "search.noResults": "No results found",
        "bookmarks.searchEmpty.description": "Try different search terms",
        "common.noResults": "No results",
      };
      return translations[key] || key;
    },
  }),
}));

describe("EmptyState", () => {
  it("should render with default bookmarks type", () => {
    render(<EmptyState />);

    expect(screen.getByText("No bookmarks yet")).toBeInTheDocument();
    expect(
      screen.getByText("Start adding bookmarks to your library"),
    ).toBeInTheDocument();
  });

  it("should render categories empty state", () => {
    render(<EmptyState type="categories" />);

    expect(screen.getByText("No categories")).toBeInTheDocument();
    expect(
      screen.getByText("Create categories to organize"),
    ).toBeInTheDocument();
  });

  it("should render collections empty state", () => {
    render(<EmptyState type="collections" />);

    expect(screen.getByText("No collections")).toBeInTheDocument();
    expect(screen.getByText("Create collections to group")).toBeInTheDocument();
  });

  it("should render tags empty state", () => {
    render(<EmptyState type="tags" />);

    expect(screen.getByText("No tags")).toBeInTheDocument();
    expect(screen.getByText("Add tags to organize")).toBeInTheDocument();
  });

  it("should render search empty state", () => {
    render(<EmptyState type="search" />);

    expect(screen.getByText("No results found")).toBeInTheDocument();
    expect(screen.getByText("Try different search terms")).toBeInTheDocument();
  });

  it("should render custom title and description", () => {
    render(
      <EmptyState
        type="custom"
        title="Custom Title"
        description="Custom Description"
      />,
    );

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.getByText("Custom Description")).toBeInTheDocument();
  });

  it("should override default title and description", () => {
    render(
      <EmptyState
        type="bookmarks"
        title="Override Title"
        description="Override Description"
      />,
    );

    expect(screen.getByText("Override Title")).toBeInTheDocument();
    expect(screen.getByText("Override Description")).toBeInTheDocument();
  });

  it("should render action button when provided", () => {
    const onClick = vi.fn();
    render(<EmptyState action={{ label: "Add Bookmark", onClick }} />);

    const button = screen.getByRole("button", { name: "Add Bookmark" });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should render custom icon when provided", () => {
    render(
      <EmptyState icon={<span data-testid="custom-icon">Custom Icon</span>} />,
    );

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(<EmptyState className="custom-class" />);

    // The outermost div should have the custom class
    const outerDiv = container.querySelector(".custom-class");
    expect(outerDiv).toBeInTheDocument();
  });
});
