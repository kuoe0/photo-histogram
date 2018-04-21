import React, {Component} from 'react';
import * as d3 from 'd3';

import './D3Chart.css';
/**
 * Class of D3Chart
 */
class D3Chart extends Component {
  /**
   * Constructor
   * @arg {object} props attributes
   */
  constructor(props) {
    super(props);
    this.state = {isInit: false};
  }


  /**
   * React function
   */
  componentDidMount() {
    setTimeout(() => {
      if (!this.svg) {
        console.log('SVG element is not ready.');
        return;
      }
      console.log('SVG element is ready.');
      this.setState({isInit: true});
    }, 0);
  }

  /**
   * React function
   * @arg {Object} nextProps
   * @arg {Object} nextState
   */
  componentWillUpdate(nextProps, nextState) {
    this._updateScale();
    this._generateArea();
  }

  /**
   * Calculat scale object
   */
  _updateScale() {
    const props = this.props;
    const {domain} = props;

    const elem = document.querySelector('.d3');
    let width = elem.width.baseVal.value;
    let height = elem.height.baseVal.value;

    this.scale = {
      x: d3.scaleLinear().range([0, width]).domain(domain.x),
      y: d3.scaleLinear().range([height, 0]).domain(domain.y),
    };
  }

  /**
   * Generate d3-area function
   */
  _generateArea() {
    this.area = d3.area()
                  .x((d) => this.scale.x(d.x))
                  .y1((d) => this.scale.y(d.y))
                  .y0(this.scale.y(0));
  }

  /**
   * Render area
   * @return {JSX}
   */
  renderArea() {
    const props = this.props;
    // Do not render chart when SVG element is not ready or dataset is empty.
    if (!this.state.isInit || !props.dataset) {
      return;
    }


    return (
      <g>
        {
          props.dataset.map((d, i) => {
            return (
              <path id={d.channel + '-channel'}
                    d={this.area(d.data)}
                    key={i} />
            );
          })
        }
      </g>
    );
  }

  /**
   * React render function
   * @return {JSX}
   */
  render() {
    return (
      <svg className="d3"
        ref={(elem) => this.svg = elem}
        style={{height: '100%', width: '100%'}}>
        {this.renderArea()}
      </svg>
    );
  }
}

export default D3Chart;
