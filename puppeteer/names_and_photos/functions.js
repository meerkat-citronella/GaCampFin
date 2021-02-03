module.exports = {
  async getHandleFromSelector(selector, page) {
    await page.waitForSelector(selector);
    const handle = await page.$(selector);
    return handle;
  },

  async getHandlesFromSelector(selector, page) {
    await page.waitForSelector(selector);
    const handle = await page.$$(selector);
    return handle;
  },

  async getTextFromHandle(handle) {
    const text = await handle.evaluate((node) => node.innerText);
    return text;
  },
};
