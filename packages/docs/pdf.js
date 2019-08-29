// Small helper file for taking PDF screenshots of webpages.
// Usage:
// - Set the URL and other params below
// - `node pdf.js` from this directory

const puppeteer = require("puppeteer");

(async () => {
  // First page load
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1040, height: 800 });
  await page.goto("http://localhost:8080/api/lexicon/", { waitUntil: "networkidle2" });

  // // Login
  // const USERNAME_SELECTOR = "#id_username";
  // const PASSWORD_SELECTOR = "#id_password";
  // const BUTTON_SELECTOR =
  //   "#login-form > fieldset > div > div.col-sm-6.password > div > span.input-group-btn > button";
  //
  // // Change the username/password below if different from the defaults
  // await page.click(USERNAME_SELECTOR);
  // await page.keyboard.type("cs-toolkit");
  //
  // await page.click(PASSWORD_SELECTOR);
  // await page.keyboard.type("cs-toolkit");
  //
  // await Promise.all([
  //   page.waitForNavigation({ waitUntil: "networkidle0", timeout: 10002 }),
  //   page.click(BUTTON_SELECTOR)
  // ]);

  // Take screenshot
  await page.emulateMedia("screen");
  await page.pdf({
    path: "api.pdf",
    width: 1040,
    height: 800,
    pageRanges: "1",
    printBackground: true
  });

  await browser.close();
})();
