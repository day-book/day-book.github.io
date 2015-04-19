function Storage(model) {
    var selfie = this;
    selfie.model = model;

    this.init = function () {
        selfie.storageClient = new Dropbox.Client({key: "1eg429deptchqw3"});
    };

    this.authenticate = function () {
        var that = this;
        selfie.storageClient.authenticate(function (error) {
            if (error) {
                vex.dialog.alert('Authentication error: ' + error.responseText);
            } else {
                initDatastore();
                //that.getUserName(callback);
                that.fetchUserName();
            }
        });
    };

    this.fetchUserName = function() {
        return selfie.storageClient.getAccountInfo(function(error, info) {
            if(error) {
                vex.dialog.alert('Authentication error: ' + error.responseText);
            } else {
                GlobalEvent.trigger("user-info-fetched", {name: info.name});
            }
        });
    };

    this.createNote = function (eventInfo) {
        var existingEvent = fetch('events', {type: eventInfo.type, date: moment(eventInfo.date).startOf('day').toDate()});
        if(existingEvent.length == 1) {
            var existingContent = existingEvent[0].content;
            existingEvent[0].content = existingContent + "\n\n" + eventInfo.content;
            update('events', existingEvent[0]);
            selfie.model.afterUpdateNote(existingEvent[0]);
            //GlobalEvent.trigger("note-updated", existingEvent[0]);
        } else {
            insert('events', eventInfo);
            selfie.model.afterCreateNote(eventInfo);
            //GlobalEvent.trigger("note-created", eventInfo);
        }
    };

    this.updateType = function(oldType, newType) {
        //var events = fetch('events', {type: oldType});
        var events = selfie.datastore.getTable('events').query({type: oldType});
        _.each(events, function(event) {
            event.set('type', newType);
        });

    };

    this.deleteNote = function (event, events) {
        remove('events', {id: event.id});
        selfie.model.afterDeleteNote(event);
    };

    this.createMarker = function(markerInfo) {
        insert("markers", markerInfo);
    };

    this.deleteMarker = function(markerInfo, markers) {
        remove("markers", markerInfo);
    };

    function initDatastore() {
        var dataStoreManager = selfie.storageClient.getDatastoreManager();
        dataStoreManager.openDefaultDatastore(function(error, datastore) {
            if(error) {
                vex.dialog.alert('Error opening default datastore: ' + error.responseText);
            } else {
                selfie.datastore = datastore;
                loadData();
            }
        })
    }

    function loadData() {
        loadMarkers();
        loadEvents();
    }

    function loadEvents() {
        var events = fetch("events");
        selfie.model.set("events", events);
    }

    function loadMarkers() {
        var markers = fetch("markers");
        selfie.model.set("markers", markers);
    }

    function fetch(tableName, query) {
        var records = selfie.datastore.getTable(tableName).query(query);
        var recordsAsMap = [];
        _.each(records, function(record) {
            var recordMap = record.getFields();
            recordMap.id = record.getId();
            recordsAsMap.push(recordMap);
        });
        return recordsAsMap;
    }

    function insert(tableName, data) {
        var table = selfie.datastore.getTable(tableName);
        var record = table.insert(data);
        data.id = record.getId();
    }

    function update(tableName, data) {
        var table = selfie.datastore.getTable(tableName);
        var record = table.get(data.id);
        record.update(data);
    }

    function remove(tableName, data) {
        var table = selfie.datastore.getTable(tableName);
        var record = table.get(data.id);
        record.deleteRecord();
    }

    this.init();
}




