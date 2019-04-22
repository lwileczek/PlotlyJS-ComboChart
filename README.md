# PlotlyJS-ComboChart
## Description
A bar/line combination chart created for Qlik Sense using PlotlyJS. Lots of flexibility in use and any properties seen on 
[plotly](https://plot.ly/javascript/reference/) can be added simply using their JSON format. 

Currently accepts two dimensions and two measures.

Properties are applied to the combination chart through its array properties 

![array props](/ex0.png)

Add an array property and indicate which dimension value and which measure number you are trying to apply properties to. 
The dimension values are case sensitive.

As seen in the image above, you do not have to set properties for each dimension and measure, 
only for the specific ones you want to control. By default everything is a line. 

The chart supports subfiltering by clicking insde the legend or will work with filters built into Qlik Sense. 

## Requirements
built for Qlik Sense 3.0+
