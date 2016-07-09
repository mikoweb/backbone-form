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
        this.auto(this.options.auto);
    }

    ModelToForm.prototype.bind = function () {
    };

    /**
     * @param {String} attr
     */
    ModelToForm.prototype.bindAttribute = function (attr) {
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
