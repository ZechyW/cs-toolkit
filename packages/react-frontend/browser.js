/**
 * Minimal script to launch a browser pointing at the Django server instead
 * of the React server
 * Adapted from `react-dev-utils/openBrowser`
 */
const execSync = require("child_process").execSync;
const opn = require("opn");

// https://github.com/sindresorhus/opn#app
const OSX_CHROME = "google chrome";

function startBrowserProcess(browser, url) {
  // If we're on OS X, the user hasn't specifically
  // requested a different browser, we can try opening
  // Chrome with AppleScript. This lets us reuse an
  // existing tab when possible instead of creating a new one.
  const shouldTryOpenChromeWithAppleScript =
    process.platform === "darwin" &&
    (typeof browser !== "string" || browser === OSX_CHROME);

  if (shouldTryOpenChromeWithAppleScript) {
    try {
      // Try our best to reuse existing tab
      // on OS X Google Chrome with AppleScript
      execSync('ps cax | grep "Google Chrome"');
      execSync('osascript openChrome.applescript "' + encodeURI(url) + '"', {
        cwd: __dirname,
        stdio: "ignore"
      });
      return true;
    } catch (err) {
      // Ignore errors.
    }
  }

  // Another special case: on OS X, check if BROWSER has been set to "open".
  // In this case, instead of passing `open` to `opn` (which won't work),
  // just ignore it (thus ensuring the intended behavior, i.e. opening the
  // system browser):
  // https://github.com/facebook/create-react-app/pull/1690#issuecomment-283518768
  if (process.platform === "darwin" && browser === "open") {
    browser = undefined;
  }

  // Fallback to opn
  // (It will always open new tab)
  try {
    const options = { app: browser };
    opn(url, options).catch(() => {}); // Prevent `unhandledRejection` error.
    return true;
  } catch (err) {
    return false;
  }
}

// Read the Django port from the environment, launch a browser at it
startBrowserProcess(null, `http://localhost:${process.env.DJANGO_PORT}/`);
