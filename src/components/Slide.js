var React = require('react');
var PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
var SlideMetricsActions = require('./SlideMetricsActions');


var Slide = React.createClass({

  mixins: [PureRenderMixin],

  componentDidMount() {
    this.propagateMetricsChange();
    window.addEventListener('resize', this.propagateMetricsChange);
    window.addEventListener('scroll', this.propagateMetricsChange);
  },

  componentWillUnmount() {
    window.removeEventListener('scroll', this.propagateMetricsChange);
    window.removeEventListener('resize', this.propagateMetricsChange);
  },

  componentDidUpdate(prevProps, prevState) {
    this.propagateMetricsChange();
  },

  propagateMetricsChange() {
    SlideMetricsActions.slideMetricsChanged(
      this.props.idx, this.getDOMNode().getBoundingClientRect());
  },

  render() {
    var {className, title, text, ...otherProps} = this.props;
    if (className) {
      className = 'Slide ' + className;
    } else {
      className = 'Slide';
    }
    return (
      <div className={className} {...otherProps}>
        <div className='Slide-Content'>
          <h1>{this.props.title}</h1>
          <p>{this.props.text}</p>
        </div>
      </div>
    );
  }
});


module.exports = Slide;
