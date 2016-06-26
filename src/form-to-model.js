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
        this.options = _.defaults(options, {
            prefix: null
        });

        this.formHelper = new Backbone.form.FormHelper(this.form, this.options.prefix);
    }

    Backbone.form.FormToModel = FormToModel;
}());
