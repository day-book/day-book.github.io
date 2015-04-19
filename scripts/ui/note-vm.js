var NotesVM = new function () {
    this.Region = new function() {
        this.x = function (d) {
            var noteTypeWidths = _.collect($(".note-type text"), function(element) {
                return element.getBBox().width;
            });
            return NoteLaneVM.label.x() + _.max(noteTypeWidths);
        };
        this.y = function (d) {
            return 0;
        };
        this.width = function(d) {
            return EnvironmentVM.availableWidth();
        };
        this.height = function(d) {
            return EnvironmentVM.availableHeight();
        };
    };
};

var NoteVM = new function () {
    var self = this;

    this.x = function (d) {
        return EnvironmentVM.timeScale(self.midDay(d.date));
    };

    this.y = function (d) {
        return EnvironmentVM.noteTypeScale(d.type)
    };

    this.r = function (d) {
        return 6 / EnvironmentVM.getZoomLevel();
    };

    this.color = function (d) {
        var noteTypeIndex = EnvironmentVM.noteTypes.indexOf(d.type);
        return EnvironmentVM.getColor(noteTypeIndex);
    };

    this.midDay = function (date) {
        return moment(date).startOf('day').add(12, 'hours').toDate();
    };

    this.Popup = new function () {

        var height = 150;
        var headerOffset = 26;

        this.x = function (d) {
            var popupWidth = NoteVM.Popup.width();
            var x = NoteVM.x(d) - (popupWidth / 2);
            return (x < 0 ? 0 : (x + popupWidth) > EnvironmentVM.width ? (EnvironmentVM.width - popupWidth) : x) + "px";
        };

        this.y = function (d) {
            var y = NoteVM.y(d);
            var caretOffset = 10;
            return y + headerOffset + (NoteVM.Popup.isOnTop(d) ? -height-caretOffset : caretOffset ) + "px";
        };

        this.width = function () {
            return (EnvironmentVM.width / 3);
        };

        this.height = function () {
            return height + "px";
        };

        this.isOnTop = function (d) {
            return (NoteVM.y(d) + headerOffset + height > EnvironmentVM.height);
        };

        this.Caret = new function() {
            this.points = function () {
                return "-10,10 0,0 10,10";
            };

            this.transform = function(d) {
                return NoteVM.Popup.Caret.translate(d) + NoteVM.Popup.Caret.rotate(d);
            };

            this.translate = function(d) {
                return "translate(" + NoteVM.x(d) + "," + NoteVM.y(d) + ") ";
            };

            this.rotate = function(d) {
                return "rotate(" + (NoteVM.Popup.isOnTop(d) ? 180 : 0) + ") ";
            };

            this.x = function (d) {
                return NoteVM.x(d);
            };

            this.y = function () {
                return NoteVM.y(d);
            };
        };

        this.header = {
            text: function () {

            }
        };

        this.content = {
            text: function () {

            }
        };

    };


};