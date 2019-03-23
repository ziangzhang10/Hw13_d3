var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select(".chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial values
xData = "poverty";
yData = "obesity";

// Retrieve data from the CSV file and execute everything below
d3.csv("/assets/data/data.csv")
    .then(function (healthData) {

        healthData.forEach(function (data) {
            data.id = +data.id;
            data.state = data.state;
            data.abbr = data.abbr;
            data.poverty = parseFloat(data.poverty);
            data.age = parseFloat(data.age);
            data.income = parseFloat(data.income);
            data.obesity = parseFloat(data.obesity);
            data.healthcare = parseFloat(data.healthcare);
            data.smokes = parseFloat(data.smokes);
        });

        // xLinearScale function above csv import
        var xLinearScale = xScale(healthData, xData);

        // Create y scale function
        var yLinearScale = yScale(healthData, yData);

        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append x axis
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        // append y axis
        chartGroup.append("g")
            .call(leftAxis);

        // append circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(healthData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[xData]))
            .attr("cy", d => yLinearScale(d[yData]))
            .attr("r", "14")
            .attr("fill", "steelblue")
            .attr("stroke-width", "1")
            .attr("stroke", "black");


            // add text to circles
            var text = chartGroup.selectAll("text")
                .data(healthData)
                .enter()
                .append("text");

            var textLabels = text
                .attr("x", d => xLinearScale(d[xData]))
                .attr("y", d => yLinearScale(d[yData]))
                .text(d => d.abbr)
                .style("text-anchor", "middle")
                .style("alignment-baseline", "central")
                .attr("font-family", "sans-serif")
                .attr("font-size", "12px")
                .attr("fill", "white");
            
    // Create group for  3 x- axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var xAxisLabel1 = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    var xAxisLabel2 = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    var xAxisLabel3 = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");

    // Create group for  3 y- axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(0, ${height / 2}), rotate(-90)`);

    var yAxisLabel1 = yLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", -40)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("inactive", true)
        .text("Lacks Healthcare (%)");

    var yAxisLabel2 = yLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", -60)
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)");

    var yAxisLabel3 = yLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", -80)
        .attr("value", "obesity") // value to grab for event listener
        .classed("active", true)
        .text("Obese (%)");

        // updateToolTip function above csv import
        var circlesGroup = updateToolTip(xData, yData, circlesGroup);

        // x axis labels event listener
        labelsGroup.selectAll("text")
            .on("click", function () {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== xData) {

                    // replaces xData with value
                    xData = value;

                    // console.log(xData)

                    // functions here found above csv import
                    // updates x scale for new data
                    xLinearScale = xScale(healthData, xData);

                    // updates x axis with transition
                    xAxis = renderAxes(xLinearScale, xAxis);

                    // updates circles with new x values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, xData);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(xData, circlesGroup);

                    // changes classes to change bold text
                    if (xData === "num_albums") {
                        albumsLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        hairLengthLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else {
                        albumsLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        hairLengthLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });
    });

// function used for updating x-scale var upon click on axis label
function xScale(healthData, xData) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[xData]) * 0.8,
        d3.max(healthData, d => d[xData]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;

}
function yScale(healthData, yData) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[yData]) * 0.8,
        d3.max(healthData, d => d[yData]) * 1.2
        ])
        .range([height, 0]);

    return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxisnewXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[xData]));

    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(xData, yData, circlesGroup) {

    if (xData === "hair_length") {
        var label = "Hair Length:";
    }
    else {
        var label = "# of Albums:";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.rockband}<br>${label} ${d[xData]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}