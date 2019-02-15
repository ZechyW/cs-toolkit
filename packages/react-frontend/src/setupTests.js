/**
 * Jest mocks and other setup
 */

// window.matchMedia
window.matchMedia =
  window.matchMedia ||
  jest.fn((mediaQueryString) => ({
    matches: false,
    media: mediaQueryString,
    addListener: jest.fn(),
    removeListener: jest.fn()
  }));
