import React, { Component } from 'react';

import './Circle.css';

class Circle extends Component {
  constructor(props) {
    super(props);
    this.color = {
      grayscale: "rgba(221, 221, 221, 1)",
      red: "rgba(255, 99, 71, 1)",
      green: "rgba(50, 205, 50, 1)",
      blue: "rgba(30, 144, 255, 1)"
    };
    this.state = {color: this.props.color};
  }

  render() {
    if (this.props.channel !== 'all') {
      return (
        <div className="Circle-button">
          <div className="wheel" 
               onClick={this.props.onClick}
               style={{ background: this.color[this.props.channel] }}></div>
        </div>
      );
    }

    // conic-gradient

    return (
      <div className="Circle-button">
        <ul className="umbrella">
          <li className="wheel clipped-color"></li>
          <li className="wheel clipped-color"></li>
          <li className="wheel clipped-color"></li>
          <li className="wheel clipped-color"></li>
          <li className="wheel clipped-color"></li>
          <li className="wheel clipped-color"></li>
        </ul>
      </div>
    )
  }
}

export default Circle;
