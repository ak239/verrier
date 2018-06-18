import TrajectoryKeplerianAbstract from "./KeplerianAbstract";
import KeplerianObject from "../KeplerianObject";

export default class TrajectoryKeplerianBasic extends TrajectoryKeplerianAbstract
{
    constructor(referenceFrameId, keplerianObject) {
        super(referenceFrameId);
        this.keplerianObject = keplerianObject;
    }

    get mu() {
        return this.keplerianObject.mu;
    }

    set mu(value) {
        this.keplerianObject.mu = value;
    }

    get sma() {
        return this.keplerianObject.sma;
    }

    set sma(value) {
        this.keplerianObject.sma = value;
    }

    get e() {
        return this.keplerianObject.e;
    }

    set e(value) {
        this.keplerianObject.e = value;
    }

    get inc() {
        return this.keplerianObject.inc;
    }

    set inc(value) {
        this.keplerianObject.inc = value;
    }

    get raan() {
        return this.keplerianObject.raan;
    }

    set raan(value) {
        this.keplerianObject.raan = value;
    }

    get aop() {
        return this.keplerianObject.aop;
    }

    set aop(value) {
        this.keplerianObject.aop = value;
    }

    get ta() {
        return this.keplerianObject.ta;
    }

    set ta(value) {
        this.keplerianObject.ta = value;
    }

    get epoch() {
        return this.keplerianObject.epoch;
    }

    set epoch(value) {
        this.keplerianObject.epoch = value;
    }

    getKeplerianObjectByEpoch(epoch) {
        this.validateEpoch(epoch);
        return this.keplerianObject;
    }
}
