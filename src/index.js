require('./index.css');
require('jquery');
require('bootstrap');
var topojson = require('topojson');
var d3 = Object.assign({}, require('d3'));

var width = 900,
    height = 800;

var projection = d3.geoMercator()
    .center([-73.97, 40.76]);

var svg = d3.select("#map").append("svg")
    .attr("viewBox", "0 0 950 800")
    .attr("preserveAspectRatio", "xMidYMid meet");

var path = d3.geoPath()
    .projection(projection);

var g = svg.append("g");

d3.json("../ny.json", function(error, ny) {

    var b = [projection([ny.bbox[0], ny.bbox[3]]), projection([ny.bbox[2], ny.bbox[1]])];
    var s = 25 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
    projection.scale(s);

    g.append("path")
        .attr("id", "boroughs")
        .datum(topojson.feature(ny, ny.objects.boroughs))
        .attr("d", path);

    var data = $.ajax({
        type: 'GET',
        accept: '*/*',
        url: 'https://member.citibikenyc.com/data/stations.json',
        dataType: 'JSON',
        crossDomain: true,
        success: function() {
            parseStationJson(data)
        },
        error: function() {
            alert("Error:")
        }
    });

    var stationsArray = [];

    function parseStationJson(data) {
        $.each(JSON.parse(data.responseText), function() {
            $.each(this, function() {
                //filter out JC stations
                if (this.d != "JC District") {
                    var stationObject = {
                        id: this.id,
                        station: this.s,
                        coordInfo: [this.lo, this.la, this.id],
                        blocked: this.b,
                        availBikes: this.ba,
                        availDocks: this.da
                    };
                    stationsArray.push(stationObject);
                }
            })
        })
        plotStations(stationsArray);
    }


    function plotStations(stationsArray) {
        g.selectAll("circle")
            .data(stationsArray).enter()
            .append("circle")
            .attr("cx", function(d) {
                return projection(d.coordInfo)[0];
            })
            .attr("cy", function(d) {
                return projection(d.coordInfo)[1];
            })
            .attr("id", function(d) {
                return d.id;
            })
            .attr("station", function(d) {
                return d.station;
            })
            .attr("blocked", function(d) {
                return d.bocked;
            })
            .attr("availBikes", function(d) {
                return d.availBikes;
            })
            .attr("availDocks", function(d) {
                return d.availDocks;
            })
            .attr("r", "3px")
            .attr("fill", "#e74c3c")
            .attr("cursor", "pointer")

            .on("click", function(d, i) {
                $('#station').html("<h1>" + d.station + "</h1>");
                $('#bikes').html("<h2>" + d.availBikes + "</h2><p>Bikes Available</p>");
                $('#docks').html("<h2>" + d.availDocks + "</h2><p>Docks Available</p>")
                // alert(d.station);
            })

            .on("mouseover", function(d, i) {
                d3.select(this).transition()
                    .ease("elastic")
                    .duration("500")
                    .attr("r", 10);
                d3.select("#clipCircle" + i + " circle").transition()
                    .ease("cubic-out")
                    .duration("200")
                    .attr("r", 10);
                d3.select("#text" + i).transition()
                    .ease("cubic-out")
                    .duration("200")
                    .attr("y", 2)
                    .attr("font-size", 32)
                    .attr("fill", "#333");
            })
            .on("mouseout", function(d, i) {
                d3.select(this).transition()
                    .ease("quad")
                    .delay("100")
                    .duration("200")
                    .attr("r", 3);
                d3.select("#clipCircle" + i + " circle").transition()
                    .ease("quad")
                    .delay("100")
                    .duration("200")
                    .attr("r", 0);
                d3.select("#text" + i).transition()
                    .ease("cubic-out")
                    .duration("400")
                    .delay("100")
                    .attr("y", 7)
                    .attr("font-size", 20)
                    .attr("fill", "#FFF");;
            });
    }

    // zoom and pan
    var zoom = d3.zoom()
        .on("zoom", function() {
            g.attr("transform", "translate(" +
                d3.event.translate.join(",") + ")scale(" + d3.event.scale + ")");
            g.selectAll("path")
                .attr("d", path.projection(projection));
        });

    svg.call(zoom)

});