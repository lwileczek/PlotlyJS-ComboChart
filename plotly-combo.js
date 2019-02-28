define([
        "qlik",
        '//cdn.plot.ly/plotly-latest.min.js',
        './properties'
    ],
    function(qlik, Plotly, props) {
        'use strict';

        function onlyUnique(value, index, self) {
            // only return unique values, used in a .filter function of an array
            return self.indexOf(value) === index;
        }

        function createTrace(dataMatrix, traceName = '', measureColumn = 1, lineColor = '', 
		lineOrBar=true, lineWidth=2, dashedLine=false, markerWidth=2, markerColor='') {
			if (+dataMatrix[0][0].qText + 1) {
                var xVals = dataMatrix.map(function(row) {
                    return row[0].qNum;
                });
            } else {
                var xVals = dataMatrix.map(function(row) {
                    return row[0].qText;
                });
            }
            var yVals = dataMatrix.map(function(row) {
                return row[measureColumn].qNum;
            });
            if (lineOrBar) {
                var chartType = 'scatter';
            } else {
                var chartType = 'bar'; 
            }
            if (dashedLine) {
                var myDash = 'dot';
            } else {
                var myDash = 'solid';
            }
            var trace = {
                type: chartType,
                mode: 'lines+markers',
                name: traceName,
                x: xVals,
                y: yVals,
                line: {
                    dash: myDash,
                    width: lineWidth,
                    color: lineColor
                },
                marker: {
                    color: markerColor,
                    size: markerWidth
                }
            };
            return trace
        }
        return {
            initialProperties: {
                qHyperCubeDef: {
                    qDimensions: [],
                    qMeasures: [],
                    qInitialDataFetch: [{
                        qWidth: 3, // 2 dimensions and 1 measure
                        qHeight: 3333 // 3333 * 3 = 9999. You may only pull 10,000 with initial fetch
                    }],
                    listItems: []
                }
            },
            definition: props,

            paint: function($element, layout) {
                let inputMatrix = layout.qHyperCube.qDataPages[0].qMatrix;
                let myProps = layout.props;
                let chartID = 'canvas' + Math.floor(Math.random() * Math.floor(10000));
                var canvasDiv = '<div id="' + chartID + '"></div>';
				let customProperties = {};
                $element.empty();
                $element.append(canvasDiv); // need to append it before DOM can find it.
                var canvas = document.getElementById(chartID);
                let data = [];
				let customDimension = [];
				let currentTrace;
                if (layout.listItems.length > 0) {
                    // If true then custom properties have been set
					customDimension = layout.listItems.map(function(x){return x['label'];});
                    layout.listItems.forEach(function(propSet){
						let filteredData = inputMatrix.filter(function(row) {
									return row[1].qText == propSet['label'];
								})
						if(filteredData.length > 0){
							currentTrace = createTrace(
									filteredData,  // data matrix
									propSet['label'],     // trace name
									layout.qHyperCube.qDimensionInfo.length,  // column of data matrix to use
									propSet['lineColor'],  
									propSet['lineOrBar'],
									propSet['lineWidth'],
									propSet['dashed'],
									propSet['markerWidth'],
									propSet['markerColor']
								);
							data.push(currentTrace)
						}
					});
                }
                if (layout.qHyperCube.qDimensionInfo.length === 2) {
                    /*
                     * Assuming the first dimension will go along the x-axis, the second dimension (index 1),
                     * will serve will be how we split the data up and re-compute values for.  
                     */
					
                    let dim2Vals = inputMatrix.map(function(row) {
                        return row[1].qText;
                    }).filter(onlyUnique);
					
                    dim2Vals.forEach(function(dimValue) {
                        let filteredData = inputMatrix.filter(function(row) {
                            return row[1].qText == dimValue;
                        });
						if (customDimension.includes(dimValue)) {
							// Pass
						} else {
                            currentTrace = createTrace(filteredData, dimValue, 2);
							data.push(currentTrace);
						}
                    });
                } else {
					//console.log(layout.listItems);
					if(layout.listItems.length > 0){
						console.log(1);
						var myTrace = createTrace(
									inputMatrix,  // data matrix
									layout.listItems[0]['label'],     // trace name
									1,  // column of data matrix to use
									layout.listItems[0]['lineColor'],  
									layout.listItems[0]['lineOrBar'],
									layout.listItems[0]['lineWidth'],
									layout.listItems[0]['dashed'],
									layout.listItems[0]['markerWidth'],
									layout.listItems[0]['markerColor']
								);
					} else {
						console.log("2");
						var myTrace = createTrace(inputMatrix, '', 1);
					}
				    data.push( myTrace );
				}
                var xRange = [];
                var yRange = [];
                var marginLeft = 80;
                var marginBottom = 80;
                if (myProps.xaxis.min != myProps.xaxis.max) {
                    if (myProps.xaxis.min < myProps.xaxis.max) {
                        xRange = [myProps.xaxis.min, myProps.xaxis.max];
                    } else {
                        xRange = [myProps.xaxis.min, Math.max(...inputMatrix.map(row => row[0].qNum)) + 1];
                    }
                }
                if (myProps.yaxis.min < myProps.yaxis.max) {
                    yRange = [myProps.yaxis.min, myProps.yaxis.max];
                }
                if (!myProps.xaxis.show || (myProps.xaxis.title.length == 0)) {
                    marginBottom = 35;
                }
                if (!myProps.yaxis.show || (myProps.yaxis.title.length == 0)) {
                    marginLeft = 35;
                }
                var layout = {
                    xaxis: {
                        visible: myProps.xaxis.show,
                        title: myProps.xaxis.title,
                        type: myProps.xaxis.type,
                        range: xRange,
                        tickmode: myProps.xaxis.tickMode,
                        nticks: myProps.xaxis.nticks
                    },
                    yaxis: {
                        title: myProps.yaxis.title,
                        visible: myProps.yaxis.show,
                        range: yRange
                    },
                    width: $element.width(),
                    height: $element.height(),
                    margin: {
                        l: marginLeft,
                        r: 40,
                        t: 10,
                        b: marginBottom,
                    },
                    showlegend: myProps.showLegend
                };

                var options = {
                    displayModeBar: false
                };
                Plotly.newPlot(canvas, data, layout, options);

                return qlik.Promise.resolve();
            }
        };

 });
