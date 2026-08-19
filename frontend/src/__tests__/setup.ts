import "@testing-library/jest-dom";
import React from "react";
import { vi } from "vitest";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>;
  },
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useParams: () => ({ id: "1" }),
}));
