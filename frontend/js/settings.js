(function () {
    makeSettingsEditor({
        form: $('#form-setting')[0],
        submit: $('#submit-setting')
    }, {
        schemaPath: 'js/settings.schema.json',
        title: ' '
    }, {
        callbackGetSettings: function (helper, form) {
            helper.getProperties(function (error, data) {
                if (error) {
                    console.error('Error: unable to get Settings from Profile Cloud', error);
                } else {
                    form.setValue(data);
                }
                helper.hideLoader();
            });
        },
        callbackSetSettings: function (helper, form) {
            helper.showLoader();
            helper.setProperties(form.getValue(), function (error) {
                if (error) {
                    console.error(error);
                } else {
                    console.info('Settings were saved.');
                }
                helper.hideLoader();
            });
        }
    });
}());
