TimeSliderView = Backbone.View.extend({
    initialize: function () {
        this.d3el = d3.select(this.el);
        this.timeScale = d3.time.scale();
        this.keyboard = new Keyboard();
        this.login = _.bind(this.login, this);
        this.demo = _.bind(this.demo, this);
        this.handleDelete = _.bind(this.handleDelete, this);
        this.handleMarkerDelete = _.bind(this.handleMarkerDelete, this);
        this.handleAdd = _.bind(this.handleAdd, this);
        this.handleAddMarker = _.bind(this.handleAddMarker, this);
        this.refresh = _.bind(this.refresh, this);

        $(".note-popup .delete").on("click", this.handleDelete);
        $(".marker-popup .delete").on("click", this.handleMarkerDelete);
        $(".new-note-popup .save").on("click", this.handleAdd);
        $(".new-marker-popup .save").on("click", this.handleAddMarker);
        $(".close").on("click", this.closePopup);
        $(".login").on("click", this.login);
        $(".demo").on("click", this.demo);

        this.listenTo(this.model, "change:scope", this.refresh);
        this.listenTo(this.model, "change:events", this.refresh);
        this.listenTo(this.model, "change:markers", this.refresh);
        this.listenTo(this.model, "change:username", this.setUserName);
        GlobalEvent.listenTo("refresh", this.refresh);

        this.createGroupContainers();
        this.registerGlobalListeners();
        this.showIntro();

        var self = this;
        this.d3el.on("click", function() {
            self.hideAllOpenPopups();
        });
    },

    createGroupContainers: function () {
        //Rendering order of the groups is controlled by the position in the DOM
        this.d3el.append("g").classed("mouse-pointer", true);
        this.d3el.append("g").classed("month-ticks", true);
        this.d3el.append("g").classed("day-ticks", true);
        this.d3el.append("g").classed("notes", true);
        this.d3el.append("g").classed("markers", true);
    },

    registerGlobalListeners: function () {
        var that = this;

        this.d3el.on("mousemove", function () {
            var data = [
                {x: d3.event.x, y: d3.event.y}
            ];
            var pointer = that.d3el.select(".mouse-pointer").selectAll(".pointer").data(data);
            pointer.enter().append("rect").classed("pointer", true);
            pointer.exit().remove();
            pointer
                .attr("x", function (d) {
                    var date = moment(that.timeScale.invert(d.x));
                    return NoteVM.x({date: date});
                }).attr("y", 0)
                .attr("width", 1)
                .attr("height", EnvironmentVM.availableHeight());
        })
    },

    showIntro: function () {
        $(".open-banner").show();
        $(".site").hide();
    },

    login: function () {
        $(".open-banner").hide();
        $(".floating-login").hide();
        $(".site").show();
        this.model.connect(true);
        this.enableKeyboardShortcuts();
    },

    demo: function () {
        $(".open-banner").hide();
        $(".floating-login").show();
        $(".site").show();
        this.model.connect(false);
        $("#intro").explain();
        this.keyboard.unbindAll();
    },

    enableKeyboardShortcuts: function () {
        this.keyboard.bindAll();
    },

    slideTimeline: function (days) {
        this.hideAllOpenPopups();
        this.model.adjustDatesInScope(days);
        this.refresh();
    },

    refresh: function () {
        console.log("Refreshing...");
        EnvironmentVM.setBounds(this.$el.width(), this.$el.height());
        EnvironmentVM.setDaysScale(this.model.getDateRangeInScope());
        EnvironmentVM.setNoteTypesScale(this.model.getNoteTypes());
        EnvironmentVM.setZoomLevel(this.model.get("zoomLevel"));
        this.setUserName();
        this.drawTimeline();
        this.drawNotes();
        $(".popup-caret").remove();
        this.drawMarkers();
    },

    setUserName: function () {
        $(".banner .username").html(this.model.get("username"));
    },

    drawTimeline: function () {
        var that = this;
        this.timeScale = d3.time.scale()
            .domain(this.model.getDateRangeInScope()).range([0, this.$el.width() + 10]);

        var currentZoomLevel = this.model.get("zoomLevel");
        var ticksInScope = this.model.getDateTicksInScope();
        var ticks = this.d3el.select(".day-ticks").selectAll(".tick")
            .data(ticksInScope);
        var newTicks = ticks.enter().append("g").classed("tick", true);
        newTicks.append("rect");
        newTicks.append("text");
        ticks.exit().remove();
        ticks.select("rect")
            .attr("x", TimelineVM.Day.x)
            .attr("y", TimelineVM.Day.y)
            .attr("width", TimelineVM.Day.width)
            .attr("height", TimelineVM.Day.height)
            .classed("sunday", function (d) {
                return currentZoomLevel == 1 && moment(d).isoWeekday() == 7
            })
            .classed("today", function (d) {
                return currentZoomLevel == 1 && moment(d).format() == moment().startOf("day").format()
            });
        ticks.select("text")
            .attr("x", TimelineVM.DayText.x)
            .attr("y", TimelineVM.DayText.y)
            .style("font-size", TimelineVM.DayText.fontSize)
            .text(TimelineVM.DayText.text);

        var monthTicks = this.d3el.select(".month-ticks").selectAll(".tick-month")
            .data(this.model.getMonthsInScope());
        var newMonthTicks = monthTicks.enter().append("g").classed("tick-month", true);
        newMonthTicks.append("rect");
        newMonthTicks.append("text");
        monthTicks.exit().remove();
        monthTicks.select("rect")
            .attr("x", TimelineVM.Month.x)
            .attr("y", TimelineVM.Month.y)
            .attr("width", TimelineVM.Month.width)
            .attr("height", TimelineVM.Month.height);
        monthTicks.select("text")
            .attr("x", TimelineVM.MonthText.x)
            .attr("y", TimelineVM.MonthText.y)
            .text(TimelineVM.MonthText.text);
    },

    drawNotes: function (notesModel) {
        var notesModel = notesModel || this.model.getNotesInScope();
        var that = this;
        var notesElement = this.d3el.select(".notes");
        var regions = notesElement.selectAll(".region").data([1]);
        regions.enter().append("rect").classed("region", true);
        regions.attr("x", NotesVM.Region.x)
            .attr("y", NotesVM.Region.y)
            .attr("width", NotesVM.Region.width)
            .attr("height", NotesVM.Region.height)
            .call(d3.behavior.drag()
                .on("dragstart", function () {
                    that.dragStartPosition = d3.event.sourceEvent.x;
                })
                .on("drag", function () {
                    var dragStartDate = moment(that.timeScale.invert(that.dragStartPosition));
                    var dragDate = moment(that.timeScale.invert(d3.event.x));
                    var daysDifference = dragStartDate.diff(dragDate, 'days');
                    daysDifference += dragDate.isAfter(dragStartDate) ? -1 : 1;
                    that.dragStartPosition = d3.event.x;
                    that.slideTimeline(daysDifference);
                })
        );

        var noteTypes = notesElement.selectAll(".note-type").data(notesModel);
        var newNoteTypes = noteTypes.enter().append("g").classed("note-type", true);
        newNoteTypes.append("rect").classed("lane", true);
        newNoteTypes.append("text");
        noteTypes.exit().remove();
        noteTypes.select(".lane")
            .attr("x", NoteLaneVM.lane.x)
            .attr("y", NoteLaneVM.lane.y)
            .attr("width", NoteLaneVM.lane.width)
            .attr("height", NoteLaneVM.lane.height);
        noteTypes.select("text")
            .attr("x", NoteLaneVM.label.x)
            .attr("y", NoteLaneVM.label.y)
            .style("fill", NoteLaneVM.label.color)
            .text(NoteLaneVM.label.text);

        var notes = noteTypes.selectAll(".note").data(function (d) {
            return d[1];
        });
        notes.enter().append("circle").classed("note", true);
        notes.exit().remove();
        notes.attr("cx", NoteVM.x)
            .attr("cy", NoteVM.y)
            .attr("r", NoteVM.r)
            .style("fill", NoteVM.color)
            .on("click", function () {
                d3.event.stopPropagation();
                that.showNotesPopup(that, this)
            });
    },

    moveNoteType: function(noteTypeElement, below) {
        var noteTypeLabel = noteTypeElement.data().label;
        var newY = EnvironmentVM.noteTypeScale(noteTypeLabel);

    },

    findCollidingNoteType: function(currentElement, currentElementPos) {
        var collidingNoteType = _.find($(".note-type"), function(e) {
            var box = e.getBBox();
            return (e != currentElement && currentElementPos >= box.y && currentElementPos <= (box.y + box.height));
        });
        return d3.select(collidingNoteType);
    },

    drawMarkers: function () {
        var that = this;
        var color = d3.scale.category10();
        var markersData = this.model.getMarkersInScope();
        var markerElements = this.d3el.select(".markers").selectAll(".marker").data(markersData);
        var newMarkerElements = markerElements.enter().append("g").classed("marker", true);
        newMarkerElements.append("rect");
        newMarkerElements.append("path");
        newMarkerElements.append("text");
        markerElements.exit().remove();
        markerElements
            .classed("collapsed", true)
            .attr("transform", MarkerVM.transform)
        markerElements.select("rect")
            .attr("x", MarkerVM.x)
            .attr("width", MarkerVM.width)
            .attr("y", MarkerVM.y)
            .attr("height", MarkerVM.height)
            .style("fill", MarkerVM.color);
        markerElements.select("path")
            .attr("transform", MarkerVM.Tag.transform)
            .style("fill", MarkerVM.color)
            .transition()
            .attr("d", MarkerVM.Tag.path);
        markerElements.select("text")
            .attr("x", MarkerVM.Label.x)
            .attr("y", MarkerVM.Label.y)
            .attr("transform", MarkerVM.Tag.transform)
            .text(MarkerVM.Label.initial);
        markerElements.on("click", function (d) {
            that.expandMarker(d, that, this);
        });
    },

    expandMarker: function (d, view, element) {
        var element = d3.select(element);
        element.classed("collapsed", false);
        element.select("text").text(MarkerVM.Label.text(d));
        element.append("text")
            .classed("del", true)
            .attr("x", MarkerVM.Delete.x)
            .attr("y", MarkerVM.Delete.y)
            .attr("transform", MarkerVM.Tag.transform)
            .text(MarkerVM.Delete.text)
            .on("click", function (d) {
                view.model.deleteMarker(d);
            });
        element.select("path")
            .transition()
            .attr("d", MarkerVM.Tag.expandedPath);
    },

    showNotesPopup: function (view, element) {
        var that = this;
        this.hideAllOpenPopups();
        var noteCircle = d3.select(element);
        var note = noteCircle.data();
        var notesPopup = d3.select(document.body).selectAll(".note-popup").data(note);
        notesPopup
            .style("left", NoteVM.Popup.x)
            .style("top", NoteVM.Popup.y)
            .style("width", function (d) {
                return NoteVM.Popup.width(d) + "px"
            })
            .style("height", NoteVM.Popup.height)
            .style("display", "block");
        notesPopup.select(".date").text(function (d) {
            return moment(d.date).format("DD MMM YYYY (dddd)");
        })
        notesPopup.select(".content").text(function (d) {
            return d.content
        });
        notesPopup.select(".delete").style("background-color", NoteVM.color)
        $(".note-popup").data(note[0]); //Used when delete handle is called

        var caret = this.d3el.selectAll(".popup-caret").data(note);
        caret.enter().append("polygon").classed("popup-caret", true);
        caret.attr("points", NoteVM.Popup.Caret.points)
            .attr("transform", NoteVM.Popup.Caret.transform);

    },

    closePopup: function (e) {
        var popup = $(".close").closest(".popup");
        popup.hide();
        $(".popup-caret").remove();
    },

    hideAllOpenPopups: function() {
        $(".popup").hide();
        $(".popup-caret").remove();
    },

    handleDelete: function (e) {
        var notePopup = $(e.target).closest(".note-popup");
        var noteData = notePopup.data();
        this.model.deleteNote(noteData);
        notePopup.hide();
        $(".popup-caret").remove();
        this.drawNotes();
    },

    handleMarkerDelete: function (e) {
        var markerPopup = $(e.target).closest(".marker-popup");
        var markerData = markerPopup.data();
        this.model.deleteMarker(markerData);
        markerPopup.hide();
        this.drawMarkers();
    },

    showNewNotePopup: function () {
        this.hideAllOpenPopups();
        $(".popup-caret").remove();
        $(".new-note-popup").show();
        $(".new-note-popup input.tag").val("");
        $(".new-note-popup input.date").val(moment().format("DD/MM/YYYY"));
        $(".new-note-popup textarea").focus();
        $(".new-note-popup textarea").val("");
        $(".new-note-popup .tag").autocomplete({
            source: this.model.getNoteTypes()
        });
    },

    handleAdd: function (e) {
        var content = $(".new-note-popup .content");
        var tag = $(".new-note-popup .tag");
        var date = $(".new-note-popup .date");
        var dateVal = new moment(date.val(), "DD/MM/YYYY", true);

        var invalidFields = [];
        if (_.isEmpty(content.val())) invalidFields.push(content);
        if (_.isEmpty(tag.val())) invalidFields.push(tag);
        if (!dateVal.isValid()) invalidFields.push(date);

        if (_.isEmpty(invalidFields)) {
            this.model.addNote(content.val(), tag.val(), dateVal);
            $(".new-note-popup").hide();
            this.drawNotes();
        } else {
            $(".new-note-popup *").removeClass("invalid");
            _.each(invalidFields, function (invalidField) {
                invalidField.addClass('invalid')
            });
        }
    },

    zoomIn: function () {
        this.model.zoom(true);
    },

    zoomOut: function () {
        this.model.zoom(false);
    },

    showNewMarkerPopup: function () {
        this.hideAllOpenPopups();
        var newMarkerPopup = $(".new-marker-popup");
        newMarkerPopup.find("input").val("");
        newMarkerPopup.show();
    },

    handleAddMarker: function () {
        $(".new-marker-popup").hide();
        var label = $(".new-marker-popup .label");
        var date = $(".new-marker-popup .date");
        var dateVal = new moment(date.val(), "DD/MM/YYYY", true);
        this.model.addMarker(label.val(), dateVal.toDate());
        this.drawMarkers();
    }

});
