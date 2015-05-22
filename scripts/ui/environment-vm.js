var EnvironmentVM = new function() {
    var self = this;
    var zoomLevel = 1;
    var colorRange = ["#2ca02c", "#ff7f0e", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf", "#1f77b4", "#8cc63f", "#f36f21", "#8b0304", "#aa5ea6", "#5f1e08"];
    var notesTopOffset = 110;
    var notesBottomOffset = 100;

    this.timeScale = d3.time.scale();
    var noteTypeScale = d3.scale.linear();

    this.getZoomLevel = function() {
        return zoomLevel;
    };

    this.setZoomLevel = function(zoom) {
        zoomLevel = zoom;
    };

    this.getColor = function(index) {
        return colorRange[index % colorRange.length];
    };

    this.setDaysScale = function(daysRange) {
        this.timeScale.domain(daysRange);
    };

    this.setNoteTypesScale = function(noteTypes) {
        this.noteTypes = noteTypes;
        noteTypeScale.domain([0, noteTypes.length-1]);
    };

    this.setBounds = function(width, height) {
        this.width = width;
        this.height = height;
        this.timeScale.range([0, width]);
        noteTypeScale.range([notesTopOffset, this.availableHeight()]);
    };

    this.noteTypeScale = function(noteType) {
        return noteTypeScale(this.noteTypes.indexOf(noteType));
    };

    this.getNoteTypeScaleGap = function() {
        return noteTypeScale(1) - noteTypeScale(0);
    };

    this.availableHeight = function() {
        return self.height-notesBottomOffset;
    };

    this.availableWidth = function() {
        return self.width;
    }

}