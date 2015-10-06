/* global makeSettingsEditor */

(function () {

    Loader.show();

    makeSettingsEditor({
        form: $('#form-setting')[0],
        submit: $('#submit-setting')
    }, {
        schemaPath: 'js/settings.schema.json',
        title: 'App settings stored in Innometrics Cloud'
    }, {
        callbackGetSettings: function (helper, form) {
            helper.getProperties(function (status, data) {
                if (status) {
                    form.setValue(data);
                } else {
                    console.log('Error: unable to get Settings from Profile Cloud');
                }
                Loader.hide();
            });
        },
        callbackSetSettings: function (helper, form) {
            Loader.show();
            helper.setProperties(form.getValue(), function (status) {
                Loader.hide();
                if (status) {
                    console.log('Settings were saved.');
                }
            });
        }
    });

})();