import React, {Component} from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faImage from '@fortawesome/fontawesome-free-regular/faImage';
import ChannelButton from './ChannelButton.js';
import Histogram from './Histogram.js';
import demoImg from './resources/demo.jpg';

import './App.css';

/**
 * Class of main app
 */
class App extends Component {
  /**
   * Constructor
   * @arg {object} props attributes in element.
   */
  constructor(props) {
    super(props);
    this.state = {isLoaded: false,
                  channel: 'grayscale',
                  imageSrc: demoImg,
                  width: 0,
                  height: 0};
    this.updateDimensions = this.updateDimensions.bind(this);
  }

  /**
   * Load the new image
   */
  loadImage() {
    let file = document.querySelector('#fileInput').files[0];
    console.log('[log] load file: ' + file);

    let reader = new FileReader();
    reader.addEventListener('load', () => {
      // update image
      this.setState({imageSrc: reader.result});
    }, false);

    if (file) {
      reader.readAsDataURL(file);
    }
  }

  /**
   * Switch to the channel that an user chooses.
   * @arg {string} channel the name of channel
   */
  switchChannel(channel) {
    console.log('[log] switch to channel ' + channel);
    this.setState({channel: channel});
  }

  /**
   * Update viewport size
   */
  updateDimensions() {
    this.setState({width: window.innerWidth, height: window.innerHeight});
  }

  /**
   * React function
   */
  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions);
  }

  /**
   * React function
   */
  componentWillMount() {
    this.updateDimensions();
  }

  /**
   * React function
   */
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
  }

  /**
   * React function to render
   * @return {JSX}
   */
  render() {
    return (
      <div className="App">
        <div>
          <div className="Photo-block">
            <img id="photo"
             src={this.state.imageSrc}
             />
          </div>
          <div className="Histogram-block">
            <div id="histogram-chart">
              <Histogram src={this.state.imageSrc} channel={this.state.channel} />
            </div>
            <div className="Histogram-channel">
              <ul>
                <li><ChannelButton onClick={() => this.switchChannel('all')} channel="all"></ChannelButton></li>
                <li><ChannelButton onClick={() => this.switchChannel('grayscale')} channel="grayscale"></ChannelButton></li>
                <li><ChannelButton onClick={() => this.switchChannel('red')} channel="red"></ChannelButton></li>
                <li><ChannelButton onClick={() => this.switchChannel('green')} channel="green"></ChannelButton></li>
                <li><ChannelButton onClick={() => this.switchChannel('blue')} channel="blue"></ChannelButton></li>
              </ul>
            </div>
          </div>
          <div>
            <input id="fileInput" type="file" accept="image/jpeg" style={{display: 'none'}}
                   onChange={() => this.loadImage()} />
            <button id="btn-open-image" onClick={() => document.getElementById('fileInput').click()}>
              <a><FontAwesomeIcon icon={faImage} /></a>
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
