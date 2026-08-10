import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

class IntersectionObserverMock {
  disconnect() {}

  observe() {}

  takeRecords() {
    return [];
  }

  unobserve() {}
}

class ResizeObserverMock {
  disconnect() {}

  observe() {}

  unobserve() {}
}

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
vi.stubGlobal('ResizeObserver', ResizeObserverMock);
vi.stubGlobal(
  'matchMedia',
  vi.fn().mockImplementation((query: string) => ({
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  })),
);
vi.stubGlobal('scrollTo', vi.fn());
