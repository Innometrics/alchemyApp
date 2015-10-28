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

            renderChart(interests);
            callback(error, interests);
        });
    }

    /**
     * Render chart by certain data
     * @param {Object} data
     */
    function renderChart (data) {
        var plotData = prepareJQPlotData(data);
        if (!plotData.length) {
            $chart.html('No data for display');
            return;
        }

        var config = getJQPlotConfigByType();

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
    function getJQPlotConfigByType () {
        return {
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
    }

});
