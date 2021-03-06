import './index.css';
import 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import nycData from '../ny.json';
import * as topojson from 'topojson';
import * as d3 from 'd3';

var width = 900,
  height = 800,
  viewBox = '0 0 950 800',
  aspectRatio = 'xMidYMid meet',
  center = [-73.97, 40.76];

var svg = d3
  .select('#map')
  .append('svg')
  .attr('viewBox', viewBox)
  .attr('preserveAspectRatio', aspectRatio)
  .call(
    d3.zoom().on('zoom', function() {
      svg.attr('transform', d3.event.transform);
    })
  )
  .append('g');

var projection = d3.geoMercator().center(center);
var b = [
  projection([nycData.bbox[0], nycData.bbox[3]]),
  projection([nycData.bbox[2], nycData.bbox[1]])
];

var s =
  25 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
var path = d3.geoPath().projection(projection);

projection.scale(s);

svg
  .append('path')
  .attr('id', 'boroughs')
  .datum(topojson.feature(nycData, nycData.objects.boroughs))
  .attr('d', path)
  .attr('id', 'collection')
  .datum(topojson.feature(nycData, nycData.objects.collection))
  .attr('d', path);

var data = $.ajax({
  type: 'GET',
  accept: '*/*',
  url: 'https://member.citibikenyc.com/data/stations.json',
  dataType: 'JSON',
  crossDomain: true,
  success: function() {
    parseStationJson(data);
  },
  error: function() {
    alert('Error:');
  }
});

var stationsArray = [];

function parseStationJson(data) {
  $.each(JSON.parse(data.responseText).stations, function() {
    if (this.d != 'JC District') {
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
  });
  plotStations(stationsArray);
}

function plotStations(stationsArray) {
  svg
    .selectAll('circle')
    .data(stationsArray)
    .enter()
    .append('circle')
    .attr('cx', function(d) {
      return projection(d.coordInfo)[0];
    })
    .attr('cy', function(d) {
      return projection(d.coordInfo)[1];
    })
    .attr('id', function(d) {
      return d.id;
    })
    .attr('station', function(d) {
      return d.station;
    })
    .attr('blocked', function(d) {
      return d.bocked;
    })
    .attr('availBikes', function(d) {
      return d.availBikes;
    })
    .attr('availDocks', function(d) {
      return d.availDocks;
    })
    .attr('r', '3px')
    .attr('fill', '#A7FFEB')
    .attr('cursor', 'pointer')
    .on('click', function(d, i) {
      $('#station').html('<h1>' + d.station + '</h1>');
      $('#bikes').html('<h2>' + d.availBikes + '</h2><p>Bikes Available</p>');
      $('#docks').html('<h2>' + d.availDocks + '</h2><p>Docks Available</p>');
    })
    .on('mouseover', function(d, i) {
      d3
        .select(this)
        .transition()
        .duration(500)
        .ease(d3.easeElastic)
        .attr('r', 10);
      d3
        .select('#clipCircle' + i + ' circle')
        .transition()
        .duration(200)
        .ease(d3.easeCubicOut)
        .attr('r', 10);
      d3
        .select('#text' + i)
        .transition()
        .duration(200)
        .ease(d3.easeCubicOut)
        .attr('y', 2)
        .attr('font-size', 32)
        .attr('fill', '#333');
    })
    .on('mouseout', function(d, i) {
      d3
        .select(this)
        .transition()
        .duration(200)
        .ease(d3.easeElasticOut)
        .delay('100')
        .attr('r', 3);
      d3
        .select('#clipCircle' + i + ' circle')
        .transition()
        .duration(200)
        .ease(d3.easeCubicOut)
        .delay('100')
        .attr('r', 0);
      d3
        .select('#text' + i)
        .transition()
        .duration(400)
        .ease(d3.easeCubicOut)
        .delay('100')
        .attr('y', 7)
        .attr('font-size', 20)
        .attr('fill', '#FFF');
    });
}
