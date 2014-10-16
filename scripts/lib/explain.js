$.fn.explain = function(method) {

    this.steps = $(this).find("li");
    this.currentStep = -1;
    this.noteTemplate = "<div class='explain-container'>" +
        "<div class='nub top-nub'>&nbsp;</div>" +
        "<div class='content'>" +
        "  <div class='message'></div>" +
        "  <div class='next'>Next</div>" +
        "</div>"+
        "<div class='nub bottom-nub'>&nbsp;</div>";

    this.init = function() {

        this.nextStep();
    }

    this.nextStep = function() {
        var selfie = this;
        this.currentStep++;
        var currentStepEl = $(this.steps[this.currentStep]);
        $(".explain-container").remove();
        var container = $(this.noteTemplate);
        $('body').append(container);
        this.setPosition(container, currentStepEl);
        container.find(".message").text(currentStepEl.text());
        if(this.currentStep < this.steps.length-1) {
            container.find(".next").click(function () {
                selfie.nextStep();
            });
        } else {
            container.find(".next").text("Done");
            container.find(".next").click(function () {
                $(".explain-container").remove();
            });
        }
    }

    this.setPosition = function(container, currentStepEl) {
        var selector = currentStepEl.data("selector");
        var focusElement = $.find(selector);
        var elementPosition = focusElement[0].getBoundingClientRect();
        var suggestedPosition = currentStepEl.data("position");
        var left = elementPosition.left + (elementPosition.width/2);
        var top = (suggestedPosition == "top") ? (elementPosition.top - container.height()) : elementPosition.bottom;
        if(suggestedPosition == "top") {
            container.find(".nub").toggle();
        }
        container.css("top", top);
        container.css("left", left);

    }

    this.init();
}