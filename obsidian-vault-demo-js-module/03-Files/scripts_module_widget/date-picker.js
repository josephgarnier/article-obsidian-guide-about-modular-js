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
 * @typedef {import('moment').Moment} Moment
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

/** @type {typeof import('module-utility-templater')} */
const Templater = ModuleLoader.importModule("common", "utility-templater.js");

/* -------------------------------------------------------------------------- */

class DatePicker {
  // @ts-ignore
  #notice = (msg) => new Notice(msg, 10000);
  #log = (msg) => console.log(msg);
  #noticeAndThrowError = (error) => {
    // @ts-ignore
    new Notice(error, 10000);
    throw new Error(error);
  };
  #logAndThrowError = (error) => {
    console.log(error);
    throw new Error(error);
  };
  #noticeAndLog = (error) => {
    // @ts-ignore
    new Notice(error, 10000);
    console.log(error);
  };

  /**
   * Date selector in a form.
   * @param {boolean} throw_on_cancel Throws an error if the prompt is canceled, instead of returning a null value.
   * @param {string} placeholder Placeholder string of the prompt.
   * @returns {Promise<string>} The selected date in the format "YYYY-MM-DD".
   */
  async pickDate(throw_on_cancel, placeholder) {
    const { obsidian, app } = self.customJS || {};
    if (obsidian == null || app == null) throw new Error("customJS is null.");

    const templaterPlugin = Templater.getTemplaterPlugin(app);
    const tp = templaterPlugin.templater.current_functions_object;

    // Set up constants for script
    const { moment } = obsidian;
    const dayOfWeek = moment().day();
    const dateFormat = "YYYY-MM-DD";

    // Sets up a set of pre-made suggestions - today, tomorrow, and the previous 7 days
    const suggestions = new Map();
    suggestions.set(
      "Yesterday, " + moment().subtract(1, "days").format("ddd DD MMM"),
      moment().subtract(1, "days")
    );
    suggestions.set("Today, " + moment().format("ddd DD MMM"), moment());
    suggestions.set(
      "Tomorrow, " + moment().add(1, "days").format("ddd DD MMM"),
      moment().add(1, "days")
    );
    suggestions.set(
      moment().add(2, "days").format("ddd DD MMM"),
      moment().add(2, "days")
    );
    suggestions.set(
      moment().add(3, "days").format("ddd DD MMM"),
      moment().add(3, "days")
    );
    suggestions.set(
      moment().add(4, "days").format("ddd DD MMM"),
      moment().add(4, "days")
    );
    suggestions.set(
      moment().add(5, "days").format("ddd DD MMM"),
      moment().add(5, "days")
    );
    suggestions.set(
      moment().add(6, "days").format("ddd DD MMM"),
      moment().add(6, "days")
    );
    suggestions.set(
      moment().add(7, "days").format("ddd DD MMM"),
      moment().add(7, "days")
    );
    suggestions.set("> Manual", "manual");
    suggestions.set("> Calendar", "full date picker");

    // Prompts for selection
    const selection = await tp.system.suggester(
      [...suggestions].map(([k, v]) =>
        k !== "> Manual" ? k + " (" + v.format(dateFormat) + ")" : k
      ),
      Array.from(suggestions.values()),
      throw_on_cancel,
      placeholder
    );

    // Resolves selection
    /** @type {Moment} */
    let resultDate;
    if (selection === "manual") {
      // Asks for manual input if user selected "Manual" (the associated value is "null")
      const inputDate = await tp.system.prompt(`Type a date (${dateFormat}):`);
      if (!inputDate) return "";

      resultDate = moment(inputDate, dateFormat);
      if (!resultDate.isValid()) {
        this.#notice("Invalid date format.");
        throw new Error("Invalid date format.");
      }
    } else if (selection === "full date picker") {
      // This is a full year/month/day picker

      // Year picker with the 10 next years options (from YYYY to YYYY+10).
      let thisYear = Number(tp.date.now("YYYY"));
      let yearList = [];
      for (let i = 0; i < 10; i++) {
        yearList.push(thisYear + i);
      }
      const year = await tp.system.suggester(
        yearList,
        yearList,
        throw_on_cancel
      );
      if (!year) return "";

      // Month picker with all months in the format MM
      const month = await tp.system.suggester(
        moment.months(),
        Array(12)
          .fill(0)
          .map((_, i) => i + 1),
        throw_on_cancel
      );
      if (!month) return "";

      // Day picker
      const daysInMonth = moment(`${year}-${month}`, "YYYY-MM").daysInMonth();

      let dateList = [];
      for (let day = 1; day <= daysInMonth; day++) {
        dateList.push(moment(`${year}-${month}-${day}`, "YYYY-MM-DD"));
      }

      // Formats dates for picking
      let dateListString = dateList.map((date) => {
        return date.format("DD MMMM YYYY");
      });
      resultDate = await tp.system.suggester(
        dateListString,
        dateList,
        throw_on_cancel
      );
      if (!resultDate) return "";
      if (!resultDate.isValid()) {
        this.#notice("Invalid date format.");
        throw new Error("Invalid date format.");
      }
    } else {
      resultDate = selection;
    }

    return resultDate.format(dateFormat);
  }
}