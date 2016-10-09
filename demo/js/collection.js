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
                case 'update':
                case 'create':
                    options.url = 'data/collection/save-error.json';
                    break;
                case 'delete':
                    options.url = 'data/collection/remove.json';
                    break;
            }

            arguments[0] = 'get';
            Backbone.Model.prototype.sync.apply(this, arguments);
        }
    });

    Collection = Backbone.Collection.extend({
        model: Model,
        url: 'data/collection/items.json'
    });

    collection = new Collection();

    function renderJson () {
        elCollectionData.JSONView(collection.toJSON());
    }

    view = new Backbone.form.CollectionView({
        el: container,
        itemTemplate: $('#formItemTemplate').text(),
        newElementPlace: 'first',
        formCollection: collection,
        editClick: true,
        onRuquestError: function () {
            sweetAlert('Oops...', 'There was a problem with the server.', 'error');
        }
    });

    view.on('model:change', function () {
        renderJson();
    });

    collection.on('update', function () {
        renderJson();
    });

    renderJson();

    $('#loadFromJson').on('click', function (e) {
        var btn = $(e.target).attr('disabled', 'disabled');

        collection.fetch({
            success: function () {
                btn.removeAttr('disabled');
            },
            error: function () {
                btn.removeAttr('disabled');
            }
        });
    });
}());
