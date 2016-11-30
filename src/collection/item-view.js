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

            var values = _.defaults(options, Backbone.form.getDefaults('collectionItemView'));

            this.bindingOptions = values.bindingOptions;
            this.htmlAttr = values.htmlAttr;
            this.isValidAttr = values.isValidAttr;
            this.messageAttr = values.messageAttr;
            this.currentState = null;
            this.name = options.name;
            this.removeConfirmation = values.removeConfirmation;
            this.validationOptions = values.validationOptions;
            this._templateRequest = true;
            this._compiledTemplate = null;
            this._backup = null;
            this._serverIsValid = true;
            this._serverMessage = null;

            this._initFormModel(options.formModel);
            this.setPlaceholder(values.placeholder);
            this.setTemplate(options.template);

            if (options.editClick === true) {
                this.$el.on('click', '.form-collection__item_preview', $.proxy(this._onSwitchToForm, this));
            }

            if (options.editDblClick === true) {
                this.$el.on('dblclick', '.form-collection__item_preview', $.proxy(this._onSwitchToForm, this));
            }

            this.$el.on('click', '.form-collection__btn-remove', $.proxy(this._onClickRemove, this));
            this.$el.on('click', '.form-collection__btn-edit', $.proxy(this._onClickEdit, this));
            this.$el.on('click', '.form-collection__btn-cancel', $.proxy(this._onClickCancel, this));
            this.$el.on('click', '.form-collection__btn-save', $.proxy(this._onClickSave, this));
            this.listenTo(this.formModel, 'destroy', this.destroyView);
            this.listenTo(this.formModel, 'change', this.renderPreview);
            this.listenTo(this.formModel, 'change', this._onFormModelChange);
        },
        /**
         * @returns {Object}
         */
        renderParams: function () {
            return {
                name: this.name,
                form: this.formModel,
                el: this.$el
            };
        },
        renderAll: function () {
            this._renderTemplate();
            this.changeState(this.formModel.isNew() ? 'form' : 'preview');
        },
        renderPreview: function () {
            var preview = this.getPreviewElement(), template, fresh;

            if (preview.length) {
                template = this._renderTemplate($('<div />'));
                fresh = this.getPreviewElement(template);
                fresh.attr('class', preview.attr('class'));
                preview.replaceWith(fresh);
            }
        },
        /**
         * "Virtual" method. It's call after fully render.
         */
        onRender: function () {},
        btnUpdate: function () {
            var btnRemove = this.$el.find('.form-collection__btn-remove'),
                btnCancel = this.$el.find('.form-collection__btn-cancel');

            if (this.formModel.isNew()) {
                btnCancel.hide();
                btnRemove.show();
            } else {
                btnCancel.show();

                if (this.currentState === 'form') {
                    btnRemove.hide();
                } else {
                    btnRemove.show();
                }
            }
        },
        /**
         * @param {Boolean} disabled
         */
        disabled: function (disabled) {
            if (disabled) {
                this.$el.find(':input').attr('disabled', 'disabled');
            } else {
                this.$el.find(':input').removeAttr('disabled');
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
         * @returns {Backbone.form.TwoWayBinding}
         */
        getBinding: function () {
            return this.twoWayBinding;
        },
        /**
         * @return {Backbone.form.ValidationView}
         */
        getValidation: function () {
            return this.validation;
        },
        /**
         * Destroy only view without model.
         *
         * @param {Boolean} [silent]
         */
        destroyView: function (silent) {
            if (silent !== true) {
                this.trigger('item:destroy', this);
            }
            this.undelegateEvents();
            this.remove();
        },
        /**
         * @returns {jQuery}
         */
        getFormElement: function () {
            return this.$el.find('.form-collection__item_form:eq(0)');
        },
        /**
         * @param {jQuery} [el]
         *
         * @returns {jQuery}
         */
        getPreviewElement: function (el) {
            return (el || this.$el).find('.form-collection__item_preview:eq(0)');
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

            this.currentState = state;
            this.btnUpdate();
        },
        /**
         * @return {String|null}
         */
        getCurrentState: function () {
            return this.currentState;
        },
        /**
         * Load html to this.$el from model html attribute. After load html attribute will be unset.
         */
        loadHtml: function () {
            var html, view = this;
            if (this.formModel.has(this.htmlAttr)) {
                html = this.formModel.get(this.htmlAttr);

                if (!_.isString(html)) {
                    throw new TypeError('Html data is not string!');
                }

                this.$el.html(html);
                this.formModel.unset(this.htmlAttr);
                setTimeout(function () {
                    view.validation._initialErrors();
                }, 100);
                this.onRender();
            }
        },
        doBackup: function () {
            this._backup = this.formModel.toJSON();
        },
        restoreBackup: function () {
            if (!_.isNull(this._backup)) {
                this.formModel.clear();
                this.formModel.set(this._backup);
            }
        },
        /**
         * Absolutely destroy model.
         */
        triggerRemove: function () {
            var view = this;
            this.disabled(true);
            function reset () {
                view.disabled(false);
            }

            this.formModel.destroy({
                success: function () {
                    reset();
                    view.trigger('item:remove', view);
                },
                error: reset
            });
        },
        /**
         * Save model.
         */
        triggerSave: function () {
            var view = this;

            this.disabled(true);
            this._serverIsValid = false;
            this._serverMessage = null;

            function reset () {
                view.disabled(false);
            }

            this.$el.find(':input').data('ready-to-validation', true);

            if (this.validation.getValidationModel().isValid(true)) {
                this.formModel.save({}, {
                    success: function (model, response) {
                        if (_.isBoolean(response[view.isValidAttr])) {
                            view._serverIsValid = response[view.isValidAttr];
                            if (!_.isUndefined(response[view.messageAttr])) {
                                view._serverMessage = response[view.messageAttr];
                            }
                        } else {
                            view._serverIsValid = true;
                        }

                        if (view._serverIsValid) {
                            view.doBackup();
                        }

                        reset();
                        view.changeState(view._serverIsValid ? 'preview' : 'form');

                        view.trigger('server:validation', view._serverIsValid, response, view);

                        if (!view._serverIsValid && view._serverMessage) {
                            view.trigger('server:invalid:message', view._serverMessage, response, view);
                        }

                        view.trigger('item:save', view);
                    },
                    error: reset
                });
            } else {
                reset();
                setTimeout(function () {
                    view.validation.getFirstErrorInput().focus();
                }, 50);
            }
        },
        /**
         * Open edit view.
         */
        triggerEdit: function () {
            this.doBackup();
            this.changeState('form');
            this.trigger('item:edit', this);
        },
        /**
         * Cancel edit.
         */
        triggerCancel: function () {
            this.restoreBackup();
            this.renderAll();
            this.bindModelToForm();
            this.changeState('preview');
            this.onRender();
            this.trigger('item:cancel', this);
        },
        bindModelToForm: function () {
            this.getBinding().getModelToForm().bind();
        },
        bindFormToModel: function () {
            this.getBinding().getFormToModel().bind();
        },
        /**
         * @param {jQuery} [el]
         *
         * @returns {jQuery}
         */
        _renderTemplate: function (el) {
            var html = $('<div />');
            el = el || this.$el;
            html.html(this.getTemplate()(this.renderParams()));
            el.empty().append(html.children());
            return el;
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
            this.validation = new Backbone.form.ValidationView(_.defaults({
                el: this.$el,
                model: this.formModel,
                autoBinding: false,
                bindingOptions: this.bindingOptions
            }, this.validationOptions));
            this.twoWayBinding = this.validation.getBinding();
            this.formToModel = this.twoWayBinding.getFormToModel();
            this.formToModel.setFileModel(new Backbone.Model());
            this.twoWayBinding.auto(true);
        },
        /**
         * @param {Event} e
         * @private
         */
        _onClickRemove: function (e) {
            e.stopPropagation();
            e.preventDefault();

            if (_.isFunction(this.removeConfirmation)) {
                this.removeConfirmation(this, this.formModel);
            } else {
                this.triggerRemove();
            }
        },
        /**
         * @param {Event} e
         * @private
         */
        _onClickSave: function (e) {
            e.stopPropagation();
            e.preventDefault();
            this.triggerSave();
        },
        /**
         * @param {Event} e
         * @private
         */
        _onClickEdit: function (e) {
            e.stopPropagation();
            e.preventDefault();
            this.triggerEdit();
        },
        /**
         * @param {Event} e
         * @private
         */
        _onClickCancel: function (e) {
            e.stopPropagation();
            e.preventDefault();
            this.triggerCancel();
        },
        /**
         * @param {Event} e
         * @private
         */
        _onFormSubmit: function (e) {
            e.preventDefault();
        },
        /**
         * @private
         */
        _onFormModelChange: function () {
            if (this.formModel.has(this.htmlAttr)) {
                this.loadHtml();
            }

            this.formModel.unset(this.isValidAttr);
            this.formModel.unset(this.messageAttr);
        },
        /**
         * @private
         */
        _onSwitchToForm: function () {
            this.changeState('form');
            this.trigger('item:swich_to_form', this);
        }
    });
}());
