$(function () {
    var $ = window.$;
    var inno = new IframeHelper();
    var $chart = $('#chart');

    Loader.show();

    /**
     * Main entry point
     */
    inno.onReady(function () {
        getInterestsData(function () {
            Loader.hide();
        });
    });

    /**
     * Get widget settings about which interests to show on chart
     * @param callback
     */
    function getWidgetSettings (callback) {
        inno.getWidgetSettings(function (status, data) {
            var error = null;
            if (!status) {
                error = new Error('Can not get settings');
            }
            callback(error,  data);
        });
    }

    /**
     * Get interests data collected by backend part of application
     * @param callback
     */
    function getInterestsData (callback) {
        inno.getProperties(function (status, data) {
            var error = null,
                interests = null;

            if (!status) {
                error = new Error('Can not get interests data');
            } else {
                data = data || {};
                interests = data.commonData || {};
            }

            getWidgetSettings(function (error, settings) {
                if (error) {
                    console.error(error);
                } else {

                    settings = settings || {};
                    var interest,
                        interestsToShow = settings.showInterests ? settings.showInterests : [];

                    for (interest in interests) {
                        if (interestsToShow.indexOf(interest) === -1) {
                            delete interests[interest];
                        }
                    }

                    renderChart(interests, settings);
                }
                callback(error, interests);
            });
        });
    }

    /**
     * Render chart by certain data
     * @param {Object} data
     */
    function renderChart (data, settings) {
        var plotData = prepareJQPlotData(data);
        if (!plotData.length) {
            $chart.html('No data for display');
            return;
        }

        var config = getJQPlotConfigByType(settings.chartType);

        $.jqplot(
            'chart',
            [plotData],
            config
        );
    }

    /**
     * Prepare data for JQPlot config
     * @param interests
     */
    function prepareJQPlotData (interests) {
        return Object.keys(interests).map(function (name) {
            return [
                name,
                interests[name]
            ];
        }).sort(function (rec1, rec2) {
            // sort by values
            return rec2[1] - rec1[1];
        });
    }


    /**
     * returns config for JQPlot
     * @return {Object} Config
     */
    function getJQPlotConfigByType (type) {
        var config;
        type = type || 'bar';

        switch (type) {

            case 'pie':
                config = {
                    grid: {
                        borderWidth: 0,
                        shadow: false
                    },
                    seriesDefaults: {
                        renderer: $.jqplot.PieRenderer,
                        rendererOptions: {
                            showDataLabels: true,
                            padding: 0,
                            shadowOffset: 0
                        }
                    },
                    legend: {
                        show:true,
                        location: 'e',
                        escapeHtml: true
                    },
                    highlighter: {
                        show: true,
                        formatString:'%s',
                        tooltipLocation:'n',
                        useAxesFormatters:false
                    }
                };
                break;

            case 'bar':
                config = {
                    grid: {
                        borderWidth: 0,
                        shadow: false
                    },
                    axesDefaults: {
                        tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                        tickOptions: {
                            angle: -15,
                            fontSize: '10pt'
                        }
                    },
                    axes: {
                        xaxis: {
                            renderer: $.jqplot.CategoryAxisRenderer
                        }
                    },
                    series: [{
                        renderer: $.jqplot.BarRenderer,
                        rendererOptions: {
                            shadowOffset: 0
                        }
                    }],
                    highlighter: {
                        show: true,
                        sizeAdjust: 7.5,
                        tooltipAxes: 'y'
                    }
                };
                break;

            default:
                throw new Error('Unsupported chart type: ' + type);
        }

        return config;
    }

});
