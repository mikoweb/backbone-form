/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license LGPLv3
 */
(function () {
    "use strict";

    var View, Model, model;

    View = Backbone.View.extend({
        initialize: function () {
            this.model.on('change', this.renderModel, this);
            this.form = this.$el.find('form.form-data');
            this.$formModel = this.$el.find('form.form-model');
            this.$elModel = this.$el.find('.model');
            this.$elFileModel = this.$el.find('.file-model');
            this.twoWayBinding = new Backbone.form.TwoWayBinding(this.model, this.form);
            this.formToModel = this.twoWayBinding.getFormToModel();
            this.formToModel.setFileModel(new Backbone.Model());
            this.formToModel.getFileModel().on('change', this.renderFileModel, this);
            this.twoWayBinding.auto(true);
            this.model.fetch();
        },
        events: {
            'submit form.form-data': 'onFormSubmit',
            'submit form.form-model': 'onFormModelSubmit'
        },
        /**
         * @param {Event} e
         */
        onFormSubmit: function (e) {
            e.preventDefault();
            this.twoWayBinding.getFormToModel().bind();
        },
        /**
         * @param {Event} e
         */
        onFormModelSubmit: function (e) {
            var key = this.$formModel.find('[name="model_key"]').val(),
                value = this.$formModel.find('[name="model_value"]').val();

            e.preventDefault();

            if (key && !_.isUndefined(value)) {
                try {
                    this.model.set(key, JSON.parse(value));
                } catch (e) {
                    this.model.set(key, value);
                }

                this.$formModel.find('[name]').val('');
            }
        },
        renderModel: function (model) {
            this.$elModel.JSONView(JSON.stringify(model.attributes));
        },
        renderFileModel: function (model) {
            this.$elFileModel.JSONView(JSON.stringify(model.attributes));
        }
    });

    Model = Backbone.Model.extend({
        url: 'data/form.json'
    });

    model = new Model();
    new View({
        model: model,
        el: $('#twoWayBinding')
    });
}());
