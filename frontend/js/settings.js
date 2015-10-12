/* global makeSettingsEditor, $ */

(function () {

    var loader = new Loader();
    loader.show();

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
                loader.hide();
            });
        },
        callbackSetSettings: function (helper, form) {
            loader.show();
            helper.setProperties(form.getValue(), function (status) {
                loader.hide();
                if (status) {
                    console.log('Settings were saved.');
                }
            });
        }
    });

})();
