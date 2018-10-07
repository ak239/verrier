import Events from "../../core/Events";
import UIPanel from "../Panel";
import { sim } from "../../core/Simulation"

export default class UIPanelTime extends UIPanel
{
    constructor(panelDom) {
        super(panelDom);

        this.maxTimeScale = 6 * 30 * 86400;

        this.jqSlider = this.jqDom.find('#timeScaleSlider');
        this.jqSlider.on('input change', () => sim.time.setTimeScale(this.getCurrentTimeScale()));
        this.jqSlider.val(this.getNeededSliderValue(sim.time.timeScale));

        this.jqScaleText = this.jqDom.find('#timeScaleValue');
        this.jqScaleText.html(this.formatTimeScale(sim.time.timeScale));

        document.addEventListener(Events.TIME_SCALE_CHANGED, (event) => {
            this.jqSlider.val(this.getNeededSliderValue(event.detail.new));
            this.jqScaleText.html(this.formatTimeScale(event.detail.new));
        });

        this.jqDateText = this.jqDom.find('#currentDateValue');
        document.addEventListener(Events.EPOCH_CHANGED, (event) => this.updateTime(event.detail.date));

        this.jqDom.find('#setRealTimeScale').click(() => sim.time.setTimeScale(1));
        this.jqDom.find('#useCurrentTime').click(() => sim.time.useCurrentTime());
    }

    updateTime(date) {
        this.jqDateText.html(sim.time.formatDateFull(date));
    }

    /**
     * @returns {number} — simulation seconds per 1 real life second
     */
    getCurrentTimeScale() {
        const val = this.jqSlider.val();
        return Math.sign(val) * val * val * val * val * this.maxTimeScale;
    }

    getNeededSliderValue(timeScale) {
        const val = Math.sqrt(Math.sqrt(Math.abs(timeScale) / this.maxTimeScale));
        return Math.sign(timeScale) * Math.min(1, val);
    }

    formatTimeScale(scale) {
        const precision = 2;

        const prefix = (scale < 0) ? '-' : '';
        const abs = Math.abs(scale);
        if (abs === 0) {
            return '0';
        }

        if (abs < 60) {
            return prefix + abs.toPrecision(precision) + ' s/s';
        }

        if (abs < 3600) {
            return prefix + (abs / 60).toPrecision(precision) + ' min/s';
        }

        if (abs < 86400) {
            return prefix + (abs / 3600).toPrecision(precision) + ' h/s';
        }

        if (abs < 2592000) {
            return prefix + (abs / 86400).toPrecision(precision) + ' days/s';
        }

        if (abs < 31557600) {
            return prefix + (abs / 2592000).toPrecision(precision) + ' months/s';
        }

        return prefix + (abs / 31557600).toPrecision(precision) + ' years/s';
    }
}
