(function () {
    makeSettingsEditor({
        form: $('#form-setting')[0],
        submit: $('#submit-setting')
    }, {
        schemaPath: 'js/settings.schema.json',
        title: ' '
    }, {
        callbackGetSettings: function (helper, form) {
            helper.getProperties(function (status, data) {
                if (status) {
                    form.setValue(data);
                } else {
                    console.info('Error: unable to get Settings from Profile Cloud');
                }
                Loader.hide();
            });
        },
        callbackSetSettings: function (helper, form) {
            Loader.show('Saving...');
            helper.setProperties(form.getValue(), function (status) {
                if (status) {
                    console.info('Settings were saved.');
                }
                Loader.hide();
            });
        }
    });
}());
