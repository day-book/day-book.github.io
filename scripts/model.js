Notes = Backbone.Model.extend({

    initialize: function () {
        this.set('zoomLevel', 1);
        this.totalDaysAtZoomLevel = [92, 190, 370];
        this.scopeStartDate = moment().subtract(45, 'days');
        this.scopeEndDate = this.scopeStartDate.clone().add(90, 'days');

        this.afterCreateNote = _.bind(this.afterCreateNote, this);
        this.afterUpdateNote = _.bind(this.afterUpdateNote, this);
        this.setUserName = _.bind(this.setUserName, this);
        GlobalEvent.listenTo("user-info-fetched", this.setUserName);
    },

    connect: function (live, migrationNeeded) {
        this.migrationNeeded = migrationNeeded;
        if (live) {
            this.storage = new FirebaseStorage(this);
        } else {
            this.storage = new DemoStorage(this);
        }
        this.storage.authenticate();
    },

    setUserName: function (event) {
        this.set("username", event.detail.name);
        if(this.migrationNeeded) {
            migration.start();
        }
    },

    setScopeBasedOnZoomLevel: function () {
        var currentZoomLevel = this.get("zoomLevel");
        var daysToAdd = this.totalDaysAtZoomLevel[currentZoomLevel - 1] / 2;
        var scopeMidDate = this.scopeStartDate.clone().add(this.scopeEndDate.diff(this.scopeStartDate, 'days') / 2, 'days');
        this.scopeStartDate = scopeMidDate.clone().subtract(daysToAdd, 'days');
        this.scopeEndDate = scopeMidDate.clone().add(daysToAdd, 'days');
    },

    getDateRangeInScope: function () {
        return [this.scopeStartDate.toDate(), this.scopeEndDate.toDate()];
    },

    adjustDatesInScope: function (days) {
        this.scopeStartDate.add(days, 'days');
        this.scopeEndDate.add(days, 'days');
    },

    getMarkersInScope: function () {
        return this.get("markers");
    },

    getDateTicksInScope: function () {
        var days = [];
        var monthStartEnds = [];
        var start = this.scopeStartDate.clone().startOf('day');
        var zoomLevel = this.get('zoomLevel');
        while (start.isBefore(this.scopeEndDate)) {
            days.push(start.clone().toDate());
            start.add(1, (zoomLevel == 1 ? 'days' : 'weeks'));
        }
        return days;
    },

    getMonthsInScope: function () {
        var start = this.scopeStartDate.clone().startOf('month');
        var monthStartEnd = [];
        while (start.isBefore(this.scopeEndDate)) {
            monthStartEnd.push([start.clone().toDate(), start.clone().endOf('month').endOf('day').toDate()]);
            start.add(1, 'month');
        }
        return monthStartEnd;
    },

    getNoteTypes: function () {
        return _.sortBy(_.uniq(_.map(this.get('events'), function (note) {
            return note.type
        })), function (type) {
            return type
        });
    },

    getNotesInScope: function () {
        var that = this;
        var events = _.filter(this.get('events'), function (note) {
            var noteDate = moment(note.date);
            return noteDate.isAfter(that.scopeStartDate) && noteDate.isBefore(that.scopeEndDate);
        });
        var groupedEvents = _.groupBy(events, function(e) { return e.type });
        var noteTypes = this.getNoteTypes();
        var arrayedGroupedEvents = [];
        _.each(noteTypes, function(key) {
            arrayedGroupedEvents.push([key, groupedEvents[key] || []]);
        })
        return arrayedGroupedEvents;
    },

    deleteNote: function (note) {
        this.storage.deleteNote(note);
    },

    addNote: function (content, tag, date) {
        var tagLowerCased = tag.toLowerCase().trim();
        var note = {content: content, type: tagLowerCased, date: date.toDate()}
        this.storage.createNote(note);
    },

    afterCreateNote: function (data) {
        this.get('events').push(data);
        GlobalEvent.trigger("refresh");
    },

    afterUpdateNote: function (data) {
        var existingNoteAsMap = _.filter(this.get('events'), function (note) {
            return note.type == data.type && moment(note.date).isSame(data.date, 'day')
        });
        existingNoteAsMap[0].content = data.content;
    },

    afterDeleteNote: function (event) {
        var events = this.get('events');
        _.each(events, function(aNote,i) {
            if (_.isEqual(aNote, event)) {
                delete events[i];
            }
        });
        GlobalEvent.trigger("refresh");
    },

    addMarker: function (label, date) {
        var marker = {label: label, date: date};
        this.storage.createMarker(marker);
    },

    afterAddMarker: function(marker) {
        this.get('markers').push(marker);
        this.trigger('change:markers', marker);
    },

    afterUpdateMarker: function(marker) {
        var existingMarker = _.filter(this.get('markers'), function(marker) {
            return moment(marker.date).isSame(marker.date, 'day')
        });
        existingMarker[0].label = marker.label;
        this.trigger('change:markers', marker);
    },

    deleteMarker: function (marker) {
        this.storage.deleteMarker(marker);
    },

    afterDeleteMarker: function(marker) {
        var markers =  this.get('markers');
        _.each(markers, function(aMarker,i) {
            if (aMarker.id == marker.id) {
                delete markers[i];
            }
        });
        this.set('markers', _.compact(markers));
    },

    zoom: function (zoomIn) {
        var currentZoomLevel = this.get('zoomLevel');
        if (zoomIn && currentZoomLevel > 1) {
            this.set('zoomLevel', currentZoomLevel - 1);
            this.setScopeBasedOnZoomLevel();
            this.trigger("change:scope");
        } else if (!zoomIn && currentZoomLevel < 3) {
            this.set('zoomLevel', currentZoomLevel + 1);
            this.setScopeBasedOnZoomLevel();
            this.trigger("change:scope");
        }
    },

    getUserName: function (callback) {
        return this.storage.getUserName(callback);
    }
});