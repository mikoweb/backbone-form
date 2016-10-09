/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license LGPLv3
 */
(function () {
    "use strict";

    var formToModelDefaults = {},
        modelToFormDefaults = {};

    /**
     * @param {Backbone.Model} model
     * @param {HTMLElement|jQuery} form
     * 
     * @returns {{model: Backbone.Model, form: HTMLElement}}
     */
    Backbone.form.validModelForm = function (model, form) {
        if (_.isUndefined(model)) {
            throw new TypeError('model is undefined');
        }

        if (_.isUndefined(form)) {
            throw new TypeError('form is undefined');
        }

        if (!(model instanceof Backbone.Model)) {
            throw new TypeError('expected Backbone.Model');
        }

        if (!(form instanceof HTMLElement) && _.isFunction(form.get)) {
            form = form.get(0);
        }

        if (!(form instanceof HTMLElement)) {
            throw new TypeError('expected HTMLElement');
        }

        return {
            model: model,
            form: form
        };
    };

    /**
     * @returns {Object}
     */
    Backbone.form.getFormToModelDefaults = function () {
        return formToModelDefaults;
    };

    /**
     * @param {Object} [options]
     */
    Backbone.form.setFormToModelDefaults = function (options) {
        formToModelDefaults = _.defaults(options || {}, {
            naming: Backbone.form.FormHelper.MODES.brackets,
            separator: null,
            auto: false,
            keepPrefix: true
        });
    };

    /**
     * @returns {Object}
     */
    Backbone.form.getModelToFormDefaults = function () {
        return modelToFormDefaults;
    };

    /**
     * @param {Object} [options]
     */
    Backbone.form.setModelToFormDefaults = function (options) {
        modelToFormDefaults = _.defaults(options || {}, {
            naming: Backbone.form.FormHelper.MODES.brackets,
            separator: null,
            auto: false,
            prefix: null
        });
    };
}());
