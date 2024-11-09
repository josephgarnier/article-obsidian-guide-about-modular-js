// @ts-check

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

class ModuleLoader {
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
}

/* -------------------------------------------------------------------------- */

class UtilityLinter {
  // @ts-ignore
  static #notice = (msg) => new Notice(msg, 10000);
  static #log = (msg) => console.log(msg);
  static #noticeAndThrowError = (error) => {
    // @ts-ignore
    new Notice(error, 10000);
    throw new Error(error);
  };
  static #logAndThrowError = (error) => {
    console.log(error);
    throw new Error(error);
  };

  /**
   * Access to linter plugin.
   * @alias UtilityLinter.getLinterPlugin
   * @param {App} app Obsidian app.
   * @returns {object} Linter plugin.
   */
  static getLinterPlugin(app) {
    return app.plugins.plugins["obsidian-linter"];
  }

  /**
   * Run linter on a file.
   * @param {App} app Obsidian app.
   * @param {TFile} fileToLint File to lint.
   * @returns {Promise<void>} Linter result.
   * @throws {Error} If the linter plugin is inaccessible.
   */
  static async lintFile(app, fileToLint) {
    const linterPlugin = UtilityLinter.getLinterPlugin(app);
    if (linterPlugin) {
      if (linterPlugin?.runLinterFile) {
        return await linterPlugin.runLinterFile(fileToLint, false);
      }
    }
    throw new Error("Linter plugin is inaccessible.");
  }
}

module.exports = UtilityLinter;
