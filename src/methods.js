/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license GPLv3
 */
(function () {
    "use strict";

    Backbone.form = Backbone.form || {};

    var formToModelDefaults = {};

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

        if (form.jquery) {
            form = form.get(0);
        }

        if (!(model instanceof Backbone.Model)) {
            throw new TypeError('expected Backbone.Model');
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
            naming: 'brackets',
            separator: null,
            auto: true,
            keepPrefix: true
        });
    };

    Backbone.form.setFormToModelDefaults();
}());
