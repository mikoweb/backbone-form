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
    function ModelToForm (model, form, options) {
        var data = Backbone.form.validModelForm(model, form);

        this._auto = false;
        this.model = data.model;
        this.form = data.form;
        this.options = _.defaults(options || {}, Backbone.form.getModelToFormDefaults());
        this.formHelper = new Backbone.form.FormHelper(this.form, this.options.naming, this.options.separator);
        this.prefix = this.options.prefix;
        this.$form = $(this.form);
        this.auto(this.options.auto);
    }

    ModelToForm.prototype.bind = function () {
    };

    /**
     * @param {Array|String[]} attr
     */
    ModelToForm.prototype.bindAttribute = function (attr) {
        var i, current, value, name;

        if (!_.isArray(attr)) {
            throw new TypeError('Attribute must be Array');
        }

        if (attr.length === 0) {
            throw new TypeError('Array is empty!');
        }

        current = this.model.get(attr[0]);
        i = 1;
        while (!_.isUndefined(current) && i < attr.length) {
            current = current[attr[i]];
            ++i;
        }

        if (attr.length === i && ((!_.isUndefined(current) && !_.isObject(current)) || _.isArray(current))) {
            if (_.isArray(current)) {
                name = this.formHelper.createName(attr.join('.'), this.prefix, true);
                if (!this.$form.find('[name="' + name + '"]').length) {
                    name = this.formHelper.createName(attr.join('.'), this.prefix);
                }
            } else {
                name = this.formHelper.createName(attr.join('.'), this.prefix);
            }

            this.formHelper.setControlValue(name, current);
        }
    };

    /**
     * @return {Backbone.Model}
     */
    ModelToForm.prototype.getModel = function () {
        return this.model;
    };

    /**
     * @return {HTMLElement}
     */
    ModelToForm.prototype.getForm = function () {
        return this.form;
    };

    /**
     * @param {Boolean} auto
     */
    ModelToForm.prototype.auto = function (auto) {
        if (typeof auto !== 'boolean') {
            throw new TypeError('Auto must be boolean');
        }

        this._auto = auto;
    };

    /**
     * @returns {Boolean}
     */
    ModelToForm.prototype.isAuto = function () {
        return this._auto;
    };

    Backbone.form.ModelToForm = ModelToForm;
}());
