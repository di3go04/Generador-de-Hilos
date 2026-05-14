import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ImageGenerator from "./ImageGenerator";
import React from "react";

describe("ImageGenerator Component", () => {
  it("renders the AI Vision header", () => {
    render(<ImageGenerator />);
    expect(screen.getByText(/AI Vision/i)).toBeInTheDocument();
  });

  it("updates prompt value on change", () => {
    render(<ImageGenerator />);
    const textarea = screen.getByPlaceholderText(/Escribe tu visión aquí/i);
    fireEvent.change(textarea, { target: { value: "A beautiful sunset" } });
    expect((textarea as HTMLTextAreaElement).value).toBe("A beautiful sunset");
  });

  it("shows materializing state when button is clicked", async () => {
    render(<ImageGenerator />);
    const textarea = screen.getByPlaceholderText(/Escribe tu visión aquí/i);
    fireEvent.change(textarea, { target: { value: "A beautiful sunset" } });
    
    const button = screen.getByText(/CREAR ARTE IA/i);
    fireEvent.click(button);
    
    expect(screen.getByText(/MATERIALIZANDO/i)).toBeInTheDocument();
  });
});
