import React, {Component} from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faImage from '@fortawesome/fontawesome-free-regular/faImage';
import ChannelButton from './ChannelButton.js';
import Histogram from './Histogram.js';

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
                  channel: 'all',
                  imageSrc: null,
                  width: 0,
                  height: 0};
    this.updateDimensions = this.updateDimensions.bind(this);
    this.photo = document.createElement('img');
    this.photo.setAttribute('id', 'photo');
  }

  /**
   * file drop handler
   * @arg {Event} evt event
   */
  handleImageDrop(evt) {
    evt.preventDefault();
    // remove dim filter of the dropzone
    evt.target.style.filter = '';
    const file = evt.dataTransfer.files[0];
    this.loadImage(file);
  }

  /**
   * file drop over handler
   * @arg {Event} evt event
   */
  handleImageDropOver(evt) {
    evt.preventDefault();
    // dim the dropzone
    evt.target.style.filter = 'brightness(50%)';
  }

  /**
   * image selection handler
   * @arg {Event} evt event
   */
  handleImageSelected(evt) {
    let file = document.querySelector('#fileInput').files[0];
    this.loadImage(file);
  }

  /**
   * Load the new image
   * @arg {Object} file the image file to load
   */
  loadImage(file) {
    this.setState({isLoaded: true});

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
   * render image placeholder
   * @return {JSX}
   */
  renderPlaceholder() {
    return (
      <div id="photo-placeholder">
        <p>Drop an image here</p>
      </div>
    );
  }

  /**
   * render image
   * @return {JSX}
   */
  renderPhoto() {
    return (
      <img id="photo" src={this.state.imageSrc} />
    );
  }

  /**
   * React function to render
   * @return {JSX}
   */
  render() {
    return (
      <div className="App">
        <div>
          <div id="photo-block"
               style={this.state.isLoaded ? {border: 'none'} : {border: '#999 solid 1px'}}
               onDrop={this.handleImageDrop.bind(this)}
               onDragOver={this.handleImageDropOver.bind(this)}>
            {this.state.isLoaded ? this.renderPhoto() : this.renderPlaceholder()}
          </div>
          <div id="histogram-chart">
            <Histogram src={this.state.imageSrc} channel={this.state.channel} />
          </div>
          <div className="histogram-channel">
            <ul>
              <li><ChannelButton onClick={() => this.switchChannel('all')} channel="all"></ChannelButton></li>
              <li><ChannelButton onClick={() => this.switchChannel('grayscale')} channel="grayscale"></ChannelButton></li>
              <li><ChannelButton onClick={() => this.switchChannel('red')} channel="red"></ChannelButton></li>
              <li><ChannelButton onClick={() => this.switchChannel('green')} channel="green"></ChannelButton></li>
              <li><ChannelButton onClick={() => this.switchChannel('blue')} channel="blue"></ChannelButton></li>
            </ul>
          </div>
          <div>
            <input id="fileInput" type="file" accept="image/jpeg" style={{display: 'none'}}
                   onChange={this.handleImageSelected.bind(this)} />
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
