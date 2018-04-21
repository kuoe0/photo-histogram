import React, {Component} from 'react';
import D3Chart from './D3Chart';

import loadingImg from './resources/loading.gif';

import './Histogram.css';

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
      isLoading: false,
      channel: null,
    };
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
  }

  /**
   * get data for chart
   * @return {object} state
   */
  getDataset() {
    // helper function to convert data for D3.js
    let converToCoord = (data) => {
      return data.map((value, idx) => ({x: idx, y: value}));
    };

    let channelList = [];

    if (this.state.channel !== 'all') {
      channelList = [this.state.channel];
    } else {
      channelList = Object.keys(this.primaryChannels)
                          .concat(Object.keys(this.secondaryChannels))
                          .filter((ch) => ch !== 'grayscale');
    }

    return channelList.map((ch) => {
      return {
        channel: ch,
        data: converToCoord(this.primaryChannels.hasOwnProperty(ch)
                            ? this.primaryChannels[ch]
                            : this.secondaryChannels[ch]),
      };
    });
  }

  /**
   * get domain
   * @return {Object} domain for D3.js
   */
  getDomain() {
      return {x: [0, 255], y: [0, this.maxValue]};
  }

  /**
   * handle function when the image source is changed
   * @arg {string} propSrc source
   * @arg {string} propChannel to show
   */
  handleImageChanged(propSrc, propChannel) {
    this.setState({imageSrc: propSrc,
                   isLoading: true,
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
    this.setState({channel: propChannel});
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
      'yellow': new Array(256).fill(0),
      'cyan': new Array(256).fill(0),
      'magenta': new Array(256).fill(0),
      'white': new Array(256).fill(0),
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
      <D3Chart domain={this.getDomain()} dataset={this.getDataset()}>
      </D3Chart>
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
