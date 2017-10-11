/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');
const requireAll = require('require-all');
const glob = require('glob');
const stripExtension = require('../../backend/utils/stripExtension');

class Handlebars {
  constructor(options) {
    this.views = {};
  }

  /**
   *
   *
   * @param {any} view
   * @param {any} context
   * @param {any} options
   * @returns {string}
   */
  render(view, context, options) {
    return this.views[view](context, options);
  }

  /**
   *
   *
   * @param {any} view
   * @param {any} output
   * @param {any} context
   * @param {any} options
   * @memberof Handlebars
   */
  renderToFileSync(view, output, context, options) {
    const html = this.render(view, context, options);
    fs.writeFileSync(output, html);
  }

  /**
   * Initialize the class system to generate AMP pages based on templates
   *
   * @param {object} options `{ views, partials, helpers }` with the paths to each one
   * @returns {Promise<Handlerbars>} Resolves to the same instance to allow chaining
   */
  initialize(options) {
    const instance = this;

    function filenameToHbs(filename) {
      return path.basename(stripExtension(filename));
    }

    function registerViews() {
      return new Promise((resolve, reject) => {
        glob(path.join(options.views, '*.hbs'), {}, (error, files) => {
          files.forEach((file) => {
            const template = fs.readFileSync(file);
            instance.views[filenameToHbs(file)] = handlebars.compile(template.toString());
          });
          resolve();
        });
      });
    }

    function registerPartials() {
      return new Promise((resolve, reject) => {
        glob(path.join(options.partials, '*.hbs'), {}, (error, files) => {
          files.forEach((file) => {
            const template = fs.readFileSync(file);
            handlebars.registerPartial(filenameToHbs(file), template.toString());
          });
          resolve();
        });
      });
    }

    function registerHelpers() {
      return new Promise((resolve, reject) => {
        const helpers = requireAll(options.helpers);

        Object.keys(helpers).forEach((fileName) => {
          const helper = helpers[fileName];
          handlebars.registerHelper(helper.fn.name, helper.fn);
        });

        resolve();
      });
    }

    return registerViews()
      .then(registerPartials)
      .then(registerHelpers)
      .then(() => this);
  }
}

module.exports = Handlebars;
