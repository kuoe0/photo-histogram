import React, { Component } from 'react';
import demoImg from './resources/demo.jpg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Photo Histogram</h1>
        </header>
        <div>
          <div className="Photo-block">
            <img className="Photo" src={demoImg} />
          </div>
          <div className="Histogram-block">
            <div className="Histogram">
            </div>
            <div className="Histogram-channel">
              <ul>
                <li><a href="#">all</a></li>
                <li><a href="#">grayscale</a></li>
                <li><a href="#">red</a></li>
                <li><a href="#">green</a></li>
                <li><a href="#">blue</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
