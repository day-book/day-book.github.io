function FirebaseStorage(model) {
    var dateFormat = "YYYY-MM-DD";
    var selfie = this;
    selfie.model = model;

    this.init = function () {
        selfie.ref = new Firebase("https://kurippu.firebaseio.com");
    };

    this.authenticate = function () {
        var existingAuth = selfie.ref.getAuth();
        if (existingAuth == null) {
            selfie.ref.authWithOAuthPopup("google", function (error, authData) {
                if (error) {
                    alert("Login Failed! Try Again");
                    console.error("Login failed", error);
                } else {
                    selfie.user = authData;
                    selfie.loadData();
                    selfie.fetchUserName();
                }
            });
        } else {
            selfie.user = existingAuth;
            selfie.fetchUserName();
            selfie.loadData();
        }
    };

    this.fetchUserName = function () {
        GlobalEvent.trigger("user-info-fetched", {name: selfie.user.google.displayName});
    };

    this.loadData = function () {
        this.loadMarkers();
        this.loadEvents();
    };

    this.loadMarkers = function () {
        var markers = selfie.ref.child(selfie.user.uid + "/markers");
        markers.once('value', function (marker) {
            var markerObjects = flattenMarkers(marker.val());
            selfie.model.set("markers", markerObjects);
        });
    };

    this.createMarker = function (markerInfo, muteNotifications) {
        var dateString = moment(markerInfo.date).format(dateFormat);
        var marker = selfie.ref.child(selfie.user.uid + "/markers/" + dateString);
        marker.once('value', function (snapshot) {
            if (snapshot.exists()) {
                markerInfo.label = markerInfo.label + ", " + snapshot.val().label;
                if (!muteNotifications) {
                    selfie.model.afterUpdateMarker(markerInfo);
                }
            } else {
                if (!muteNotifications) {
                    selfie.model.afterAddMarker(markerInfo);
                }
            }
            marker.update({label: markerInfo.label});
        });
    };

    this.bulkCreateMarkers = function (markers) {
        _.forEach(markers, function (marker) {
            selfie.createMarker(marker, true);
        });
    };

    this.deleteMarker = function (markerInfo) {
        var dateString = moment(markerInfo.date).format(dateFormat);
        var marker = selfie.ref.child(selfie.user.uid + "/markers/" + dateString);
        marker.remove();
        selfie.model.afterDeleteMarker(markerInfo);
    };

    this.loadEvents = function () {
        var notes = selfie.ref.child(selfie.user.uid + "/notes");
        notes.once('value', function (snapshot) {
            var noteObjects = flattenNotes(snapshot.val());
            selfie.model.set("events", noteObjects);
        });
    };

    this.createNote = function (noteInfo, muteNotifications) {
        var dateString = moment(noteInfo.date).format(dateFormat); //Cannot store date in firebase

        var note = selfie.ref.child(selfie.user.uid + "/notes/" + dateString + "/" + noteInfo.type);
        note.once('value', function (snapshot) {
            if (snapshot.exists()) {
                noteInfo.content = noteInfo.content + "\n\n" + snapshot.val().content;
                note.update({content: noteInfo.content});
                if (!muteNotifications) {
                    selfie.model.afterUpdateNote(noteInfo);
                }
            } else {
                note.update({content: noteInfo.content});
                if (!muteNotifications) {
                    selfie.model.afterCreateNote(noteInfo);
                }
            }

        });
    };

    this.bulkCreateNotes = function (notes) {
        _.forEach(notes, function (note) {
            selfie.createNote(note, true);
        });
    };


    this.deleteNote = function (noteInfo) {
        var dateString = moment(noteInfo.date).format(dateFormat);
        var note = selfie.ref.child(selfie.user.uid + "/notes/" + dateString + "/" + noteInfo.type);
        note.remove();
        selfie.model.afterDeleteNote(noteInfo);
    };

    this.updateUserConfig = function (map) {
        var config = selfie.ref.child(selfie.user.uid + "/config");
        config.update(map);
    };

    this.fetchUserConfig = function (key, callback) {
        var config = selfie.ref.child(selfie.user.uid + "/config");
        config.once('value', function (snapshot) {
            if(snapshot.exists()) {
                callback(snapshot.val()[key]);
            } else {
                callback(undefined);
            }
        });
    };

    this.init();

    function flattenMarkers(dates) {
        var flattenedMarkers = [];
        _.forEach(dates, function (labels, date) {
            flattenedMarkers.push({"date": moment(date, dateFormat), "label": labels.label})
        });
        return flattenedMarkers;
    }

    function flattenNotes(dates) {
        var flattenedNotes = [];
        _.forEach(dates, function (tags, date) {
            _.forEach(tags, function (info, tag) {
                flattenedNotes.push({"date": moment(date, dateFormat), "type": tag, "content": info.content});
            })
        });
        return flattenedNotes;
    }

}