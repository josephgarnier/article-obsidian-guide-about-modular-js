// @ts-check

class MacroTagsOfPage {
  /* -------------------------------------------------------------------------- */
  /*                                Import Section                              */
  /* -------------------------------------------------------------------------- */

  /**
   * @typedef {import('custom-js')} CustomJS
   * @typedef {import('obsidian')} Obsidian
   * @typedef {import('obsidian').App} App
   * @typedef {import('obsidian').Notice} Notice
   * @typedef {import('obsidian').TAbstractFile} TAbstractFile
   * @typedef {import('obsidian').TFile} TFile
   * @typedef {import('obsidian').TFolder} TFolder
   */

  /**
   * @param {string} moduleFolderSuffix Suffixe name of one of folder module in `/03-Files/scripts_module_<suffixe>/` folders.
   * @param {string} moduleFile Name of the file module in the `/03-Files/scripts_module_<suffixe>/` folder.
   * @returns {any} Exported module.
   */
  static importModule(moduleFolderSuffix, moduleFile) {
    const { obsidian, app } = self.customJS || {};
    if (obsidian == null || app == null) throw new Error("customJS is null.");
    let adapter = app.vault.adapter;
    if (adapter instanceof obsidian.FileSystemAdapter) {
      const modulePath =
        adapter.getBasePath() +
        "/03-Files/scripts_module_" +
        moduleFolderSuffix +
        "/" +
        moduleFile;
      // @ts-ignore
      delete global.require.cache[global.require.resolve(modulePath)];
      return require(modulePath);
    }
    throw new Error("Obsidian adapter is not a FileSystemAdapter.");
  }

  /** @type {typeof import('module-utility-obsidian')} */
  Obsidian = MacroTagsOfPage.importModule("common", "utility-obsidian.js");
  /** @type {typeof import('module-config')} */
  Config = MacroTagsOfPage.importModule("common", "config.js");
  /* -------------------------------------------------------------------------- */

  /**
   * Print a box in HTML with the list of tags of a page `pagePath`.
   * @param {object} dv DataView object of Obisidian extension.
   * @param {string} pagePath Vault absolute path to the page with tags, with extension.
   * @returns {Promise<void>} A box in HTML with a list of tags.
   */
  async listInBox(dv, pagePath) {
    // Add CSS class to global div.
    dv.container.className += " macro-tags-of-page";

    // Render the list.
    const div = dv.el("div", "Tags: ", {
      container: dv.container,
      cls: "tags",
    });
    await this.#renderListOfTags(dv, div, pagePath);
  }

  /**
   * Print the list of the tags of a page `pagePath` in using its metadata `tags`.
   * @param {object} dv DataView object of Obisidian extension.
   * @param {object} container Parent HTML container.
   * @param {string} pathToPage Vault absolute path to the page with tags (or not), with extension.
   */
  async #renderListOfTags(dv, container, pathToPage) {
    const { obsidian, app } = self.customJS || {};
    if (obsidian == null || app == null) throw new Error("customJS is null.");

    // Get data
    const page = this.Obsidian.getFileByPath(app, obsidian, pathToPage);
    const pageTagNames = this.Obsidian.getFrontMatterTags(
      app,
      obsidian,
      page
    ).sort();

    // Render the list.
    const ul = dv.el("ul", "", {
      container: container,
    });
    ul.innerText = "";
    for (const pageTagName of pageTagNames) {
      dv.el("li", pageTagName, {
        container: ul,
      });
    }
  }
}
