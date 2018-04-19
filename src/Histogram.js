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
  yellow: {
    stroke: 'rgba(255, 215, 0, 1)',
    fill: 'rgba(255, 215, 0, .3)',
  },
  cyan: {
    stroke: 'rgba(51, 204, 204, 1)',
    fill: 'rgba(51, 204, 204, .3)',
  },
  magenta: {
    stroke: 'rgba(238, 130, 238, 1)',
    fill: 'rgba(238, 130, 238, .3)',
  },
  white: {
    stroke: 'rgba(255, 255, 255, 1)',
    fill: 'rgba(255, 255, 255, .3)',
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
    this.primaryChannels = {};
    this.secondaryChannels = {};
    this.maxValue = 0;
    this.state = {
      imageSrc: null,
      isDrawn: false,
      isLoading: false,
      channel: null,
    };
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
    if (nextState.isDrawn &&
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
    if (isImageChanged) {
      this.handleImageChanged(props.src, props.channel);
      return;
    }

    const isChannelChanged = this.state.channel !== props.channel;
    if (isChannelChanged) {
      this.handleChannelChanged(props.channel);
      return;
    }

    this.drawHistogram();
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
    if (this.state.channel === 'all') {
      // combine all primary channels and all secondary channels
      let allChannels = Object.assign({}, this.primaryChannels, this.secondaryChannels);
      for (let ch in allChannels) {
        if (ch !== 'grayscale' && allChannels.hasOwnProperty(ch)) {
          dataList.push({
            channel: ch,
            data: converToCoord(allChannels[ch]),
          });
        }
      }
    } else {
      // single channel
      dataList = [{
        channel: this.state.channel,
        data: converToCoord(this.primaryChannels[this.state.channel]),
      }];
    }

    return {
      data_list: dataList,
      domain: {x: [0, 255], y: [0, this.maxValue]},
    };
  }

  /**
   * handle function when the image source is changed
   * @arg {string} propSrc source
   * @arg {string} propChannel to show
   */
  handleImageChanged(propSrc, propChannel) {
    this.setState({imageSrc: propSrc,
                   isLoading: true,
                   isDrawn: false,
                   channel: propChannel});
    // Read RGB data in next event to not block UI rendering.
    setTimeout(() => {
      this.getRGBData();
      this.setState({isLoading: false});
    }, 0);
  }


  /**
   * handle function when the channel to show is changed
   * @arg {string} propChannel to show
   */
  handleChannelChanged(propChannel) {
    this.setState({isDrawn: false, channel: propChannel});
  }

  /**
   * handle function when the image source is changed
   * @arg {string} propChannel to show
   */
  drawHistogram() {
    // Skip to draw in the following states:
    // 1. The histogram is already drawn.
    // 2. The image source is null (invalid image source)
    // 3. RGB data isn't ready to draw histogram
    if (this.state.isDrawn ||
        !this.state.imageSrc ||
        this.state.isLoading) {
      return;
    }

    // Drawing in next event to make sure that svg element
    // is rendered in a correct size.
    setTimeout(() => {
      let elem = document.querySelector('.d3');
      this.chart = new D3Chart(elem, this.getChartState());
      this.setState({isDrawn: true});
    }, 0);
  }


  /**
   * get all pixel data of the image
   */
  getRGBData() {
    // init array for each channel with 0
    this.primaryChannels = {
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
        ++this.primaryChannels['red'][pixel[0]];
        ++this.primaryChannels['green'][pixel[1]];
        ++this.primaryChannels['blue'][pixel[2]];
        ++this.primaryChannels['grayscale'][Math.round(pixel.slice(0, 3).reduce((a, b) => a + b, 0) / 3)];
      }
    }

    for (let ch in this.primaryChannels) {
      if (this.primaryChannels.hasOwnProperty(ch)) {
        this.maxValue = Math.max(this.maxValue, Math.max(...this.primaryChannels[ch]));
      }
    }

    // leave a little space above the max value to make UI more comfortable
    this.maxValue = Math.round(this.maxValue * 1.05);

    // calculate data for secondary colors
    this.calculateSecondaryChannels();
  }

  /**
   * calculate data for secondary color (yellow, cyan, magenta and white)
   */
  calculateSecondaryChannels() {
    // helper function to calculate the value for each secondary channel
    let getSecondaryColors = (rgb) => {
      const [r, g, b] = rgb;
      let [y, c, m, w] = new Array(4).fill(Math.min(r, g, b));

      if (r > b && g > b) {
        y = Math.min(r, g);
      }

      if (r > g && b > g) {
        m = Math.min(r, b);
      }

      if (g > r && b > r) {
        c = Math.min(g, b);
      }

      return {yellow: y, cyan: c, magenta: m, white: w};
    };

    this.secondaryChannels = {
      yellow: new Array(256).fill(0),
      cyan: new Array(256).fill(0),
      magenta: new Array(256).fill(0),
      white: new Array(256).fill(0),
    };

    for (let idx = 0; idx < 256; ++idx) {
      let rgb = [
        this.primaryChannels['red'][idx],
        this.primaryChannels['green'][idx],
        this.primaryChannels['blue'][idx],
      ];

      let secondaryColor = getSecondaryColors(rgb);
      for (let ch in secondaryColor) {
        if (secondaryColor.hasOwnProperty(ch)) {
          this.secondaryChannels[ch][idx] = secondaryColor[ch];
        }
      }
    }
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
