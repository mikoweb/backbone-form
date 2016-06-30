/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license GPLv3
 */
(function () {
    "use strict";

    Backbone.form = Backbone.form || {};

    /**
     * @param {Backbone.Model} model
     * @param {HTMLElement|jQuery} form
     * @param {Object} [options]
     * @constructor
     */
    function FormToModel (model, form, options) {
        var data = Backbone.form.validModelForm(model, form);

        this.model = data.model;
        this.form = data.form;
        this.options = _.defaults(options || {}, {
            naming: 'brackets',
            separator: null,
            auto: true,
            keepPrefix: false
        });

        this.formHelper = new Backbone.form.FormHelper(this.form, this.options.naming, this.options.separator);
    }

    /**
     * @param {Object} target
     * @param {Object} source
     *
     * @returns {Object}
     */
    function mergeObject (target, source) {
        var prop;

        for (prop in source) {
            if (source.hasOwnProperty(prop)) {
                if (target[prop] && typeof source[prop] === 'object') {
                    mergeObject(target[prop], source[prop]);
                } else {
                    target[prop] = source[prop];
                }
            }
        }

        return target;
    }

    /**
     * @param {String} message
     * @constructor
     */
    FormToModel.prototype.WildcardValueError = function (message) {
        this.name = 'Backbone.form.FormToModel.WildcardValueError';
        this.message = message;
    };

    FormToModel.prototype.WildcardValueError.prototype = new Error();

    FormToModel.prototype.bind = function () {
        var inputs = this.form.querySelectorAll('[name]'), i;

        this.model.clear();

        for (i = 0; i < inputs.length; i++) {
            this.bindControl(inputs[i].getAttribute('name'));
        }
    };

    /**
     * @param {String} name
     */
    FormToModel.prototype.bindControl = function (name) {
        var value = this.formHelper.getObjectFromName(name, this.options.keepPrefix),
            keys = _.keys(value), key, oldValue;

        if (keys.length > 1) {
            throw new this.WildcardValueError('Control "' + name + '" has ' + keys.length + ' values');
        }

        if (keys.length) {
            key = keys[0];
            oldValue = this.model.get(key);

            if (value[key] !== null) {
                if (typeof oldValue === 'object' && typeof value[key] === 'object') {
                    this.model.set(key, mergeObject(oldValue, value[key]));
                } else {
                    this.model.set(key, value[key]);
                }
            }
        }
    };

    /**
     * @return {Backbone.Model}
     */
    FormToModel.prototype.getModel = function () {
        return this.model;
    };

    /**
     * @return {HTMLElement}
     */
    FormToModel.prototype.getForm = function () {
        return this.form;
    };

    Backbone.form.FormToModel = FormToModel;
}());
