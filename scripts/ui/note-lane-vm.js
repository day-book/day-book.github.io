var NoteLaneVM = new function() {

    this.lane = new function() {
        this.x = function(d) {
            return 0;
        };

        this.y = function(d) {
            return EnvironmentVM.noteTypeScale(d[0]);
        };

        this.width = function(d) {
            return EnvironmentVM.availableWidth();
        };

        this.height = function(d) {
            return 1;
        };
    };

    this.label = new function() {
        this.x = function(d) {
            return 10;
        };

        this.y = function(d) {
            return EnvironmentVM.noteTypeScale(d[0]) - 8;
        };

        this.color = function(d) {
            var noteTypeIndex = EnvironmentVM.noteTypes.indexOf(d[0]);
            return EnvironmentVM.getColor(noteTypeIndex);
        };

        this.text = function(d) {
            return d[0].toUpperCase();
        };
    };
};