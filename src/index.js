import './index.css';
import 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import nycData from '../ny.json';
import * as topojson from 'topojson';
import * as d3 from 'd3';
import L from 'leaflet';

const map = L.map('map').setView([40.7363, -73.9867], 13);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const svgLayer = L.svg().addTo(map);
const svg = d3.select('svg');
const g = svg.append('g');

d3.json('https://member.citibikenyc.com/data/stations.json', function(
  response
) {
  response.stations.forEach(function(s) {
    s.LatLng = new L.LatLng(s.la, s.lo);
  });

  /**
   * Scales the SVG layer of plotted points
   */
  const update = () => {
    station.attr('transform', function(d) {
      return (
        'translate(' +
        map.latLngToLayerPoint(d.LatLng).x +
        ',' +
        map.latLngToLayerPoint(d.LatLng).y +
        ')'
      );
    });
  };

  /**
   * Creates the individual stations and provides the logic for interacting with them on the map.
   */
  const station = g
    .selectAll('circle')
    .data(response.stations)
    .enter()
    .append('circle')
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
    });

  map.on('moveend', update); // Fired when the user zooms on the map
  update();
});
