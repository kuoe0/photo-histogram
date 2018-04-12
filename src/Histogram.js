import React, {Component} from 'react';
import ReactDOM from 'react-dom';

const d3 = require('d3');

/**
 * Class of d3.js wrapper
 */
class D3Chart {
  /**
   * Constructor
   * @arg {object} elem target element to draw
   * @arg {object} props attributes
   * @arg {object} state state
   */
  constructor(elem, props, state) {
    this.color = {
      grayscale: {
        stroke: 'rgba(221, 221, 221, 1)',
        fill: 'rgba(221, 221, 221, .3)',
      },
      red: {
        stroke: 'rgba(255, 99, 71, 1)',
        fill: 'rgba(255, 99, 71, .3)',
      },
      green: {
        stroke: 'rgba(50, 205, 50, 1)',
        fill: 'rgba(50, 205, 50, .3)',
      },
      blue: {
        stroke: 'rgba(30, 144, 255, 1)',
        fill: 'rgba(30, 144, 255, .3)',
      },
    };

    this.svg = d3.select(elem)
                .append('svg')
                .attr('class', 'd3')
                .attr('height', props.height)
                .attr('width', props.width);

    this.update(elem, state);
  }

  /**
   * Update result
   * @arg {object} elem target element to draw
   * @arg {object} state state
   */
  update(elem, state) {
    this.clear();
    let scales = this._scales(elem, state.domain);
    this._draw(elem, scales, state);
  }

  /**
   * Clear result
   * @arg {object} elem target element to draw
   * @arg {object} state state
   */
  clear() {
    this.svg.selectAll('*').remove();
  }

  /**
   * Setup scale
   * @arg {object} elem target element to draw
   * @arg {object} domain domain
   * @return {object} scale
   */
  _scales(elem, domain) {
    if (!domain) {
      return null;
    }

    let width = elem.offsetWidth;
    let height = elem.offsetHeight;
    let x = d3.scaleLinear().range([0, width]).domain(domain.x);
    let y = d3.scaleLinear().range([height, 0]).domain(domain.y);
    return {x: x, y: y};
  }

  /**
   * Draw chart
   * @arg {object} elem target element to draw
   * @arg {object} scales calculated scale
   * @arg {object} state data
   */
  _draw(elem, scales, state) {
    let g = this.svg.append('g');
    // setup area object
    let area = d3.area()
                 .x((d) => scales.x(d.x))
                 .y1((d) => scales.y(d.y));
    // bottom are always 0
    area.y0(scales.y(0));

    for (let idx = 0; idx < state.data_list.length; ++idx) {
      let channel = state.data_list[idx].channel;
      let data = state.data_list[idx].data;
      g.append('path')
       .datum(data)
       .attr('stroke', this.color[channel].stroke)
       .attr('fill', this.color[channel].fill)
       .attr('d', area);
    }
  }
}

/**
 * Class of Histogram
 */
class Histogram extends Component {
  /**
   * Constructor
   * @arg {object} props attributes
   */
  constructor(props) {
    super(props);
    this.chart = null;
    this.state = {imageSrc: null};
  }

  /**
   * React function
   * @arg {object} prevProps attributes
   * @arg {object} prevState state
   */
  componentDidUpdate(prevProps, prevState) {
    const props = this.props;
    if (this.state.imageSrc != props.src) {
      this.countRGB();
      this.setState({imageSrc: props.src});
    }
    let elem = ReactDOM.findDOMNode(this);
    if (!this.chart) {
      this.chart = new D3Chart(elem,
                               {height: '100%', width: '100%'},
                               this.getChartState());
    } else {
      this.chart.update(elem, this.getChartState());
    }
  }

  /**
   * get data for chart
   * @return {object} state
   */
  getChartState() {
    let converToCoord = (data) => {
      return data.map((value, idx) => ({x: idx, y: value}));
    };

    const props = this.props;
    let maxValue = 0;
    let dataList = [];
    let channelList = props.channel === 'all'
                     ? ['red', 'green', 'blue']
                     : [props.channel];

    for (let idx = 0; idx < channelList.length; ++idx) {
      let channel = channelList[idx];
      dataList.push({channel: channel,
                      data: converToCoord(this.channel[channel])});
      maxValue = Math.max(maxValue, Math.max(...this.channel[channel]));
    }

    return {
      data_list: dataList,
      domain: {x: [0, 255], y: [0, maxValue]},
    };
  }

  /**
   * count all pixel data
   */
  countRGB() {
    // init array for each channel with 0
    this.channel = {
      'grayscale': new Array(256).fill(0),
      'red': new Array(256).fill(0),
      'green': new Array(256).fill(0),
      'blue': new Array(256).fill(0),
    };

    // read image
    let img = document.getElementById('photo');
    let canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

    // read each pixel data
    for (let x = 0; x < canvas.width; ++x) {
      for (let y = 0; y < canvas.height; ++y) {
        const pixel = canvas.getContext('2d').getImageData(x, y, 1, 1).data;
        ++this.channel['red'][pixel[0]];
        ++this.channel['green'][pixel[1]];
        ++this.channel['blue'][pixel[2]];
        ++this.channel['grayscale'][Math.round(pixel.slice(0, 3).reduce((a, b) => a + b, 0) / 3)];
      }
    }
  }

  /**
   * React function to render
   * @return {JSX}
   */
  render() {
    return (
      <div id="histogram-d3" style={{height: '100%', width: '100%'}}></div>
    );
  }
}

export default Histogram;
