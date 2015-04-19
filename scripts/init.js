var svg = $("#container");
var time_slider_model = new Notes();
var time_slider_view = new TimeSliderView({el: svg, model: time_slider_model});

vex.defaultOptions.className = 'vex-theme-top';
