/* global makeSettingsEditor */

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
                    console.log('Error: unable to get Widget Settings from Profile Cloud');
                }
                helper.hideLoader();
            });
        },
        callbackSetSettings: function (helper, form) {
            helper.showLoader('Saving...');
            helper.setWidgetSettings(form.getValue(), function (status) {
                helper.hideLoader();
                if (status) {
                    console.log('Widget Settings were saved.');
                }
            });
        }
    });

})();