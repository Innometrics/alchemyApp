/* global makeSettingsEditor, $ */

(function () {

    var loader = new Loader();
    loader.show();

    makeSettingsEditor({
        form: $('#form-setting')[0],
        submit: $('#submit-setting')
    }, {
        schemaPath: 'settings.schema.json',
        title: 'Widget settings'
    }, {
        callbackGetSettings: function (helper, form) {
            helper.getWidgetSettings(function (status, data) {
                if (status) {
                    form.setValue(data);
                } else {
                    console.log('Error: unable to get Widget Settings from Profile Cloud');
                }
                loader.hide();
            });
        },
        callbackSetSettings: function (helper, form) {
            loader.show();
            helper.setWidgetSettings(form.getValue(), function (status) {
                loader.hide();
                helper.sendIsReady();
                if (status) {
                    console.log('Widget Settings were saved.');
                }
            });
        }
    });

})();
