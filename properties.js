// JavaScript
define( [], function () {
	'use strict';
	
	// Copying properties from: https://plot.ly/javascript/reference/
	
	/* ---------------------------------------------------------------------------
	 * Reusing Some standard properties  
	 * --------------------------------------------------------------------------*/
	
	var appearanceSection = {
	    uses: "settings",
	};
	var measures = {
		uses: "measures",
		min: 1,
		max: 2
	};
	var sorting =  {
		uses: "sorting"
	};
	var dimensions = {
		uses: "dimensions",
		min: 1,
		max: 2
	};
	
	/* ----------------------------------------------------------------------------
	 * Chart Legend & Axis properties.
	 *----------------------------------------------------------------------------*/
	 
	var showLegend = {
		type: "boolean",
		component: "switch",
		label: "Show Legend",
		ref: "props.showLegend",
		defaultValue: true,
		options: [{
			value: true,
			label: "Show"
		}, {
			value: false,
			label: "Hide"
		}]
	};
	
	// START X-AXIS
	var xAxisTitle = {
		type: "string",
		label: "Chart Title",
		ref: "props.xaxis.title",
		defaultValue: "My X-Axis",
	};
	
	var xAxisShow = {
		type: "boolean",
		label: "Show x-axis",
		ref: "props.xaxis.show",
		defaultValue: true
	};
	var xAxisType = {
		type: "string",
		label: "Type (linear, log, date)",
		ref: "props.xaxis.type",
		defaultValue: "-"
	};
	var xAxisMax = { 
		type: "number", 
		label: "X-Axis Max Value",
		ref: "props.xaxis.max",
		defaultValue: 0  
	};
	var xAxisMin = { 
		type: "number", 
		label: "X-Axis Min Value",
		ref: "props.xaxis.min",
		defaultValue: 0  
	};
	var xAxisTickMode = {
		type: "string", 
		label: "Tick Mode: Auto/Linear",
		ref: "props.xaxis.tickMode",
		options: [{
			value:"auto", 
			lable:"Auto"
			}, {
			value: "linear", 
			label: "Linear"
		}],
		defaultValue: "auto"  // no default range so auto generate
	};	
	var xAxisNTicks = {
		type: "integer", 
		label: "Max Tick Marks (if Auto)",
		ref: "props.xaxis.nticks",
		defaultValue: 10
	};	
	
	/* START Y-AXIS  */
	var yAxisTitle = {
		type: "string",
		label: "Chart Title",
		ref: "props.yaxis.title",
		defaultValue: "My Y-Axis",
	};	
	var yAxisShow = {
		type: "boolean",
		label: "Show y-axis",
		ref: "props.yaxis.show",
		defaultValue: true
	};
	var yAxisMax = { 
		type: "number", 
		label: "Y-Axis Max Value",
		ref: "props.yaxis.max",
		defaultValue: 0
	};
	var yAxisMin = { 
		type: "number", 
		label: "Y-Axis Min Value",
		ref: "props.yaxis.min",
		defaultValue: 0  
	};

	// Putting them all together
	var titleAndAxisProps = {
		// not necessary to define the type, component "expandable-items" will automatically
		// default to "items"
		// type: "items"
		component: "expandable-items",
		label: "Legend & Axis Properties",
		items: {
			tab0: {
			    type: "items",
				label: "Legend",
				items: {
					header0_item0: showLegend
				}
			},
			tab1: {
				type: "items",
				label: "X-Axis",
				items: {
					header1_item1: xAxisTitle,
					header1_item2: xAxisShow,
					header1_item3: xAxisType,
					header1_item4: xAxisMax,
					header1_item5: xAxisMin,
					header1_item6: xAxisTickMode,
					header1_item7: xAxisNTicks
				}
			},
			tab2: {
				type: "items",
				label: "Y-Axis",
				items: {
					header2_item1: yAxisTitle,
					header2_item2: yAxisShow,
					header2_item3: yAxisMax,
					header2_item4: yAxisMin,
				}
			}
		}
	};

	/* ----------------------------------------------------------------------------
	 * Line Properties
	 *----------------------------------------------------------------------------*/

	var lineOrBar = {
		type: "boolean",
		component: "switch",
		label: "Line or Bar",
	    //ref: "props.line.lineOrBar",
		ref: "lineOrBar",
		defaultValue: true,
		options: [{
			value: true,
			label: "Line"
		}, {
			value: false,
			label: "Bar"
		}]
	};
	var lineWidth = {
		type: "number",
		label: "Line Width (px)",
		ref: "lineWidth",
		defaultValue: "2",
		min: 0.5, 
		max: 15
	};
	var lineDashed = {
		type: "boolean",
		component: "switch",
		label: "Dashed Line",
		ref: "dashed",
		defaultValue: false,
		options: [{
			value: true,
			label: "Dashed"
		}, {
			value: false,
			label: "Solid"
		}]
	};
	var lineColor = {
		type: "string",
		label: "Line Color",
		ref: "lineColor",
		defaultValue: "'rgb(0, 0, 136)'",
		expression: "optional"
	};
	var markerWidth = {
		type: "number",
		label: "Marker Width (px)",
		ref: "markerWidth",
		defaultValue: 2,
		min: 0, 
		max: 25
	};
	var markerColor = {
		type: "string",
		label: "Marker Color",
		ref: "markerColor",
		defaultValue: "'rgb(0, 0, 136)'",
		expression: "optional"
	};
	var correspondingDimVal = {
		type: "string",
		label: "Corresponding Dimension Value",
		ref: "dimVal",
		defaultValue: ""
	};
	var firstOrSecondMeasure = {
		type: "boolean",
		component: "switch",
		label: "Corresponding Measure",
		ref: "measureVal",
		defaultValue: true,
		options: [{
			value: true,
			label: "First"
		}, {
			value: false,
			label: "Second"
		}],
	};
	
	/* ----------------------------------------------------------------------------
	 * Array Line Properties
	 *----------------------------------------------------------------------------*/
	 var myArrayCounter = 0;
	 var myArrayProps = {
	                label: "Array Properties",
			items: {
			MyText: {
				label:"Add a one Item for each dimension you want to customize the properties for." + 
				"The properties will be added sequentially to how the dimension is being sorted.",
				component: "text"
			},
			MyList: {
			    type: "array",
                            ref: "listItems",
                            label: "List Items",
                            itemTitleRef: "label",
                            allowAdd: true,
                            allowRemove: true,
                            addTranslation: "Add Item",
                            items: {
				MyText: {
					label: "Name this Dimension",
					ref: "label",
					component: "string"
				},
				MyText3: {
					label:"Will be used in the legend",
					component: "text"
				},
				header0_item0: correspondingDimVal,
				MyText1: {
					label:"Will be used to find the proper line/bar to apply properties if there are multiple dimensions",
					component: "text"
				},
				header0_item1: firstOrSecondMeasure,
				MyText0: {
					label:"If only one measure leave switch on first.",
					component: "text"
				},
				header0_item2: lineOrBar,
				header0_item3: lineWidth,
				header0_item4: lineDashed,
				header0_item5: lineColor,
				header0_item6: markerWidth,
				header0_item7: markerColor
			}
		}
	}
};

	return {
		type: "items",
		component: "accordion",
		items: {
			dimensions: dimensions,
			measures: measures,
			sorting: sorting,
			appearance: appearanceSection,
			customSection: titleAndAxisProps,
			//customSection1: lineProps,
			arrayProps: myArrayProps
		}
	};
});
