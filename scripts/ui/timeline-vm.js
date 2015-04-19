var TimelineVM = new function () {

    var minDayWidth = 15;

    this.Day = new function () {
        this.x = function (d) {
            return EnvironmentVM.timeScale(d);
        };

        this.y = function () {
            return TimelineVM.Month.height();
        };

        this.width = function (d) {
            var dayStart = EnvironmentVM.timeScale(d);
            var dayEnd = EnvironmentVM.timeScale(moment(d).endOf("day").toDate());
            var dayWidth = dayEnd - dayStart;
            return (dayWidth >= minDayWidth) ? dayWidth : EnvironmentVM.timeScale(moment(d).add(1,"week").toDate()) - dayStart;
        };

        this.height = function () {
            return 25;
        };

    };

    this.DayText = new function () {
        this.x = function(d) {
            return TimelineVM.Day.x(d) + 1;
        };

        this.y = function() {
            return TimelineVM.Day.y() + TimelineVM.Day.height() - 5;
        };

        this.fontSize = function() {
            return "9px";
        };

        this.text = function(d) {
            return moment(d).format("DD");
        }
    };

    this.Month = new function () {
        this.x = function (d) {
            return EnvironmentVM.timeScale(d[0]);
        };

        this.y = function () {
            return 0;
        };

        this.width = function (d) {
            return EnvironmentVM.timeScale(d[1]) - EnvironmentVM.timeScale(d[0]);
        };

        this.height = function () {
            return 18;
        };
    };

    this.MonthText = new function () {
        this.x = function (d) {
            return EnvironmentVM.timeScale(d[0]);
        };

        this.y = function () {
            return TimelineVM.Month.height() - 5;
        };

        this.text = function (d) {
            return "| " + moment(d[0]).format("MMMM YYYY");
        }
    };
}