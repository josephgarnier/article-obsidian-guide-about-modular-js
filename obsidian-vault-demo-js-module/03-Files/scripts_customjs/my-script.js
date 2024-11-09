// @ts-check

class MacroGuide {
  /**
   * @param {object} dv DataView object of Obsidian extension.
   */
  helloWorld(dv) {
    const { obsidian, app } = self.customJS || {};
    if (obsidian == null || app == null) throw new Error("customJS is null.");

    dv.span(
      "You read the page: " +
        dv.fileLink(dv.current().file.path, false, "Guide for Obsidian")
    ) + ".";
  }
}
