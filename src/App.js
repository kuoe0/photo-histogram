import React, {Component} from 'react';
import Circle from './Circle.js';
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
                  width: 0,
                  height: 0};
    this.updateDimensions = this.updateDimensions.bind(this);
  }

  /**
   * Notify the image is loaded
   */
  handelImageLoaded() {
    this.setState({isLoaded: true});
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
        <header className="App-header">
          <h1 className="App-title">Photo Histogram</h1>
        </header>
        <div>
          <div className="Photo-block">
            <img id="photo"
             src={demoImg}
             onLoad={() => this.handelImageLoaded()}
             />
          </div>
          <div className="Histogram-block">
            <div id="histogram-chart">
              <Histogram isLoaded={this.state.isLoaded} channel={this.state.channel} />
            </div>
            <div className="Histogram-channel">
              <ul>
                <li><Circle onClick={() => this.switchChannel('all')} channel="all"></Circle></li>
                <li><Circle onClick={() => this.switchChannel('grayscale')} channel="grayscale"></Circle></li>
                <li><Circle onClick={() => this.switchChannel('red')} channel="red"></Circle></li>
                <li><Circle onClick={() => this.switchChannel('green')} channel="green"></Circle></li>
                <li><Circle onClick={() => this.switchChannel('blue')} channel="blue"></Circle></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
