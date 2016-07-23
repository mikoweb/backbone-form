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
    function TwoWayBinding (model, form, options) {
        this.formToModel = new Backbone.form.FormToModel(model, form, options);
        this.modelToForm = new Backbone.form.ModelToForm(model, form, options);
        this.auto(_.isObject(options) && _.isBoolean(options.auto) ? options.auto : false);
    }

    /**
     * @param {Boolean} auto
     */
    TwoWayBinding.prototype.auto = function (auto) {
        this.formToModel.auto(auto);
        this.modelToForm.auto(auto);
    };

    /**
     * @returns {Boolean}
     */
    TwoWayBinding.prototype.isAuto = function () {
        return this.formToModel.isAuto() && this.modelToForm.isAuto();
    };

    /**
     * @returns {Backbone.form.FormToModel}
     */
    TwoWayBinding.prototype.getFormToModel = function () {
        return this.formToModel;
    };

    /**
     * @returns {Backbone.form.ModelToForm}
     */
    TwoWayBinding.prototype.getModelToForm = function () {
        return this.modelToForm;
    };

    Backbone.form.TwoWayBinding = TwoWayBinding;
}());
