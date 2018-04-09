import React, { Component } from 'react';
import Circle from './Circle.js';
import Histogram from './Histogram.js'
import demoImg from './resources/demo.jpg';

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {isLoaded: false};
  }

  handelImageLoaded() {
    this.setState({isLoaded: true});
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
              <Histogram isLoaded={this.state.isLoaded} />
            </div>
            <div className="Histogram-channel">
              <ul>
                <li><Circle color="all"        id="btn-all"></Circle></li>
                <li><Circle color="#ddd"       id="btn-grayscale"></Circle></li>
                <li><Circle color="tomato"     id="btn-red"></Circle></li>
                <li><Circle color="limegreen"  id="btn-green"></Circle></li>
                <li><Circle color="dodgerblue" id="btn-blue"></Circle></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
