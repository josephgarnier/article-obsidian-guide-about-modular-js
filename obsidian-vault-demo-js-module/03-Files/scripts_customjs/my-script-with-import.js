// @ts-check

class MacroGuideWithImport {
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
   * @typedef {import('module-my-class')} MyClass
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
  Obsidian = MacroGuideWithImport.importModule("common", "utility-obsidian.js");
  /** @type {typeof import('module-my-class')} */
  // MyClass = MacroGuideWithImport.importModule("mymodule", "my-class.js");
  /* -------------------------------------------------------------------------- */

  /**
   * @param {object} dv DataView object of Obsidian extension.
   */
  helloWorld(dv) {
    const { obsidian, app } = self.customJS || {};
    if (obsidian == null || app == null) throw new Error("customJS is null.");

    // To call a static function
    const pathToPage = "01-Articles/Demo.md";
    const page = this.Obsidian.getFileByPath(app, obsidian, pathToPage);

    // To instanciate a class
    // const myObject = new this.MyClass();

    dv.span(
      "You read the page: " +
        dv.fileLink(page.path, false, "Guide for Obsidian")
    ) + ".";
  }
}
