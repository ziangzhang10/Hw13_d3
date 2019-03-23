// @TODO: YOUR CODE HERE!
function makeResponsive() {

    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");

    // clear svg is not empty
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // SVG wrapper dimensions are determined by the current width and
    // height of the browser window.
    var svgWidth = window.innerWidth * 0.5;
    var svgHeight = window.innerHeight * 0.7;

    var margin = {
        top: 50,
        bottom: 150,
        right: 50,
        left: 100
    };

    var height = svgHeight - margin.top - margin.bottom;
    var width = svgWidth - margin.left - margin.right;

    // Append SVG element
    var svg = d3
        .select("#scatter")
        .append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    // Append group element
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Read CSV
    d3.csv("/assets/data/data.csv")
        .then(function (healthData) {

            // parse data
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

            // Initial values
            xData = "poverty";
            yData = "obesity"

            // create scales
            var xLinearScale = d3.scaleLinear()
                .domain(d3.extent(healthData, d => d[xData]))
                .range([0, width]);

            var yLinearScale = d3.scaleLinear()
                .domain(d3.extent(healthData, d => d[yData]))
                .range([height, 0]);

            // create axes
            var bottomAxis = d3.axisBottom(xLinearScale).ticks(8);
            var leftAxis = d3.axisLeft(yLinearScale).ticks(6);

            // append axes
            xAxis = chartGroup.append("g")
                .attr("transform", `translate(0, ${height})`)
                .classed("axis", true)
                .transition()
                .duration(1000)
                .call(bottomAxis);

            yAxis = chartGroup.append("g")
                .classed("axis", true)
                .transition()
                .duration(1000)
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
                .attr("fill", "black");

            // Step 1: Initialize Tooltip
            var toolTip = d3.tip()
                .attr("class", "d3-tip")
                .offset([80, -60]) // offset from [top, left]
                .html(function (d) {
                    return (`<strong>${d.state}:</strong><br>${xData}: ${d[xData]}<br>${yData}: ${d[yData]}`);
                });

            // Step 2: Create the tooltip in chartGroup.
            chartGroup.call(toolTip);

            // Step 3: Create "mouseover" event listener to display tooltip
            circlesGroup.on("mouseover", function (d) {
                toolTip.show(d, this);
            })
                // Step 4: Create "mouseout" event listener to hide tooltip
                .on("mouseout", function (d) {
                    toolTip.hide(d);
                });

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


    // x axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== xData) {

                // replaces chosenXAxis with value
                xData = value;

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(healthData, xData, width);

                // updates x axis with transition
                xAxis = renderXAxis(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                // changes classes to change bold text
                if (xData === "poverty") {
                    xAxisLabel1
                        .classed("active", true)
                        .classed("inactive", false);
                    xAxisLabel2
                        .classed("active", false)
                        .classed("inactive", true);
                    xAxisLabel3
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (xData ==="age") {
                    xAxisLabel1
                        .classed("active", false)
                        .classed("inactive", true);
                    xAxisLabel2
                        .classed("active", true)
                        .classed("inactive", false);
                    xAxisLabel3
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (xData ==="age") {
                    xAxisLabel1
                        .classed("active", false)
                        .classed("inactive", true);
                    xAxisLabel2
                        .classed("active", false)
                        .classed("inactive", true);
                    xAxisLabel3
                        .classed("active", true)
                        .classed("inactive", false);
                }
                else {
                    xAxisLabel1
                        .classed("active", false)
                        .classed("inactive", true);
                    xAxisLabel2
                        .classed("active", false)
                        .classed("inactive", true);
                    xAxisLabel3
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });

        });
}

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);


// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis, width) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
        d3.max(healthData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
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
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}