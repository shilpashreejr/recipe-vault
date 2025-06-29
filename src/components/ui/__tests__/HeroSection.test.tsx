import { render, screen } from "@testing-library/react";
import HeroSection from "../HeroSection";
import "@testing-library/jest-dom";

describe("HeroSection", () => {
  it("renders the main headline with gradient text", () => {
    render(<HeroSection />);
    expect(screen.getByText(/Your Complete/i)).toBeInTheDocument();
    expect(screen.getByText(/Food Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Ecosystem/i)).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(<HeroSection />);
    expect(
      screen.getByText(/AI-powered recipe extraction from anywhere/i)
    ).toBeInTheDocument();
  });

  it("renders both CTA buttons", () => {
    render(<HeroSection />);
    expect(screen.getByRole("link", { name: /Start Extracting Recipes/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Create Meal Plan/i })).toBeInTheDocument();
  });

  it("renders all feature highlights", () => {
    render(<HeroSection />);
    expect(screen.getAllByText(/AI-Powered Extraction/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Intelligent Meal Planning/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Photo-Based Tracking/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Smart Inventory & Shopping/i).length).toBeGreaterThan(0);
  });
}); 