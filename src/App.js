import React, { Component } from 'react';
import Circle from './Circle.js';
import Histogram from './Histogram.js'
import demoImg from './resources/demo.jpg';

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {isLoaded: false,
                  channel: "grayscale"};
  }

  handelImageLoaded() {
    this.setState({isLoaded: true});
  }

  switchChannel(channel, event) {
    this.setState({channel: channel})
  }

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
                <li><Circle onClick={this.switchChannel.bind(this, "all")} color="all"></Circle></li>
                <li><Circle onClick={this.switchChannel.bind(this, "grayscale")} color="#ddd"></Circle></li>
                <li><Circle onClick={this.switchChannel.bind(this, "red")} color="tomato"></Circle></li>
                <li><Circle onClick={this.switchChannel.bind(this, "green")} color="limegreen"></Circle></li>
                <li><Circle onClick={this.switchChannel.bind(this, "blue")} color="dodgerblue"></Circle></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
