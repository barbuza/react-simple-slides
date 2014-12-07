var BezierEasing = require('bezier-easing');
var FPS = 60;
var scrolling = false;
var easing = BezierEasing(0.86, 0, 0.07, 1);

var step = function(initial, target, start, duration, callback) {
  return function() {
    if (scrolling !== callback) {
      return;
    }
    var now = new Date().getTime();
    if (now >= start + duration) {
      window.scrollTo(0, target);
      scrolling = undefined;
      callback();
    } else {
      var position = (now - start) / duration;
      var delta = Math.round((target - initial) * easing(position));
      window.scrollTo(0, initial + delta);
      window.requestAnimationFrame(step(initial, target, start, duration, callback));
    }
  };
};

module.exports = function(target, callback) {
  if (typeof callback === 'undefined') {
    callback = function() {};
  }
  scrolling = callback;
  var initial = window.scrollY;
  var duration = Math.max(400, Math.min(800, Math.round(Math.abs(initial - target) / 3)));
  var start = new Date().getTime();
  window.requestAnimationFrame(step(initial, target, start, duration, callback));
};
