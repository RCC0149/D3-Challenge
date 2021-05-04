// @TODO: YOUR CODE HERE!
// Create Axis Variables
var selectedXAxis = "poverty";
var selectedYAxis = "healthcare";
// Function To Update X-Scale
function xScale(data, selectedXAxis, chartWidth) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[selectedXAxis]) * .85,
        d3.max(data, d => d[selectedXAxis]) * 1.15])
        .range([0, chartWidth]);
    return xLinearScale;
}
// Function To Update X-Axis
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(500)
        .call(bottomAxis);
    return xAxis;
}
// Function To Update Y-Scale
function yScale(data, selectedYAxis, chartHeight) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[selectedYAxis]) * .85,
        d3.max(data, d => d[selectedYAxis]) * 1.15])
        .range([chartHeight, 0]);
    return yLinearScale;
}
// Function To Update Y-Axis
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(500)
        .call(leftAxis);
    return yAxis;
}
// Updating Marker Circles
function renderCircles(circlesGroup, newXScale, newYScale, selectedXAxis, selectedYAxis) {
    circlesGroup.transition()
        .duration(500)
        .attr("cx", d => newXScale(d[selectedXAxis]))
        .attr("cy", d => newYScale(d[selectedYAxis]));
    return circlesGroup;
}

// Marker Text
function renderText(circlesTextGroup, newXScale, newYScale, selectedXAxis, selectedYAxis) {
    circlesTextGroup.transition()
        .duration(500)
        .attr("x", d => newXScale(d[selectedXAxis]))
        .attr("y", d => newYScale(d[selectedYAxis]));
    return circlesTextGroup;
}
// Circle Tooltip
function updateToolTip(selectedXAxis, selectedYAxis, circlesGroup, textGroup) {
    // X Conditionals
    if (selectedXAxis === "poverty") {
        var xlabel = "Poverty: ";
    } else if (selectedXAxis === "income") {
        var xlabel = "Median Income: ";
    } else {
        var xlabel = "Median Age: "
    }
    // Y Conditionals
    if (selectedYAxis === "healthcare") {
        var ylabel = "Lacks Healthcare: ";
    } else if (selectedYAxis === "smokes") {
        var ylabel = "Smokers: "
    } else {
        var ylabel = "Obesity: "
    }
    // Tool Tips
    var toolTip = d3.tip()
        .offset([120, -60])
        .attr("class", "d3-tip")
        .html(function (d) {
            if (selectedXAxis === "age") {
                //  y tips as percentage
                return (`${d.state}<br>${xlabel} ${d[selectedXAxis]}<br>${ylabel}${d[selectedYAxis]}%`)
            } else if (selectedXAxis !== "poverty" && selectedXAxis !== "age") {
                // income in $ x axis
                return (`${d.state}<br>${xlabel}$${d[selectedXAxis]}<br>${ylabel}${d[selectedYAxis]}%`)
            } else {
                //  poverty as % x axis
                return (`${d.state}<br>${xlabel}${d[selectedXAxis]}%<br>${ylabel}${d[selectedYAxis]}%`)
            }
        });
    circlesGroup.call(toolTip)
    // Mouse Over Events
    circlesGroup
        .on("mouseover", function (data) {
            toolTip.show(data, this)
        })
        .on("mouseout", function (data) {
            toolTip.hide(data)
        })
    textGroup
        .on("mouseover", function (data) {
            toolTip.show(data, this)
        })
        .on("mouseout", function (data) {
            toolTip.hide(data)
        })
    return circlesGroup
}
function makeResponsive() {
    // Locate div id
    var svgArea = d3.select("#scatter").select("svg");
    // Clear svg
    if (!svgArea.empty()) {
        svgArea.remove();
    }
    // Set svg Parameters
    var svgHeight = window.innerHeight / 1.5;
    var svgWidth = window.innerWidth / 1.5;
    var margin = {
        top: 50,
        right: 50,
        bottom: 100,
        left: 80
    }
    // Chart Area
    var chartHeight = svgHeight - margin.top - margin.bottom;
    var chartWidth = svgWidth - margin.left - margin.right;
    // Wrapper
    var svg = d3
        .select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);
    // Append svg Group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    d3.csv("assets/data/data.csv").then(function (demoData, err) {
        if (err) throw err;
        // Parse Data
        demoData.forEach(function (data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
            data.age = +data.age;
            data.smokes = +data.smokes;
            data.income = +data.income;
            data.obesity = data.obesity;
        });
        // Create Linear Scales
        var xLinearScale = xScale(demoData, selectedXAxis, chartWidth);
        var yLinearScale = yScale(demoData, selectedYAxis, chartHeight);
        // Starting Axis Functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);
        // Append X-Axis
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);
        // Append Y-Axis
        var yAxis = chartGroup.append("g")
            .call(leftAxis);
        // Circle Data
        var circlesGroup = chartGroup.selectAll("circle")
            .data(demoData);
        // Bind Data
        var elemEnter = circlesGroup.enter();
        // Create Circles
        var circle = elemEnter.append("circle")
            .attr("cx", d => xLinearScale(d[selectedXAxis]))
            .attr("cy", d => yLinearScale(d[selectedYAxis]))
            .attr("r", 15)
            .classed("stateCircle", true);
        // Circle Text
        var circleText = elemEnter.append("text")
            .attr("x", d => xLinearScale(d[selectedXAxis]))
            .attr("y", d => yLinearScale(d[selectedYAxis]))
            .attr("dy", ".35em")
            .text(d => d.abbr)
            .classed("stateText", true);
        // Update Tool Tip
        var circlesGroup = updateToolTip(selectedXAxis, selectedYAxis, circle, circleText);
        // Add Labels
        var xLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);
        var povertyLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty")
            .classed("active", true)
            .text("In Poverty (%)");
        var ageLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age")
            .classed("inactive", true)
            .text("Age (Median)");
        var incomeLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income")
            .classed("inactive", true)
            .text("Household Income (Median)");
        var yLabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)");
        var healthcareLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 40 - margin.left)
            .attr("dy", "1em")
            .attr("value", "healthcare")
            .classed("active", true)
            .text("Lacks Healthcare (%)");
        var smokesLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 20 - margin.left)
            .attr("dy", "1em")
            .attr("value", "smokes")
            .classed("inactive", true)
            .text("Smokes (%)");
        var obeseLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 0 - margin.left)
            .attr("dy", "1em")
            .attr("value", "obesity")
            .classed("inactive", true)
            .text("Obese (%)");
        // X Listener
        xLabelsGroup.selectAll("text")
            .on("click", function () {
                // Get Selected X Label
                selectedXAxis = d3.select(this).attr("value");
                // Update X-Scale
                xLinearScale = xScale(demoData, selectedXAxis, chartWidth);
                // Render X-Axis
                xAxis = renderXAxes(xLinearScale, xAxis)
                // X Selection Conditionals
                if (selectedXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (selectedXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
                circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, selectedXAxis, selectedYAxis)
                circlesGroup = updateToolTip(selectedXAxis, selectedYAxis, circle, circleText)
                circleText = renderText(circleText, xLinearScale, yLinearScale, selectedXAxis, selectedYAxis)
            })
        // Y Listener
        yLabelsGroup.selectAll("text")
            .on("click", function () {
                // Get Selected Y Label
                selectedYAxis = d3.select(this).attr("value");
                // Update Y-Scale
                yLinearScale = yScale(demoData, selectedYAxis, chartHeight);
                // Render Y-Axis
                yAxis = renderYAxes(yLinearScale, yAxis);
                // Y Selection Conditionals
                if (selectedYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (selectedYAxis === "smokes") {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
                circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, selectedXAxis, selectedYAxis);
                circleText = renderText(circleText, xLinearScale, yLinearScale, selectedXAxis, selectedYAxis);
                circlesGroup = updateToolTip(selectedXAxis, selectedYAxis, circle, circleText);
            });

    }).catch(function (err) {
        console.log(err);
    });
}
makeResponsive();
d3.select(window).on("resize", makeResponsive);
