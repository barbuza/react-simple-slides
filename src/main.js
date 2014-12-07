var React = require('react');
var Slides = require('./components/Slides');

window.addEventListener('load', function() {
  React.render(<Slides />, document.getElementById('app'));
});
