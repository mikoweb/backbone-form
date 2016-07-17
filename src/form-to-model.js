/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license GPLv3
 */
(function () {
    "use strict";

    Backbone.form = Backbone.form || {};

    var formSelectors = {
        selectable: 'select, input[type="checkbox"], input[type="radio"]',
        inputable: 'textarea, input:not([type="radio"],[type="checkbox"],[type="button"],[type="submit"],[type="image"],[type="reset"],[type="file"])'
    };

    if (Object.freeze) {
        Object.freeze(formSelectors);
    }

    /**
     * @param {Backbone.Model} model
     * @param {HTMLElement|jQuery} form
     * @param {Object} [options]
     * @constructor
     */
    function FormToModel (model, form, options) {
        var data = Backbone.form.validModelForm(model, form);

        this._auto = false;
        this.model = data.model;
        this.form = data.form;
        this.options = _.defaults(options || {}, Backbone.form.getFormToModelDefaults());
        this.formHelper = new Backbone.form.FormHelper(this.form, this.options.naming, this.options.separator);
        this.$form = $(this.form);
        this.auto(this.options.auto);
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
                if (target[prop] && _.isObject(source[prop]) && !_.isArray(source[prop])) {
                    mergeObject(target[prop], source[prop]);
                } else if (source[prop] !== null) {
                    target[prop] = source[prop];
                } else if (target[prop] && source[prop] === null) {
                    delete target[prop];
                }
            }
        }

        return target;
    }

    /**
     * @param {Event} e
     */
    function controlBind (e) {
        if (e.currentTarget !== this.getForm()) {
            this.bindControl(e.currentTarget.getAttribute('name'));
        }
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
                    this.model.set(key, mergeObject($.extend(true, {}, oldValue), value[key]));
                } else if (_.isUndefined(oldValue) && typeof value[key] === 'object') {
                    this.model.set(key, mergeObject({}, value[key]));
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

    /**
     * @param {Boolean} auto
     */
    FormToModel.prototype.auto = function (auto) {
        if (typeof auto !== 'boolean') {
            throw new TypeError('Auto must be boolean');
        }

        if (auto && !this._auto) {
            this.bind();
            this.$form.on('change', formSelectors.selectable, $.proxy(controlBind, this));
            this.$form.on('change keyup paste input', formSelectors.inputable, $.proxy(controlBind, this));
        } else if (!auto && this._auto) {
            this.$form.off('change', formSelectors.selectable, controlBind);
            this.$form.off('change keyup paste input', formSelectors.inputable, controlBind);
        }

        this._auto = auto;
    };

    /**
     * @returns {Boolean}
     */
    FormToModel.prototype.isAuto = function () {
        return this._auto;
    };

    Backbone.form.FormToModel = FormToModel;
}());
