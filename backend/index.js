var express = require('express'),          // Using Express library for simple web server functionality
    bodyParser = require('body-parser'),
    inno = require('innometrics-helper'),  // Innometrics helper to work with profile cloud
    request = require('request');

var app = express(),
    port = parseInt(process.env.PORT, 10);

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
    bucketName: process.env.INNO_BUCKET_ID,
    appKey: process.env.INNO_APP_KEY,
    apiUrl: process.env.INNO_API_HOST,
    appName: process.env.INNO_APP_ID,
    groupId: process.env.INNO_COMPANY_ID
};

var innoHelper = new inno.InnoHelper(vars);

// POST request to "/" is always expected to recieve stream with events
app.post('/', function (req, res) {

    var profile = innoHelper.getProfileFromRequest(req.body);
    var session = profile.getLastSession();
    var events  = session.getEvents();
    var event   = events[0];
    var url     = event.getDataValue('url');

    innoHelper.getAppSettings(function (err, settings) {
        
        var alchemyUrl = 'http://access.alchemyapi.com/calls/url/URLGetRankedNamedEntities?apikey=' + settings.api_key + '&url=' + url + '&outputMode=json';
        request.get(alchemyUrl, function (err, res) {

            var result = JSON.parse(res.body);
            var interests = getInterests(result.entities, settings);

            innoHelper.loadProfile(profile.getId(), function (err, fullProfile) {
                interests.forEach(function (item) {
                    var id = getAttributeId(item.text);
                    var count = parseInt(item.count, 10);
                    var attribute = fullProfile.getAttribute(id, innoHelper.getCollectApp(), settings.section);

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
                });
            });
            
        });
    });

    return res.json(url);
});


var getAttributeId = function (name) {
    return name.toLowerCase().replace(new RegExp(' +', 'g'), '-').replace(new RegExp('[^-a-z0-9]', 'g'), '');
};


var getInterests = function (entities, settings) {
    return entities.filter(function (item) {
        return (settings.entityType.indexOf(item.type) > -1) && (parseFloat(item.relevance) >= settings.minRelevance);
    }).splice(0, settings.amount);
};


// Starting server
var server = app.listen(port, function () {
    console.log('Listening on port %d', server.address().port);
});
