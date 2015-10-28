$(function () {
    var $ = window.$;
    var inno = new IframeHelper();
    var $chart = $('#chart');

    Loader.show();

    /**
     * Main entry point
     */
    inno.onReady(function () {
        Loader.hide();
    });

});
