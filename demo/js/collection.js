/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license LGPLv3
 */
(function () {
    "use strict";

    var container = $('#formCollection'), elCollectionData = $('#collectionData'),
        view, collection, Model, Collection;

    Model = Backbone.Model.extend({
        sync: function(method, model, options) {
            switch (method) {
                case 'delete':
                    options.url = 'data/collection/remove.json';
                    break;
            }

            arguments[0] = 'get';
            Backbone.Model.prototype.sync.apply(this, arguments);
        }
    });

    Collection = Backbone.Collection.extend({
        model: Model
    });

    collection = new Collection();

    function renderJson () {
        elCollectionData.JSONView(collection.toJSON());
    }

    view = new Backbone.form.CollectionView({
        el: container,
        itemTemplate: $('#formItemTemplate').text(),
        newElementPlace: 'first',
        formCollection: collection
    });

    view.on('model:change', function () {
        renderJson();
    });

    collection.on('update', function () {
        renderJson();
    });

    renderJson();
}());
