/* globals makeSettingsEditor */

var $ = window.$;

(function () {
    makeSettingsEditor({
        form: $('#form-setting')[0],
        submit: $('#submit-setting')
    }, {
        schemaPath: 'settings.schema.json',
        title: 'Widget settings'
    }, {
        callbackGetSettings: function (helper, form) {
            helper.getWidgetSettings(function (error, data) {
                if (error) {
                    console.error('Error: unable to get Widget Settings from Profile Cloud', error);
                } else {
                    form.setValue(data);
                }
                helper.hideLoader();
            });
        },
        callbackSetSettings: function (helper, form) {
            helper.showLoader();
            helper.setWidgetSettings(form.getValue(), function (error) {
                if (error) {
                    console.error(error);
                } else {
                    console.info('Widget Settings were saved.');
                }
                helper.hideLoader();
                helper.sendIsReady();
            });
        }
    });
}());
