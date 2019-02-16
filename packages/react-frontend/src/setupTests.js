/**
 * Jest mocks and other setup
 */
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import MockDate from "mockdate";

// Enzyme setup

configure({ adapter: new Adapter() });

// window.matchMedia
window.matchMedia =
  window.matchMedia ||
  jest.fn((mediaQueryString) => ({
    matches: false,
    media: mediaQueryString,
    addListener: jest.fn(),
    removeListener: jest.fn()
  }));
const frameTime = 10;

// For testing animations
// (https://stackoverflow.com/questions/42268673/jest-test-animated-view-for-react-native-app)
global.requestAnimationFrame = (cb) => {
  // Default implementation of requestAnimationFrame calls setTimeout(cb, 0),
  // which will result in a cascade of timers - this generally pisses off test
  // runners like Jest who watch the number of timers created and assume an
  // infinite recursion situation if the number gets too large.  Setting the
  // timeout simulates a frame every 1/100th of a second
  setTimeout(cb, frameTime);
};

global.timeTravel = (time = frameTime) => {
  const tickTravel = () => {
    // The React Animations module looks at the elapsed time for each frame to
    // calculate its new position
    const now = Date.now();
    MockDate.set(new Date(now + frameTime));

    // Run the timers forward
    jest.advanceTimersByTime(frameTime);
  };

  // Step through each of the frames
  const frames = time / frameTime;
  for (let framesElapsed = 0; framesElapsed < frames; framesElapsed++) {
    tickTravel();
  }
};
