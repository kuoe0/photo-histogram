import React, {Component} from 'react';
import * as d3 from 'd3';

import loadingImg from './resources/loading.gif';

import './Histogram.css';

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
    this.update(elem, state);
  }

  /**
   * Update result
   * @arg {object} elem target element to draw
   * @arg {object} state state
   */
  update(elem, state) {
    let scales = this._scales(elem, state.domain);
    this._draw(elem, scales, state);
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

    let width = elem.width.baseVal.value;
    let height = elem.height.baseVal.value;
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
    let g = d3.select(elem).append('g');
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
    this.maxValue = 0;
    this.root = null;
    this.state = {imageSrc: null,
                  isDrawn: false,
                  isLoading: false,
                  channel: null};
  }

  /**
   * React function
   * @arg {object} nextProps attributes
   * @arg {object} nextState state
   * @return {Boolean}
   */
  shouldComponentUpdate(nextProps, nextState) {
    // If histogram is already drawn, we shouldn't
    // update histogram when the image source and
    // the channel aren't changed.
    const {src, channel} = nextProps;
    if (this.state.isDrawn &&
        src === this.state.imageSrc &&
        channel === this.state.channel) {
      return false;
    }
    return true;
  }

  /**
   * React function
   * @arg {object} prevProps attributes
   * @arg {object} prevState state
   */
  componentDidUpdate(prevProps, prevState) {
    const props = this.props;
    const isImageChanged = this.state.imageSrc !== props.src;
    const isChannelChanged = this.state.channel !== props.channel;

    if (isImageChanged) {
      this.setState({imageSrc: props.src, isLoading: true, isDrawn: false, channel: props.channel});
      // Read RGB data in next event to not block UI rendering.
      setTimeout(() => {
        this.getRGBData();
        this.setState({isLoading: false});
      }, 0);
      return;
    }

    if (isChannelChanged) {
      this.setState({isDrawn: false, channel: props.channel});
      return;
    }

    if (!this.state.isDrawn && this.state.imageSrc && !this.state.isLoading) {
      // drawing in next event to make sure svg element
      // is rendered in a correct size.
      setTimeout(() => {
        let elem = document.querySelector('.d3');
        this.chart = new D3Chart(elem, this.getChartState());
        this.setState({isDrawn: true});
      }, 0);
    }
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

    let dataList = [];
    let channelList = this.state.channel === 'all'
                     ? ['red', 'green', 'blue']
                     : [this.state.channel];

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
   * Render the content inside histogram block.
   * For initial state, render the text placeholder.
   * For loading state, render the loading animation.
   * Otherwise, render svg element as the drawtarget for d3.js.
   * @return {JSX}
   */
  renderContent() {
    // render initial placeholder
    const props = this.props;
    if (props.src === null) {
      return (
        <p id="histogram-placeholder">Histogram</p>
      );
    }

    if (this.state.isLoading) {
      // render loading animation
      return (
        <img id='loading-img' src={loadingImg} />
      );
    }

    // render svg element that is used by d3.js
    return (
      <svg className="d3" style={{height: '100%', width: '100%'}}>
        {this.state.channel}
      </svg >
    );
  }

  /**
   * React function to render
   * @return {JSX}
   */
  render() {
    return (
      <div id="histogram-d3">
        {this.renderContent()}
      </div>
    );
  }
}

export default Histogram;
