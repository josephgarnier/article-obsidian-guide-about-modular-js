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

/** @type {typeof import('module-utility-obsidian')} */
const Obsidian = ModuleLoader.importModule("common", "utility-obsidian.js");
/** @type {typeof import('module-config')} */
const Config = ModuleLoader.importModule("common", "config.js");
/* -------------------------------------------------------------------------- */

class UtilityTemplater {
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
   * Access to templater plugin.
   * @alias UtilityTemplater.getTemplaterPlugin
   * @param {App} app Obsidian app.
   * @returns {object} Tempater plugin.
   */
  static getTemplaterPlugin(app) {
    return app.plugins.plugins["templater-obsidian"];
  }

  /**
   * Create a new templated file inside the vault.
   * @alias UtilityTemplater.createFileWithTemplate
   * @param {App} app A reference to the Obsidian `app`.
   * @param {Obsidian} obsidian A reference to the Obsidian API.
   * @param {string} filePath Vault absolute path for the new file, with extension.
   * @param {string} templateFileName Name of a template file with extension in the folder {@link TEMPLATE_FOLDER_PATH}.
   * @returns {Promise<TFile>} Created file.
   * @throws {Error} If error while creating.
   */
  static async createFileWithTemplate(
    app,
    obsidian,
    filePath,
    templateFileName
  ) {
    try {
      const templateContent = await UtilityTemplater.getTemplateContent(
        app,
        obsidian,
        templateFileName
      );

      const newFile = await Obsidian.createFileWithInput(
        app,
        obsidian,
        filePath,
        templateContent
      );

      await UtilityTemplater.replaceTemplateCommandsInFile(app, newFile);
      await Obsidian.cacheUpdate(app, newFile);
      return newFile;
    } catch (e) {
      Obsidian.removeFile(app, obsidian, filePath);
      throw new Error(
        `Error when creating file '${filePath}' with template '${templateFileName}' : \n\n${e}.`
      );
    }
  }

  /**
   * Get the content of a template file stored inside the folder vault specified by {@link TEMPLATE_FOLDER_PATH}.
   * @alias UtilityTemplater.getTemplateContent
   * @param {App} app A reference to the Obsidian `app`.
   * @param {Obsidian} obsidian A reference to the Obsidian API.
   * @param {string} templateFileName Name of a template file with extension in the folder {@link TEMPLATE_FOLDER_PATH}.
   * @returns {Promise<string>}
   * @throws {Error} If template file not found.
   */
  static async getTemplateContent(app, obsidian, templateFileName) {
    const templateFilePath = obsidian.normalizePath(
      `${Config.obsidianFolderPaths.templateSource}/${templateFileName}`
    );
    const templateFile = app.vault.getAbstractFileByPath(templateFilePath);
    if (!templateFile || !(templateFile instanceof obsidian.TFile)) {
      throw new Error(`Template file not found at path '${templateFilePath}'.`);
    }

    return await app.vault.cachedRead(templateFile);
  }

  /**
   * Overwrite all template command in a file.
   * @alias UtilityTemplater.replaceTemplateCommandsInFile
   * @param {App} app Obsidian app.
   * @param {TFile} file The file where the template will be processed.
   * @param {boolean} [force=false] Overwrite existing file.
   */
  static async replaceTemplateCommandsInFile(app, file, force = false) {
    const templaterPlugin = UtilityTemplater.getTemplaterPlugin(app);
    if (
      templaterPlugin &&
      (force || !templaterPlugin.settings["trigger_on_file_creation"])
    ) {
      const impl = templaterPlugin?.templater;
      if (impl?.overwrite_file_commands) {
        await impl.overwrite_file_commands(file);
      }
    } else if (
      templaterPlugin &&
      templaterPlugin.settings["trigger_on_file_creation"]
    ) {
      UtilityTemplater.#log(
        "Templater options 'trigger_on_file_creation' detected. Skip Templater."
      );
    }
  }

  /**
   * Insert the template contained in file `templateFile` into file `targetFile`, then parse file `targetFile` to interpret the template.
   * @param {App} app A reference to the Obsidian `app`.
   * @param {TFile} templateFile The `TFile` object representing the template file.
   * @param {TFile} targetFile The `TFile` object representing the target file where the template will be inserted.
   * @param {TFile | null} activeFile The active file (if existing) when launching Templater.
   * @returns {Promise<string>} The content of `targetFile` after it has been parsed.
   * @throws {Error} If the template plugin or its functions are inaccessibles.
   */
  static async parseTemplate(app, templateFile, targetFile, activeFile) {
    const templaterPlugin = UtilityTemplater.getTemplaterPlugin(app);
    if (templaterPlugin) {
      const impl = templaterPlugin?.templater;
      if (impl?.read_and_parse_template) {
        return await impl.read_and_parse_template({
          template_file: templateFile,
          target_file: targetFile,
          run_mode: 4, // == templater.RunMode.DynamicProcessor
          active_file: activeFile,
        });
      }
    }
    throw new Error("Templater plugin is inaccessible!");
  }
}

module.exports = UtilityTemplater;
