import React, { Component } from 'react';

import './Circle.css';

class Circle extends Component {
  constructor(props) {
    super(props);
    this.state = {color: this.props.color};
  }

  render() {
    if (this.props.color !== 'all') {
      return (
        <div className="Circle-button">
          <div className="wheel" onClick={this.props.onClick} style={{ background: this.props.color }}></div>
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
