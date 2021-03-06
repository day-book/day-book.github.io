function DemoStorage(model) {
    var selfie = this;
    this.notesData = [
        {id: 11111, content: "Bought book to learn about cartooning", type: "learn to draw", date: moment().subtract(7,"days").startOf("day").toDate()},
        {id: 11111, content: "Taking baby steps. Trying to get the face right", type: "learn to draw", date: moment().subtract(5,"days").startOf("day").toDate()},
        {id: 11112, content: "Able to draw cartoon faces nicely. Needs improvement in drawing different expressions", type: "learn to draw", date: moment().startOf("day").toDate()},
        {id: 22221, content: "Got a new bizzare requirement today but was able to drive the huddle fruitfully to make a decision", type: "day job", date: moment().startOf("day").toDate()},
        {id: 22221, content: "Decided to use Backbone.js over Angular.js not to my choice. Let us see how it goes in a month's time", type: "day job", date: moment().subtract(1, "month").startOf("day").toDate()},
        {id: 33331, content: "Need to talk to the manager about what happened today in XYZ meeting", type: "feedback", date: moment().subtract(4, "days").startOf("day").toDate()},
        {id: 44441, content: "Placeholder", type: "skating", date: moment().startOf("day").toDate()},
        {id: 44442, content: "Placeholder", type: "skating", date: moment().subtract(1, "days").startOf("day").toDate()},
        {id: 44443, content: "Placeholder", type: "skating", date: moment().subtract(2, "days").startOf("day").toDate()},
        {id: 44444, content: "Placeholder", type: "skating", date: moment().subtract(3, "days").startOf("day").toDate()},
        {id: 44445, content: "Placeholder", type: "skating", date: moment().subtract(5, "days").startOf("day").toDate()}
    ];
    this.markersData = [
        {id: 1, date: moment().add(20, "days").startOf("day").toDate(), label: "New Project"}
    ];

    selfie.model = model;

    this.authenticate = function () {
        this.loadData();
        GlobalEvent.trigger("user-info-fetched", {name: "Demo User"});
    };

    this.loadData = function() {
        selfie.model.set("markers", selfie.markersData);
        selfie.model.set("events", selfie.notesData);
    };

    this.createNote = function (eventInfo) {
        eventInfo.id = eventInfo.content.hashCode();
        selfie.notesData.push(eventInfo);
        selfie.model.afterCreateNote(eventInfo);
    };

    this.deleteNote = function (event) {
        delete _.find(selfie.notesData, function(note) { return note.id == event.id});
        selfie.model.afterDeleteNote(event);
    };

    this.createMarker = function (markerInfo) {
        markerInfo.id = markerInfo.label.hashCode();
        selfie.markersData.push(markerInfo);
        selfie.model.afterAddMarker(markerInfo);
    };

    this.deleteMarker = function (markerInfo) {
        delete _.find(selfie.markersData, function(marker) { return marker.id == markerInfo.id});
        selfie.model.afterDeleteMarker(markerInfo);
    };

}