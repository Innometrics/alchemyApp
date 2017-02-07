var express = require('express');
var request = require('request');
// Using Express library for simple web server functionality
var bodyParser = require('body-parser');
// Innometrics helper to work with profile cloud
var inno = require('innometrics-helper');

/* eslint-disable no-process-env */
var env = process.env;
/* eslint-enable no-process-env */
var app = express();
var port = parseInt(env.PORT, 10);

// Parse application/json request
app.use(bodyParser.json());

/**
 * If your app's frontend part is going to communicate directly with backend, you need to allow this
 * https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
 */

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

/**
 * Init params from environment variables. Innometrics platform sets environment variables during installation
 * to your Cloud Platform of choice.
 * If you use manual install of backend part to your own servers, you will need to setup these manually.
 */
var vars = {
    bucketName: env.INNO_BUCKET_ID,
    appKey: env.INNO_APP_KEY,
    apiUrl: env.INNO_API_HOST,
    appName: env.INNO_APP_ID,
    groupId: env.INNO_COMPANY_ID
};

/**
 *
 * Format successfull or failed response object
 * @param  {Object}         res     Express response object
 * @param  {Error|String}   error   Error text or Object
 * @param  {String}         message
 * @return {Object}
 */
var sendResponse = function (res, error, message) {
    if (error) {
        console.error(error);
    } else {
        console.info(message);
    }
    return res.json({
        error: error && error.message || error,
        message: message
    });
};

var innoHelper = new inno.InnoHelper(vars);

// POST request to "/" is always expected to recieve stream with events
app.post('/', function (req, res) {
    var url;
    var profile;
    try {
        profile = innoHelper.getProfileFromRequest(req.body);
        var session = profile.getLastSession();
        var events = session.getEvents();
        var event = events[0];
        url = event.getDataValue('page-url');
        if (!url) {
            throw Error('URL not found');
        }
    } catch (err) {
        return sendResponse(res, err);
    }

    // Get application settings
    innoHelper.getAppSettings(function (err, settings) {
        if (err) {
            throw err;
        }

        var alchemyUrl = 'http://access.alchemyapi.com/calls/url/URLGetRankedNamedEntities?' +
            'apikey=' + settings.api_key +
            '&url=' + url +
            '&outputMode=json';

        // Get Alchemy analyze of the page
        request.get(alchemyUrl, function (err, response) {
            if (err) {
                throw err;
            }

            var result = JSON.parse(response.body);
            if (result && result.status === 'ERROR') {
                return sendResponse(res, result.statusInfo);
            }

            var interests = getInterests(result.entities, settings);

            collectCommonData(result.entities, settings, function (err) {
                if (err) {
                    return sendResponse(res, err);
                }
            });

            if (!interests.length) {
                return sendResponse(res, null, 'No attributes to update');
            }

            // Get full profile from Data Handler
            innoHelper.loadProfile(profile.getId(), function (err, fullProfile) {
                if (err) {
                    return sendResponse(res, err);
                }

                // Process and update attributes according to Alchemy response
                try {
                    interests.forEach(function (item) {
                        if (item.relevance >= settings.minRelevance) {
                            var id = getAttributeId(item.text);
                            var attribute;
                            try {
                                attribute = fullProfile.getAttribute(id, innoHelper.getCollectApp(), settings.section);
                            } catch (e) {
                                console.error(e);
                            }
                            var count = parseInt(item.count, 10);

                            if (!attribute) {
                                attribute = new inno.Profile.Attribute({
                                    name: id,
                                    value: count,
                                    section: settings.section,
                                    collectApp: innoHelper.getCollectApp()
                                });
                                fullProfile.setAttribute(attribute);
                            } else {
                                var current = attribute.getValue();
                                attribute.setValue((current + count) / 2);
                            }
                        }
                    });
                } catch (e) {
                    return sendResponse(res, e);
                }

                // Save profile to Data Handler
                innoHelper.saveProfile(fullProfile, function (err) {
                    if (err) {
                        throw err;
                    }
                    return sendResponse(res, err, 'Profile was successfully updated');
                });
            });
        });
    });
});

/**
 * Convert raw stirng to proper ID
 * @param  {String} name [description]
 * @return {String}      [description]
 */
var getAttributeId = function (name) {
    return name.toLowerCase().replace(new RegExp('[^-\\u00BF-\\u1FFF\\u2C00-\\uD7FF\\w\\d\\s]', 'g'), '').trim().replace(new RegExp('\\s+', 'g'), '-');
};

/**
 * Filter result of Alchemy analyze according to the settings of the application: minimal releavance, type and amount of interests
 * @param  {Array}  entities Array returned by Alchemy API
 * @param  {Object} settings Application settings
 * @return {Array}           Filtered array
 */
var getInterests = function (entities, settings) {
    return entities.filter(function (item) {
        return settings.entityType.indexOf(item.type) > -1 && parseFloat(item.relevance) >= settings.minRelevance;
    }).splice(0, settings.amount);
};

var collectCommonData = function (entities, settings, callback) {
    var types = settings.entityType,
        result = settings.commonData || {};

    entities.forEach(function (entity) {
        var count = parseInt(entity.count, 10);
        var type = entity.type;
        if (types.indexOf(type) > -1) {
            result[type] = result.hasOwnProperty(type) ? result[type] + count : count;
        }
    });

    settings.commonData = result;
    innoHelper.setAppSettings(settings, function (err, res) {
        if (typeof callback === 'function') {
            return callback(err, res);
        }
    });
};

// Starting server
var server = app.listen(port, function () {
    console.info('Listening on port %d', server.address().port);
});
