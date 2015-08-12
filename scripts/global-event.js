var GlobalEvent = {

    listenTo: function(eventName, handler) {
        document.addEventListener(eventName, handler);
    },

    trigger: function(eventName, data) {
        var event = new CustomEvent(eventName, {detail: data});
        document.dispatchEvent(event);
    }

}