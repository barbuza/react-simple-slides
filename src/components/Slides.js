var React = require('react');
var PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
var Reflux = require('reflux');
var debounce = require('debounce');
var Nav = require('./Nav');
var Slide = require('./Slide');
var SlideMetricsStore = require('./SlideMetricsStore');
var scrollTo = require('../utils/scrollTo');

var slides = require('../slides.yml');

var Slides = React.createClass({

  mixins: [PureRenderMixin, Reflux.listenTo(SlideMetricsStore, 'handleMetricsChange')],

  getInitialState() {
    return {
      selectedSlide: null
    };
  },

  slideY(slide) {
    return SlideMetricsStore.metrics.find((x, idx) => idx === slide).top + window.scrollY;
  },

  navigate(selectedSlide) {
    scrollTo(this.slideY(selectedSlide));
  },

  handleMetricsChange(metrics) {
    if (metrics.size === slides.length) {
      var selectedSlide = 0;
      var topItems = metrics.takeWhile(x => x.top <= window.innerHeight / 2.5);
      selectedSlide = topItems.size - 1 || 0;
      if (this.state.selectedSlide !== selectedSlide) {
        this.setState({selectedSlide});
      }
    }
  },

  componentDidMount() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('resize', this.onResize);
  },

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('resize', this.onResize);
  },

  onResize: debounce(function() {
    window.scrollTo(0, this.slideY(this.state.selectedSlide));
  }, 100),

  onKeyDown(e) {
    if (e.keyCode === 40 || e.keyCode === 39 || e.keyCode === 32) {
      if (e.keyCode === 32) {
        e.preventDefault();
      }
      if (this.state.selectedSlide < slides.length - 1) {
        this.navigate(this.state.selectedSlide + 1);
      }
    } else if (e.keyCode === 38 || e.keyCode === 37) {
      if (this.state.selectedSlide > 0) {
        this.navigate(this.state.selectedSlide - 1);
      }
    }
  },

  render() {
    return (
      <div className='Slides'>
        <div className='Slides-slides'>
          {slides.map((props, idx) => <Slide {...props} idx={idx} key={idx} />)}
        </div>
        <Nav selectedSlide={this.state.selectedSlide} onSelect={this.navigate} />
      </div>
    );
  }
});


module.exports = Slides;
