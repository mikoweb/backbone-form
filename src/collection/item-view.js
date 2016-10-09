/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license LGPLv3
 */
(function () {
    "use strict";

    Backbone.form.CollectionItemView = Backbone.View.extend({
        events: {
            'submit form': '_onFormSubmit'
        },
        /**
         * @param {Object} options
         */
        initialize: function (options) {
            if (!_.isObject(options)) {
                throw new TypeError('CollectionItemView: Options is required.');
            }

            if (!_.isString(options.name)) {
                throw new TypeError('CollectionItemView: option name is not string.');
            }

            this.$el.addClass('form-collection__item');
            this._initFormModel(options.formModel);
            this._templateRequest = true;
            this._compiledTemplate = null;
            this.name = options.name;
            this.setPlaceholder(options.placeholder || '__name__');
            this.setTemplate(options.template);

            this.btnRemoveSelector = options.btnRemoveSelector || '.form-collection__btn-remove';
            this.$el.on('click', this.btnRemoveSelector, $.proxy(this._onClickRemove, this));
            this.listenTo(this.formModel, 'destroy', this.destroyView);
            this.listenTo(this.formModel, 'change', this.renderPreview);
        },
        /**
         * @returns {Object}
         */
        renderParams: function () {
            return {
                name: this.name,
                form: this.formModel
            };
        },
        render: function () {
            this.$el.html(this.getTemplate()(this.renderParams()));
            this.changeState(this.formModel.isNew() ? 'form' : 'preview');
        },
        renderPreview: function () {
            var preview = this.getPreviewElement(), template, fresh;

            if (preview.length) {
                template = $('<div />').html(this.getTemplate()(this.renderParams()));
                fresh = template.find('.' + this.getPreviewElementClass());
                fresh.attr('class', preview.attr('class'));
                preview.replaceWith(fresh);
            }
        },
        /**
         * @returns {Function}
         */
        getTemplate: function () {
            if (this._compiledTemplate === null || this._templateRequest) {
                this._compiledTemplate = this._createTemplate();
                this._templateRequest = false;
            }

            return this._compiledTemplate;
        },
        /**
         * Set "placeholder", which you'll replace with a unique, incrementing number.
         *
         * @param {String|null} placeholder
         */
        setPlaceholder: function (placeholder) {
            this._templateRequest = true;
            this.placeholder = String(placeholder);
        },
        /**
         * @param {String} template
         */
        setTemplate: function (template) {
            if (!_.isString(template)) {
                throw new TypeError('CollectionItemView: Template is not string');
            }

            this._templateRequest = true;
            this.template = template;
        },
        /**
         * @returns {jQuery}
         */
        getElement: function () {
            return this.$el;
        },
        /**
         * Bind data from from to model.
         */
        bind: function () {
            if (this.formToModel) {
                this.formToModel.bind();
            }
        },
        /**
         * Destroy only view without model.
         */
        destroyView: function () {
            this.trigger('item:destroy', this);
            this.undelegateEvents();
            this.remove();
        },
        /**
         * @returns {jQuery}
         */
        getFormElement: function () {
            return this.$el.find('.form-collection__item_form');
        },
        /**
         * @returns {jQuery}
         */
        getPreviewElement: function () {
            return this.$el.find('.' + this.getPreviewElementClass());
        },
        /**
         * @returns {string}
         */
        getPreviewElementClass: function () {
            return 'form-collection__item_preview';
        },
        /**
         * @param {String} state
         */
        changeState: function (state) {
            var form = this.getFormElement(),
                preview = this.getPreviewElement(),
                formDisabled = 'form-collection__item_form--disabled',
                previewDisabled = 'form-collection__item_preview--disabled';

            switch (state) {
                case 'form':
                    form.removeClass(formDisabled);
                    preview.addClass(previewDisabled);
                    break;
                case 'preview':
                    form.addClass(formDisabled);
                    preview.removeClass(previewDisabled);
            }
        },
        /**
         * @private
         */
        _onClickRemove: function () {
            this.formModel.destroy();
        },
        /**
         * @returns {Function}
         * @private
         */
        _createTemplate: function () {
            var template;

            if (this.placeholder.length && !_.isNull(this.name)) {
                template = this.template.replace(new RegExp(this.placeholder, 'g'), this.name);
            } else {
                template = this.template;
            }

            return _.template(template);
        },
        /**
         * @param {Backbone.Model} model
         * @private
         */
        _initFormModel: function (model) {
            if (!(model instanceof Backbone.Model)) {
                throw new TypeError('Form model is not Backbone.Model.');
            }

            this.formModel = model;
            this.twoWayBinding = new Backbone.form.TwoWayBinding(this.formModel, this.$el);
            this.formToModel = this.twoWayBinding.getFormToModel();
            this.formToModel.setFileModel(new Backbone.Model());
            this.twoWayBinding.auto(true);
        },
        /**
         * @param {Event} e
         * @private
         */
        _onFormSubmit: function (e) {
            e.preventDefault();
        }
    });
}());
