import React, { Component } from 'react';

import './Circle.css';

class Circle extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    var style = {};
    if (this.props.color !== 'all') {
      return (
        <div className="Circle-button">
          <div className="wheel" style={{ background: this.props.color }}></div>
        </div>
      );
    }

    // conic-gradient

    return (
      <div className="Circle-button">
        <ul class="umbrella">
          <li class="wheel clipped-color"></li>
          <li class="wheel clipped-color"></li>
          <li class="wheel clipped-color"></li>
          <li class="wheel clipped-color"></li>
          <li class="wheel clipped-color"></li>
          <li class="wheel clipped-color"></li>
        </ul>
      </div>
    )
  }
}

export default Circle;
