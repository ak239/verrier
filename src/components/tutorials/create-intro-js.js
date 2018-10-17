import introJs from "intro.js";

export function createIntroJs({ steps, nextLabel = "Next", prevLabel = "Back", doneLabel = "OK, got it" }) {
    const intro = introJs();
    intro.setOptions({
        steps,
        nextLabel,
        prevLabel,
        doneLabel,
        hideNext: true,
        hidePrev: true,
        showBullets: false,
        showProgress: true,
        showStepNumbers: false,
        scrollToElement: true,
        tooltipClass: "urbain-tutorial-wizard",
        exitOnOverlayClick: false,
        disableInteraction: true,
    });

    return intro;
}
