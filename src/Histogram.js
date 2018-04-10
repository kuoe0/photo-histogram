import React, { Component } from 'react';
import ReactDOM from 'react-dom';

var d3 = require('d3');

class D3Chart {
  constructor(elem, props, state) {
    this.color = {
      grayscale: {
        stroke: "rgba(221, 221, 221, 1)",
        fill: "rgba(221, 221, 221, .3)"
      },
      red: {
        stroke: "rgba(255, 99, 71, 1)",
        fill: "rgba(255, 99, 71, .3)"
      },
      green: {
        stroke: "rgba(50, 205, 50, 1)",
        fill: "rgba(50, 205, 50, .3)"
      },
      blue: {
        stroke: "rgba(30, 144, 255, 1)",
        fill: "rgba(30, 144, 255, .3)"
      }
    };

    this.svg = d3.select(elem)
                .append('svg')
                .attr('class', 'd3')
                .attr('height', props.height)
                .attr('width', props.width);

    this.update(elem, state);
  }

  update(elem, state) {
    this.clear();
    var scales = this._scales(elem, state.domain)
    this._draw(elem, scales, state);
  }

  clear() {
    this.svg.selectAll('*').remove();
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

  _draw(elem, scales, state) {
    var g = this.svg.append('g');
    var area = d3.area()
                 .x(function(d) { return scales.x(d.x)})
                 .y1(function(d) { return scales.y(d.y)})
    area.y0(scales.y(0));

    g.append("path")
     .datum(state.data)
     .attr("stroke", this.color[state.color].stroke)
     .attr("fill", this.color[state.color].fill)
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
    for (var i = 0; i < this.channel[this.props.channel].length; ++i) {
      data.push({x: i, y: this.channel[this.props.channel][i]});
    }
    return {
      data: data,
      domain: { x: [0, 255], y: [0, Math.max(...this.channel[this.props.channel])]},
      color: this.props.channel
    }
  }

  countRGB() {
    // init array for each channel with 0
    this.channel = {
      "grayscale": Array.apply(null, Array(256)).map(function () { return 0; }),
      "red": Array.apply(null, Array(256)).map(function () { return 0; }),
      "green": Array.apply(null, Array(256)).map(function () { return 0; }),
      "blue": Array.apply(null, Array(256)).map(function () { return 0; })
    }

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
        ++this.channel["red"][pixel[0]];
        ++this.channel["green"][pixel[1]];
        ++this.channel["blue"][pixel[2]];
        ++this.channel["grayscale"][Math.round(pixel.slice(0, 3).reduce((a, b) => a + b, 0) / 3)];
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
