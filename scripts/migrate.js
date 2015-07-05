var migration = function() {

    this.start = function() {
        time_slider_model.storage.fetchUserConfig("migrated", function(migrated) {
            if(!migrated) {
                loginToDropbox();
            } else {
                vex.dialog.alert("Data already migrated from your Dropbox account");
            }
        });
    };

    function loginToDropbox() {
        var dropboxClient = new Dropbox.Client({key: "1eg429deptchqw3"});
        dropboxClient.authDriver(new Dropbox.AuthDriver.Popup({
            receiverUrl: "http://localhost:8888/dropbox_oauth_receiver.html"}));
        dropboxClient.authenticate(function (error) {
            if (error) {
                vex.dialog.alert('Authentication error: ' + error.responseText);
            } else {
                var dataStoreManager = dropboxClient.getDatastoreManager();
                dataStoreManager.openDefaultDatastore(fetchDropboxContent);
            }
        });
    }

    function fetchDropboxContent(error, datastore) {
        if(error) {
            vex.dialog.alert('Error opening default datastore: ' + error.responseText);
        } else {
            var markers = fetch(datastore, "markers");
            var notes = fetch(datastore, "events");
            writeToFirebase(markers, notes);
        }
    }

    function fetch(datastore, tableName, query) {
        var records = datastore.getTable(tableName).query(query);
        var recordsAsMap = [];
        _.each(records, function(record) {
            var recordMap = record.getFields();
            recordMap.id = record.getId();
            recordsAsMap.push(recordMap);
        });
        return recordsAsMap;
    }

    function writeToFirebase(markers, notes) {
        time_slider_model.storage.bulkCreateMarkers(markers);
        time_slider_model.storage.bulkCreateNotes(notes);
        _.delay(function() {
            time_slider_model.storage.loadData();
            vex.dialog.alert(notes.length + " notes " +
                (_.isEmpty(markers) ? "" : " & " + markers.length + " markers ") +
                "migrated from your Dropbox account");
            time_slider_model.storage.updateUserConfig({migrated: true});
        }, 2000);
    }

    return this;
}();