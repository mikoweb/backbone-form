/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license GPLv3
 */
(function () {
    "use strict";

    Backbone.form = Backbone.form || {};
    Backbone.form.mixin = Backbone.form.mixin || {};

    var related = {};

    /**
     * @param {Object} obj
     */
    function throwIsUnexpectedRelated (obj) {
        if (!(obj instanceof this.getRelatedClass())) {
            throw new TypeError('Unexpected related object');
        }
    }

    /**
     * @returns {Array}
     */
    related.getRelated = function () {
        return this._related;
    };

    /**
     * @param {Object} obj
     *
     * @returns {Boolean}
     */
    related.isRelatedWith = function (obj) {
        return _.contains(this._related, obj);
    };

    /**
     * @param {Object} obj
     */
    related.addRelated = function (obj) {
        throwIsUnexpectedRelated.call(this, obj);

        if (!this.isRelatedWith(obj)) {
            this._related.push(obj);
            if (!obj.isRelatedWith(this)) {
                obj.addRelated(this);
            }
        }
    };

    /**
     * @param {Object} obj
     */
    related.removeRelated = function (obj) {
        throwIsUnexpectedRelated.call(this, obj);

        if (this.isRelatedWith(obj)) {
            this._related = _.reject(this._related, function (item) {
                return obj === item;
            });
            if (obj.isRelatedWith(this)) {
                obj.removeRelated(this);
            }
        }
    };

    Backbone.form.mixin.related = related;
}());
