/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license LGPLv3
 */
(function () {
    "use strict";

    Backbone.form.FormModel = Backbone.Model.extend({
        pathPrefix: null,
        initialize: function () {
            Backbone.Model.prototype.initialize.apply(this, arguments);
            this.formData = {};
        },
        /**
         * Get attribute by string path eg. "foo.bar".
         *
         * @param {String} path dot separated.
         * @param {*} [def] default value (if result undefined).
         *
         * @returns {*}
         */
        value: function (path, def) {
            return this._path(this.attributes, this._pathWithPrefix(path), def || null);
        },
        /**
         * Get attribute from first key in array/object.
         *
         * @param {String} path dot separated.
         * @param {*} [def] default value (if result undefined).
         *
         * @returns {*}
         */
        firstValue: function (path, def) {
            var firstLevel = _.isString(this.pathPrefix) && this.pathPrefix.length
                ? this._path(this.attributes, this.pathPrefix, def || null)
                : this.attributes;

            return this._firstKeyPath(firstLevel, path, def || null);
        },
        /**
         * Get form control by path.
         *
         * @param {String} path dot separated.
         *
         * @returns {jQuery|null}
         */
        input: function (path) {
            var data = this._path(this.formData, this._pathWithPrefix(path), null), input = null;

            if (_.isFunction(data)) {
                input = data('control');
            }

            return input;
        },
        /**
         * Get form control from first key in array/object.
         *
         * @param {String} path dot separated.
         *
         * @returns {*}
         */
        firstInput: function (path) {
            var firstLevel = _.isString(this.pathPrefix) && this.pathPrefix.length
                ? this._path(this.formData, this.pathPrefix, null)
                : this.formData;

            var input = null, data = this._firstKeyPath(firstLevel, path, null);

            if (_.isFunction(data)) {
                input = data('control');
            }

            return input;
        },
        /**
         * @param {String} key
         * @return {*}
         */
        getData: function (key) {
            return this.formData[key];
        },
        /**
         * @param {String} key
         * @param {*} value
         */
        setData: function (key, value) {
            this.formData[key] = value;
        },
        /**
         * @param {String} key
         */
        unsetData: function (key) {
            if (this.hasData(key)) {
                delete this.formData[key];
            }
        },
        /**
         * @param {String} key
         * @return {boolean}
         */
        hasData: function (key) {
            return !_.isUndefined(this.formData[key]);
        },
        /**
         * Retrieve nested item from object/array.
         *
         * @param {Object|Array} obj
         * @param {String} path dot separated
         * @param {*} def default value ( if result undefined )
         *
         * @returns {*}
         *
         * @private
         */
        _path: function (obj, path, def){
            var i, len;

            path = path.split('.');
            len = path.length;
            for (i = 0; i < len; i++) {
                if (!obj || typeof obj !== 'object') {
                    return def;
                }
                obj = obj[path[i]];
            }

            if (_.isUndefined(obj)) {
                return def;
            }

            return obj;
        },
        /**
         * @param {String} path
         *
         * @returns {String}
         *
         * @private
         */
        _pathWithPrefix: function (path) {
            var value = null;

            if (!_.isString(path)) {
                throw new TypeError('Path is not string.');
            }

            if (_.isString(this.pathPrefix) && this.pathPrefix.length) {
                value = this.pathPrefix + '.' + path;
            } else {
                value = path;
            }

            return value;
        },
        /**
         * Get first element from array/object.
         *
         * @param {Object} obj
         *
         * @return {*}
         *
         * @private
         */
        _firstKey: function (obj) {
            var values, first = null;

            if (_.isArray(obj)) {
                if (obj.length) {
                    first = _.first(obj);
                }
            } else if (_.isObject(obj)) {
                values = _.values(obj);
                first = values.length ? values[0] : null;
            }

            return first;
        },
        /**
         * Mix functions _firstKey and _path.
         *
         * @param {Object} obj
         * @param {String} path
         * @param {*} def
         * @return {*}
         *
         * @private
         */
        _firstKeyPath: function (obj, path, def) {
            var value = null, data = this._firstKey(obj);

            if (_.isObject(data)) {
                value = this._path(data, path, def);
            }

            return value;
        }
    });
}());
