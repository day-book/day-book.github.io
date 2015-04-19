var MarkerVM = new function () {

    var self = this;

    this.x = function (d) {
        return 0;
    };

    this.y = function (d) {
        return 0;
    };

    this.width = function (d) {
        return 1;
    };

    this.height = function (d) {
        return EnvironmentVM.availableHeight();
    };

    this.color = function (d) {
        return EnvironmentVM.getColor(d.label.length);
    };

    this.transform = function (d) {
        return "translate(" + EnvironmentVM.timeScale(self.startOfDay(d.date)) + ",0)";
    };

    this.Tag = new function () {

        this.path = function () {
            return "M 0,0 16,0 26,10 16,20 0,20 z";
        };

        this.expandedPath = function (d) {
            var width = MarkerVM.Tag.textWidth(d) + 20;
            return "M 0,0 " + width + ",0 " + (width+10) + ",10 " + width + ",20 0,20 z";
        };

        this.transform = function () {
            return "translate(0,50)";
        };

        this.textWidth = function(d) {
            return (d.label.length * 5.5);
        }
    };

    this.Label = new function () {

        this.x = function (d) {
            return 3;
        };

        this.y = function (d) {
            return 14;
        };

        this.initial = function (d) {
            return MarkerVM.Label.text(d)[0];
        };

        this.expand = function(d) {
            return MarkerVM.Label.text(d) + " \u2326"
        };

        this.text = function(d) {
            return d.label;
        }
    };

    this.Delete = new function() {
        this.x = function(d) {
            return MarkerVM.Label.x(d) + MarkerVM.Tag.textWidth(d) + 12;
        };

        this.y = function(d) {
            return MarkerVM.Label.y(d);
        };

        this.text = function() {
            return "\u2716";
        };
    };

    this.startOfDay = function (date) {
        return moment(date).startOf('day').toDate();
    };

}