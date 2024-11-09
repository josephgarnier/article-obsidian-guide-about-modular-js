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

/** @type {typeof import('module-config')} */
const Config = ModuleLoader.importModule("common", "config.js");
const Path = require("node:path");
const Fs = require("node:fs");
/* -------------------------------------------------------------------------- */

class UtilityFileSystem {
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
  static #noticeAndLog = (error) => {
    // @ts-ignore
    new Notice(error, 10000);
    console.log(error);
  };

  /**
   * Normalize and return the root path associate to the current platform.
   * @returns {string} The normalized root path.
   * @throws Error if platform is not supported or unknown.
   */
  static normalizedRootPath() {
    const userAgent = // @ts-ignore
      (navigator.userAgentData.platform ?? navigator.platform).toLowerCase();

    if (userAgent.includes("win")) {
      return Path.normalize(Config.fsRootPaths.windows);
    } else if (userAgent.includes("android")) {
      throw new Error("Unsupported platform.");
    } else if (userAgent.includes("mac")) {
      return Path.normalize(Config.fsRootPaths.mac);
    } else if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
      throw new Error("Unsupported platform.");
    } else if (userAgent.includes("linux")) {
      return Path.normalize(Config.fsRootPaths.linux);
    }
    throw new Error("Unknown platform.");
  }

  /**
   * Join the root path from `Config.fsRootPath` with `relativePath`, the normalize them.
   * @param {string} relativeFilePath The relative file path to resolve.
   * @returns {string} The abslute file path from root.
   */
  static absolutePath(relativeFilePath) {
    const rootPath = UtilityFileSystem.normalizedRootPath();
    const absolutePath = Path.join(rootPath, Path.normalize(relativeFilePath));
    return absolutePath;
  }

  /**
   * Solve the relative path from `Config.fsRootPath` to `absoluteFilePath`.
   * @param {string} absoluteFilePath The absolute file path to resolve
   * @returns {string} The relative file path from root.
   */
  static relativePathToRoot(absoluteFilePath) {
    const rootPath = UtilityFileSystem.normalizedRootPath();
    const relativeFilePath = Path.relative(
      rootPath,
      Path.normalize(absoluteFilePath)
    );
    return relativeFilePath;
  }

  /**
   * Check if something exists at the path.
   * @param {string} filePath Path to file.
   * @returns {boolean} `true` if a file exists at this path; otherwise `false`.
   */
  static existsSync(filePath) {
    let exists = true;
    try {
      Fs.accessSync(filePath, Fs.constants.F_OK);
    } catch (err) {
      exists = false;
    }
    return exists;
  }

  /**
   * Asynchronously check if something exists at the path.
   * @param {string} filePath Path to file.
   * @returns {Promise<boolean>}
   */
  async exists(filePath) {
    try {
      await Fs.promises.access(filePath, Fs.constants.F_OK);
      return true;
    } catch (err) {
      return false;
    }
  }
}

module.exports = UtilityFileSystem;
