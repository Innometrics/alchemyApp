(function () {
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
                    console.info('Error: unable to get Widget Settings from Profile Cloud');
                }
                Loader.hide();
            });
        },
        callbackSetSettings: function (helper, form) {
            Loader.show();
            helper.setWidgetSettings(form.getValue(), function (status) {
                Loader.hide();
                helper.sendIsReady();
                if (status) {
                    console.info('Widget Settings were saved.');
                }
            });
        }
    });
}());
