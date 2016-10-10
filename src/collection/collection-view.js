/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license LGPLv3
 */
(function () {
    "use strict";

    Backbone.form.CollectionView = Backbone.View.extend({
        /**
         * @param {Object} options
         */
        initialize: function (options) {
            if (!_.isObject(options)) {
                throw new TypeError('CollectionView: Options is required.');
            }

            if (options.itemView && options.itemView instanceof Backbone.form.CollectionItemView) {
                this.itemView = options.itemView;
            } else {
                this.itemView = Backbone.form.CollectionItemView;
            }

            this.items = [];
            this.index = 0;
            this.htmlAttr = options.htmlAttr || '_html';
            this.isValidAttr = options.isValidAttr || '_isValid';
            this.messageAttr = options.messageAttr || '_message';
            this.closeAlert = options.closeAlert || null;
            this.removeConfirmation = options.removeConfirmation || null;
            this._onRuquestError = options.onRuquestError;
            this.setElContainer(options.elContainer);
            this.newElementPlace = options.newElementPlace || 'last';
            this.prototypeAttr = options.prototypeAttr || 'data-prototype';
            this.autofocus = options.autofocus || true;
            this.editClick = options.editClick || false;
            this.editDblClick = options.editDblClick || false;
            this.bindingOptions = options.bindingOptions || {};

            if (options.itemTemplate) {
                this.setItemTemplate(options.itemTemplate);
            } else if (this.$el.get(0).hasAttribute(this.prototypeAttr)) {
                this.setItemTemplate(this.$el.attr(this.prototypeAttr));
            } else {
                throw new Error('CollectionView: Please set itemTemplate.');
            }

            this._initFormCollection(options.formCollection);
            this._initFromElement();

            this.$el.on('click', '.form-collection__btn-add', $.proxy(this._onClickAdd, this));
            this.$el.on('click', '.form-collection__btn-save-all', $.proxy(this._onClickSaveAll, this));
            this.$el.on('click', '.form-collection__btn-remove-all', $.proxy(this._onClickRemoveAll, this));
            this.listenTo(this.formCollection, 'sync', this._onFormCollectionSync);
            this.listenTo(this.formCollection, 'error', this._onRuquestError);
            this._initBeforeUnload();
            this.disabled(false);
        },
        /**
         * Remove all items.
         */
        clear: function () {
            this.items.forEach(function (item) {
                item.destroyView(true);
            });

            this.items = [];
            this.index = 0;
            this.trigger('items:clear', this);
        },
        /**
         * @param {String} [modelKey]
         * @param {jQuery} [el]
         */
        addItem: function (modelKey, el) {
            var view, viewOptions, model = new this.formCollection.model();

            if (modelKey) {
                model.set(model.idAttribute, modelKey);
            }

            this.formCollection.add(model);
            this._addModelListeners(model);

            viewOptions = this._itemViewCommonOptions(model);

            if (el) {
                viewOptions.el = el;
                view = new this.itemView(viewOptions);
                view.disabled(false);
                view.getBinding().getFormToModel().bind();
            } else {
                view = new this.itemView(viewOptions);
                view.renderAll();
                view.disabled(false);
                view.getBinding().getFormToModel().bind();
                this._attachView(view);
            }

            this._initItemView(view);
        },
        /**
         * @param {Backbone.Model} model
         */
        addItemWithModel: function (model) {
            var view;

            this._addModelListeners(model);

            view = new this.itemView(this._itemViewCommonOptions(model));

            if (model.has(this.htmlAttr)) {
                view.loadHtml();
            } else {
                view.renderAll();
                view.disabled(false);
                view.getBinding().getModelToForm().bind();
            }

            this._attachView(view);
            this._initItemView(view);
        },
        /**
         * @param {String} template
         */
        setItemTemplate: function (template) {
            if (!_.isString(template)) {
                throw new TypeError('CollectionView: Item template is not string.');
            }

            this.itemTemplate = template;
        },
        /**
         * @param {jQuery|String} [container]
         */
        setElContainer: function (container) {
            var elContainer;

            if (_.isString(container)) {
                this.elContainer = this.$el.find(container);
            } else if (_.isObject(container)) {
                this.elContainer = container;
            } else {
                elContainer = this.$el.find('.form_collection__container');
                this.elContainer = elContainer.length ? elContainer : this.$el;
            }
        },
        /**
         * @return {Array}
         */
        getItems: function () {
            return this.items;
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
         * Initialize items from element content.
         *
         * @private
         */
        _initFromElement: function () {
            var view = this;
            this.$el.find('[data-is-item]').each(function () {
                var el = $(this),
                    key = el.attr('data-key');

                view.addItem(key, el);
            });
        },
        /**
         * @param {Backbone.Collection} collection
         * @private
         */
        _initFormCollection: function (collection) {
            if (!(collection instanceof Backbone.Collection)) {
                throw new TypeError('Form collection is not Backbone.Collection.');
            }

            this.formCollection = collection;
        },
        /**
         * @param {Backbone.Model} model
         * @private
         */
        _addModelListeners: function (model) {
            var that = this;

            if (!model.__addedItemListeners) {
                model.on('error', this._onRuquestError);
                model.on('change', function () {
                    that.trigger('model:change', model);
                });

                model.__addedItemListeners = true;
            }
        },
        /**
         * @param {Backbone.form.CollectionItemView} view
         * @private
         */
        _addViewListeners: function (view) {
            var that = this;

            view.on('item:destroy', function () {
                that.items = _.reject(that.items, function (item) {
                    return item === view;
                });
            });

            view.on('server:validation', function (valid, response, view) {
                that.trigger('server:validation', valid, response, view);
            });

            view.on('server:invalid:message', function (message, response, view) {
                that.trigger('server:invalid:message', message, response, view);
            });
        },
        /**
         * @param {Backbone.Model} formModel
         * @returns {Object}
         * @private
         */
        _itemViewCommonOptions: function (formModel) {
            return {
                template: this.itemTemplate,
                name: String(this.index),
                formModel: formModel,
                htmlAttr: this.htmlAttr,
                isValidAttr: this.isValidAttr,
                messageAttr: this.messageAttr,
                editClick: this.editClick,
                editDblClick: this.editDblClick,
                bindingOptions: this.bindingOptions,
                removeConfirmation: this.removeConfirmation
            };
        },
        /**
         * @param {Backbone.form.CollectionItemView} view
         * @private
         */
        _attachView: function (view) {
            switch (this.newElementPlace) {
                case 'last':
                    view.getElement().appendTo(this.elContainer);
                    break;
                case 'first':
                    view.getElement().prependTo(this.elContainer);
                    break;
                default:
                    view.getElement().appendTo(this.elContainer);
            }

            if (this.autofocus) {
                view.getElement().find(':input:not(button)').eq(0).focus();
            }
        },
        /**
         * @param {Backbone.form.CollectionItemView} view
         * @private
         */
        _initItemView: function (view) {
            view.doBackup();
            this._addViewListeners(view);
            this.items.push(view);
            ++this.index;
            this.trigger('items:add', this, view);
        },
        /**
         * @param {Event} e
         * @private
         */
        _onClickAdd: function (e) {
            e.stopPropagation();
            this.addItem();
            this.trigger('items:click:add', this);
        },
        /**
         * @private
         */
        _onFormCollectionSync: function (collection) {
            var view = this;

            if (collection instanceof Backbone.Collection) {
                this.clear();
                this.formCollection.models.forEach(function (model) {
                    view.addItemWithModel(model);
                });
            }
        },
        /**
         * @param {Event} e
         * @private
         */
        _onClickSaveAll: function (e) {
            var view = this;
            e.stopPropagation();

            this.disabled(true);
            function reset () {
                view.disabled(false);
            }

            if (_.isFunction(this.formCollection.save)) {
                this.formCollection.save({
                    success: reset,
                    error: reset
                });
                this.trigger('items:click:save_all', this);
            } else {
                reset();
                this.trigger('items:error:save_all', this);
            }
        },
        /**
         * @param {Event} e
         * @private
         */
        _onClickRemoveAll: function (e) {
            e.stopPropagation();
            this.clear();

            if (_.isFunction(this.formCollection.destroy)) {
                this.formCollection.destroy();
                this.trigger('items:click:remove_all', this);
            } else {
                this.formCollection.reset();
                this.formCollection.trigger('update', this.formCollection, this.options);
                this.trigger('items:error:remove_all', this);
            }
        },
        /**
         * @private
         */
        _initBeforeUnload: function () {
            var view = this,
                closeAlert = this.closeAlert;

            if (_.isFunction(closeAlert)) {
                window.addEventListener('beforeunload', function (e) {
                    var confirmationMessage, confirm;

                    confirm = _.find(view.getItems(), function (item){
                        return item.getCurrentState() === 'form';
                    });

                    if (!_.isUndefined(confirm)) {
                        confirmationMessage = closeAlert();

                        (e || window.event).returnValue = confirmationMessage;
                        return confirmationMessage;
                    }
                });
            }
        }
    });
}());
