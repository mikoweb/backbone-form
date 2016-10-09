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

            this.index = 0;
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

            this.btnAddSelector = options.btnAddSelector || '.form-collection__btn-add';
            this.$el.on('click', this.btnAddSelector, $.proxy(this._onClickAdd, this));
        },
        /**
         * @param {String} [modelKey]
         * @param {jQuery} [el]
         */
        addItem: function (modelKey, el) {
            var that = this, view, viewOptions, model = new this.formCollection.model();

            if (modelKey) {
                model.set(model.idAttribute, modelKey);
            }

            this.formCollection.add(model);
            model.on('change', function () {
                that.trigger('model:change', model, view);
            });

            viewOptions = {
                template: this.itemTemplate,
                name: String(this.index),
                formModel: model
            };

            if (el) {
                viewOptions.el = el;
                view = new this.itemView(viewOptions);
                view.bind();
            } else {
                view = new this.itemView(viewOptions);
                view.render();
                view.bind();

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
                    view.getElement().find(':input').eq(0).focus();
                }
            }

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
         * @private
         */
        _onClickAdd: function () {
            this.addItem();
        }
    });
}());
