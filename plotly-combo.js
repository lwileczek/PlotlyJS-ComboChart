define([
        "qlik",
		'./plotly-latest.min',
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
			if (isNaN(dataMatrix[0][0].qText)) {  // check if x-axis is numeric
                var xVals = dataMatrix.map(function(row) {
                    return row[0].qText;
                });
            } else {
                var xVals = dataMatrix.map(function(row) {
                    return row[0].qNum;
                });
            }
            var yVals = dataMatrix.map(function(row) {
                return row[measureColumn].qNum;
            });
			var chartType = lineOrBar ? 'scatter' : 'bar';
			var myDash = dashedLine ? 'dot' : 'solid';
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
                        qWidth: 4,     // 2 dimensions and 2 measure
                        qHeight: 2500  // 2500 * 4 = 10,000. You may only pull 10,000 with initial fetch
                    }],
                    listItems: []
                }
            },
            definition: props,
            paint: function($element, layout) {
                var inputMatrix = layout.qHyperCube.qDataPages[0].qMatrix;
                var myProps = layout.props;
                var chartID = 'canvas' + layout.qInfo.qId;  // id so you can have multiple on a page
                var canvasDiv = '<div id="' + chartID + '"></div>';
                $element.empty();  // remove old chart
                $element.append(canvasDiv); // need to append it before DOM can find it.
                var canvas = document.getElementById(chartID);
                var data = [];
				var customDimension = [ ];
				for (let i=0; i < layout.qHyperCube.qMeasureInfo.length; i++){
					customDimension.push([ ]);
				}
				var currentTrace;
				// If there are two dimension group[filter] on the second dimension, else just use the first
				var dimGroup = layout.qHyperCube.qDimensionInfo.length - 1; 
				var firstMeasureColumn = layout.qHyperCube.qDimensionInfo.length;
				// If the user has created custom properties
				if (layout.listItems.length) {
					/*
					 * %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
					 * TODO:
					 * Turn into for loop to accept arbitrary number of measures
					 */
					customDimension[0] = layout.listItems.map(function(x){
					    if (x['measureVal']) {
							return x['dimVal'];  // name to look for.
						}
					});
					customDimension[1] = layout.listItems.map(function(x){
					    if (!x['measureVal']) {
							return x['dimVal'];  // name to look for.
						}
					});					
					layout.listItems.forEach(function(propSet) {
						// filtered data are the rows that correspond to the current trace.
						let filteredData = dimGroup ? inputMatrix.filter(function(row) {
							return row[1].qText == propSet['dimVal'];  
						}) : inputMatrix;	
						if(filteredData.length == 0) {
							return;
						}		
						currentTrace = createTrace(
							filteredData,
							propSet['label'],
							firstMeasureColumn + !propSet["measureVal"],  // column of data matrix to use
							propSet['lineColor'],
							propSet['lineOrBar'],
							propSet['lineWidth'],
							propSet['dashed'],
							propSet['markerWidth'],
							propSet['markerColor']
						);
						data.push(currentTrace)
					});
				}
				var meaVal = 0;
				// run this for the number of measures input
				do {
					// Check if there are two dimensions or 1
					if (dimGroup) {  
						// grab the unique values from out "group" column (second dimension)
						let dim2Vals = inputMatrix.map(function(row) {
							return row[1].qText;  // groups will always come second to x-axis values: e.g. dim0[x-axis], dim1[groups], measure
						}).filter(onlyUnique);
						// for each group check if there are values (should be) and filter the data then compute the trace.
						dim2Vals.forEach(function(dimValue) {
							if (customDimension[meaVal].includes(dimValue)) {  
								// Pass, the group exists, and was already handled 
							} else {
								let filteredData = inputMatrix.filter(function(row) {
									return row[1].qText == dimValue; // if two dimensions then columns are dim0, dim1, meas0 so row[1] is dim2 value
								});
								currentTrace = createTrace(
									filteredData, 
									dimValue+' '+layout.qHyperCube.qMeasureInfo[meaVal].qFallbackTitle, 
									2 + meaVal
								);
								data.push(currentTrace);
							}
						});
					} else if (layout.listItems.length == 0) {  // so there is only 1 dimension
						var myTrace = createTrace(inputMatrix, '', 1 + meaVal);  // no custom properties and one dimension so run the data with a single dim.
						data.push( myTrace );
					}
					meaVal++  // increment val
				} while (meaVal < layout.qHyperCube.qMeasureInfo.length);
				
				// once the traces have been created, now make the settings
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
