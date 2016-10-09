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
            this._onRuquestError = options.onRuquestError;
            this.setElContainer(options.elContainer);
            this.newElementPlace = options.newElementPlace || 'last';
            this.prototypeAttr = options.prototypeAttr || 'data-prototype';

            if (options.itemTemplate) {
                this.setItemTemplate(options.itemTemplate);
            } else if (this.$el.get(0).hasAttribute(this.prototypeAttr)) {
                this.setItemTemplate(this.$el.attr(this.prototypeAttr));
            } else {
                throw new Error('CollectionView: Please set itemTemplate.');
            }

            this.autofocus = options.autofocus || true;
            this._initFormCollection(options.formCollection);
            this._initFromElement();

            this.$el.on('click', '.form-collection__btn-add', $.proxy(this._onClickAdd, this));
            this.listenTo(this.formCollection, 'sync', this._onFormCollectionSync);
            this.listenTo(this.formCollection, 'error', this._onRuquestError);
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

            viewOptions = {
                template: this.itemTemplate,
                name: String(this.index),
                formModel: model,
                htmlAttr: this.htmlAttr
            };

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

            this._addViewListeners(view);
            this.items.push(view);
            ++this.index;
        },
        /**
         * @param {Backbone.Model} model
         */
        addItemWithModel: function (model) {
            var view;

            this._addModelListeners(model);
            view = new this.itemView({
                template: this.itemTemplate,
                name: String(this.index),
                formModel: model,
                htmlAttr: this.htmlAttr
            });

            if (model.has(this.htmlAttr)) {
                view.loadHtml();
            } else {
                view.renderAll();
                view.disabled(false);
                view.getBinding().getModelToForm().bind();
            }

            this._attachView(view);
            this._addViewListeners(view);
            this.items.push(view);
            ++this.index;
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
         * @private
         */
        _onClickAdd: function () {
            this.addItem();
        },
        /**
         * @private
         */
        _onFormCollectionSync: function (collection) {
            var view = this;

            if (collection instanceof Backbone.Collection) {
                this.items.forEach(function (item) {
                    item.destroyView(true);
                });

                this.items = [];
                this.index = 0;

                this.formCollection.models.forEach(function (model) {
                    view.addItemWithModel(model);
                });
            }
        }
    });
}());
