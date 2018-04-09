import React, { Component } from 'react';
import ReactDOM from 'react-dom';

var d3 = require('d3');

class D3Chart {
  constructor(elem, props, state) {
    var svg = d3.select(elem)
                .append('svg')
                .attr('class', 'd3')
                .attr('height', props.height)
                .attr('width', props.width);

    svg.append("g");
    this.update(elem, state);
  }

  update(elem, state) {
    var scales = this._scales(elem, state.domain)
    this._draw(elem, scales, state.data);
  }

  _scales(elem, domain) {
    if (!domain) {
      return null;
    }

    var width = elem.offsetWidth;
    var height = elem.offsetHeight;

    var x = d3.scaleLinear()
      .range([0, width])
      .domain(domain.x);

    var y = d3.scaleLinear()
      .range([height, 0])
      .domain(domain.y);

    return {x: x, y: y};
  }

  _draw(elem, scales, data) {
    var g = d3.select(elem).select('g')
    var area = d3.area()
                 .x(function(d) { return scales.x(d.x)})
                 .y1(function(d) { return scales.y(d.y)})
    area.y0(scales.y(0));

    g.append("path")
     .datum(data)
     .attr("fill", "#ddd")
     .attr("d", area)
  }
}

class Histogram extends Component {
  constructor(props) {
    super(props);
    this.chart = null;
  }

  componentDidUpdate(prevProps, prevState) {
    this.countRGB();
    var elem = ReactDOM.findDOMNode(this);
    if (!this.chart) {
      this.chart = new D3Chart(elem, 
                               { height: "100%", width: "100%" }, 
                               this.getChartState());
    } else {
      this.chart.update(elem, this.getChartState());
    }
  }

  getChartState() {
    var data = [];
    for (var i = 0; i < this.channel_red.length; ++i) {
      data.push({x: i, y: this.channel_gray[i]});
    }
    return {
      data: data,
      domain: { x: [0, 255], y: [0, Math.max(...this.channel_gray)]}
    }
  }

  countRGB() {
    // init array for each channel with 0
    this.channel_red   = Array.apply(null, Array(256)).map(function () { return 0; })
    this.channel_green = Array.apply(null, Array(256)).map(function () { return 0; })
    this.channel_blue  = Array.apply(null, Array(256)).map(function () { return 0; })
    this.channel_gray  = Array.apply(null, Array(256)).map(function () { return 0; })

    // read image
    var img = document.getElementById('photo');
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
    this.total_pixel = img.width * img.height;

    // read each pixel data
    for (var x = 0; x < canvas.width; ++x) {
      for (var y = 0; y < canvas.height; ++y) {
        var pixel = canvas.getContext('2d').getImageData(x, y, 1, 1).data;
        ++this.channel_red[pixel[0]];
        ++this.channel_green[pixel[1]];
        ++this.channel_blue[pixel[2]];
        ++this.channel_gray[Math.round(pixel.slice(0, 3).reduce((a, b) => a + b, 0) / 3)];
      }
    }
  }

  render() {
    return (
      <div id="histogram-d3" style={{height: "100%", width: "100%"}}></div>
    );
  }
}

export default Histogram;
