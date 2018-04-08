import React, { Component } from 'react';

import './Circle.css';

class Circle extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    var style = {};
    if (this.props.color !== 'all') {
      // conic-gradient
      style.background = "black";
    } else {
      style.background = this.props.color;
    }
    return (
      <div className="Circle-button" style={style}></div>
    );
  }
}

export default Circle;
