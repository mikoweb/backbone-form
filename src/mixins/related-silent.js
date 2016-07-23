/**
 * @author Rafał Mikołajun <rafal@mikoweb.pl>
 * @license GPLv3
 */
(function () {
    "use strict";

    Backbone.form = Backbone.form || {};
    Backbone.form.mixin = Backbone.form.mixin || {};

    var relatedSilent = {};

    /**
     * @param {Boolean} silent
     */
    relatedSilent.silentRelated = function (silent) {
        var i, related = this.getRelated();

        if (typeof silent !== 'boolean') {
            throw new TypeError('silent must be boolean');
        }

        for (i = 0; i < related.length; ++i) {
            related[i]._silent = silent;
        }
    };

    Backbone.form.mixin.relatedSilent = relatedSilent;
}());
