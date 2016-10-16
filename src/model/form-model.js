/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license LGPLv3
 */
(function () {
    "use strict";

    Backbone.form.FormModel = Backbone.Model.extend({
        keyPrefix: null,
        /**
         * @param {String} key
         * @returns {*}
         */
        data: function (key) {
            if (_.isNull(this.keyPrefix)) {
                return null;
            }

            var items = this.path(this.keyPrefix, null),
                values, item = null;

            if (_.isArray(items) && items.length) {
                item = _.first(items);
            } else if (_.isObject(items)) {
                values = _.values(items);
                item = values.length ? values[0] : null;
            }

            return item ? (item[key] ? item[key] : null) : null;
        },
        /**
         * Retrieve nested item from object/array
         *
         * @param {String} path dot separated
         * @param {*} def default value ( if result undefined )
         * @returns {*}
         */
        path: function (path, def) {
            return this._path(this.attributes, path, def);
        },
        /**
         * Retrieve nested item from object/array
         *
         * @param {Object|Array} obj
         * @param {String} path dot separated
         * @param {*} def default value ( if result undefined )
         * @returns {*}
         */
        _path: function (obj, path, def){
            var i, len;

            path = path.split('.');
            for (i = 0, len = path.length; i < len; i++){
                if (!obj || typeof obj !== 'object') {
                    return def;
                }
                obj = obj[path[i]];
            }

            if (_.isUndefined(obj)) {
                return def;
            }

            return obj;
        }
    });
}());
