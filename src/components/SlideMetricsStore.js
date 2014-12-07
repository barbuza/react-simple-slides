var Immutable = require('immutable');
var Reflux = require('reflux');
var SlideMetricsActions = require('./SlideMetricsActions');


var SlideMetric = Immutable.Record({
  name: null,
  top: null
});


var SlideMetricsStore = Reflux.createStore({

  init() {
    this.metrics = Immutable.OrderedMap();
    this.listenToMany(SlideMetricsActions);
  },

  slideMetricsChanged(name, metrics) {
    var newMetrics = this.metrics.set(name, SlideMetric({
      name: name,
      top: metrics.top
    })).sortBy(x => x.top);

    if (! Immutable.is(newMetrics, this.metrics)) {
      this.metrics = newMetrics;
      this.triggerAsync(newMetrics);
    }
  }

});


module.exports = SlideMetricsStore;
