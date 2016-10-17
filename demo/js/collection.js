/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license LGPLv3
 */
(function () {
    "use strict";

    var container = $('#formCollection'), elCollectionData = $('#collectionData'),
        view, collection, Model, Collection;

    Model = Backbone.form.FormModel.extend({
        validation: {
            email: {
                required: true,
                msg: '__none'
            },
            name: {
                required: true,
                msg: '__none'
            }
        },
        sync: function(method, model, options) {
            switch (method) {
                case 'update':
                case 'create':
                    options.url = Math.random() > 0.5 ? 'data/collection/save-error.json' : 'data/collection/save.json';
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
        removeConfirmation: function (view) {
            swal({
                title: "Are you sure?",
                text: "You will not be able to recover this!",
                type: "warning",
                showCancelButton: true
            }, function () {
                view.triggerRemove.apply(view);
            });
        },
        closeAlert: function () {
            toastr.warning('Not everything has been saved.');
            return 'Are you sure you want to quit?';
        },
        onRuquestError: function () {
            sweetAlert('Oops...', 'There was a problem with the server.', 'error');
        }
    });

    view.on('items:error:save_all', function () {
        sweetAlert('Oops...', 'Your collection not implement save method.', 'error');
    });

    view.on('items:error:remove_all', function () {
        toastr.warning('You must implement destroy method to synchronize the collection with server.');
    });

    view.on('server:invalid:message', function (message) {
        sweetAlert('The server did not accept the data.', message, 'error');
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
