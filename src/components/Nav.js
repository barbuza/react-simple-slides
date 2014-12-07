var React = require('react');
var PureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');

var slides = require('../slides.yml');


var Nav = React.createClass({

  mixins: [PureRenderMixin],

  onSelect(idx) {
    this.props.onSelect(idx);
  },

  render() {
    var links = slides.map(function({bookmark}, idx) {
      var className = 'Nav-link';
      if (this.props.selectedSlide === idx) {
        className += ' active';
      }
      return <div className={className} onClick={this.onSelect.bind(this, idx)} key={idx}>{bookmark}</div>;
    }, this);

    var placeholders = slides.map(function({bookmark}, idx) {
      var className = 'Nav-link Nav-placeholder';
      return <div className={className} key={idx}>{bookmark}</div>;
    }, this);

    return (
      <div className='Nav'>
        <div className='Nav-fixed'>
          {links}
        </div>
        {placeholders}
      </div>
    );
  }
});


module.exports = Nav;
