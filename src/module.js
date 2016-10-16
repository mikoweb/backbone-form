if (typeof exports === 'object') {
    module.exports = Backbone.form;
} else if (typeof define === 'function' && define.amd) {
    define('backbone.form', ['backbone'], function () {
        return Backbone.form;
    });
    Backbone.form.amd = define.amd;
    define.amd = false;
}