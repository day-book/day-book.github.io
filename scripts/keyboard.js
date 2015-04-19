function Keyboard() {
    this.bindAll = function () {
        Mousetrap.bind('right', function (e) {
            time_slider_view.slideTimeline(1);
        });

        Mousetrap.bind('left', function (e) {
            time_slider_view.slideTimeline(-1);
        });

        Mousetrap.bind('shift+right', function (e) {
            time_slider_view.slideTimeline(7);
        });

        Mousetrap.bind('shift+left', function (e) {
            time_slider_view.slideTimeline(-7);
        });

        Mousetrap.bind('shift+n', function (e) {
            time_slider_view.showNewNotePopup();
            return false;
        });

        Mousetrap.bind('shift+m', function (e) {
            time_slider_view.showNewMarkerPopup();
            return false;
        });

        Mousetrap.bind('esc', function (e) {
            $(".new-note-popup").hide();
            $(".note-popup").hide();
        });

        Mousetrap.bind('shift+down', function(e) {
            time_slider_view.zoomOut();
        });

        Mousetrap.bind('shift+up', function(e) {
            time_slider_view.zoomIn();
        });
    }

    this.unbindAll = function () {
        Mousetrap.unbind('right');
        Mousetrap.unbind('left');
        Mousetrap.unbind('shift+right');
        Mousetrap.unbind('shift+left');
        Mousetrap.unbind('shift+n');
        Mousetrap.unbind('esc');
    }
}