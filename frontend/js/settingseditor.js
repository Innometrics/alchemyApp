/* eslint-disable no-unused-vars */
function makeSettingsEditor (handlers, options, callbacks) {
/* eslint-enable no-unused-vars */
    var $ = window.$;

    // Step 1. Define default path to file with schema
    // default path to json schema of sesstings' fields
    var settingsSchemaSrc = options.schemaPath;

    // Step 2. If custom path was defined - is it
    if (settingsSchemaSrc in window) {
        // use custom path if exists
        settingsSchemaSrc = window.settingsSchemaSrc;
    }

    // Step 3. Get data from json file. Call onPropertiesSchemaReady() when schema received
    $.getJSON(settingsSchemaSrc, function (propertiesSchema) {
        onPropertiesSchemaReady(propertiesSchema);
    });

    // Step 4. Render form (using cool JSONEditor), init some other tools and listen "click" on form's submit button
    var onPropertiesSchemaReady = function (propertiesSchema) {
        /**
         * JSON Schema -> HTML Editor
         * https://github.com/jdorn/json-editor/
         */
        var editor = new JSONEditor(handlers.form, {
            disable_collapse: true,
            disable_edit_json: true,
            disable_properties: true,
            no_additional_properties: true,
            schema: {
                type: 'object',
                title: options.title,
                properties: propertiesSchema
            },
            required: [],
            required_by_default: true,
            theme: 'bootstrap3'
        });

        // Init InnoHelper
        var inno = new InnoHelper();

        inno.showLoader();
        inno.onReady(function () {
            callbacks.callbackGetSettings(inno, editor);
        });

        // Listen submit button click event
        handlers.submit.on('click', function () {
            var errors = editor.validate();
            if (errors.length) {
                errors = errors.map(function (error) {
                    var field = editor.getEditor(error.path),
                        title = field.schema.title;
                    return title + ': ' + error.message;
                });
                console.info(errors.join('\n'));
            } else {
                callbacks.callbackSetSettings(inno, editor);
            }
        });
    };
}
