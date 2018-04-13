import React, {Component} from 'react';
import * as d3 from 'd3';

const chartColor = {
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

/**
 * Class of d3.js wrapper
 */
class D3Chart {
  /**
   * Constructor
   * @arg {object} elem target element to draw
   * @arg {object} state state
   */
  constructor(elem, state) {
    this.svg = d3.select(elem)
                .append('svg')
                .attr('class', 'd3')
                .attr('height', '100%')
                .attr('width', '100%');

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
       .attr('stroke', chartColor[channel].stroke)
       .attr('fill', chartColor[channel].fill)
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
    this.maxValue = 0;
  }

  /**
   * React function
   * @arg {object} prevProps attributes
   * @arg {object} prevState state
   */
  componentDidUpdate(prevProps, prevState) {
    setTimeout(() => {
      const props = this.props;
      if (this.state.imageSrc !== props.src) {
        this.getRGBData();
        this.setState({imageSrc: props.src});
      }

      let elem = document.querySelector('#histogram-d3');
      if (!this.chart) {
        this.chart = new D3Chart(elem, this.getChartState());
      } else {
        this.chart.update(elem, this.getChartState());
      }
    }, 0);
  }

  /**
   * get data for chart
   * @return {object} state
   */
  getChartState() {
    // helper function to convert data for D3.js
    let converToCoord = (data) => {
      return data.map((value, idx) => ({x: idx, y: value}));
    };

    const props = this.props;
    let dataList = [];
    let channelList = props.channel === 'all'
                     ? ['red', 'green', 'blue']
                     : [props.channel];

    for (let idx = 0; idx < channelList.length; ++idx) {
      let channel = channelList[idx];
      dataList.push({channel: channel,
                      data: converToCoord(this.channel[channel])});
    }

    return {
      data_list: dataList,
      domain: {x: [0, 255], y: [0, this.maxValue]},
    };
  }

  /**
   * get all pixel data of the image
   */
  getRGBData() {
    // init array for each channel with 0
    this.channel = {
      'grayscale': new Array(256).fill(0),
      'red': new Array(256).fill(0),
      'green': new Array(256).fill(0),
      'blue': new Array(256).fill(0),
    };
    // rest max value
    this.maxValue = 0;

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

    for (let ch in this.channel) {
      if (ch in this.channel) {
      this.maxValue = Math.max(this.maxValue, Math.max(...this.channel[ch]));
      }
    }

    // leave a little space above the max value to make UI more comfortable
    this.maxValue = Math.round(this.maxValue * 1.05);
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
