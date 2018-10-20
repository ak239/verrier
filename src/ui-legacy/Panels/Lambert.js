import $ from "jquery";

import UIPanel from "../Panel";
import LambertSolver from "../../core/LambertSolver";
import ReferenceFrameFactory, {ReferenceFrame} from "../../core/ReferenceFrame/Factory";
import VisualTrajectoryModelKeplerian from "../../core/visual/Trajectory/Keplerian";
import VisualVector from "../../core/visual/Vector";
import EphemerisObject from "../../core/EphemerisObject";
import { sim } from "../../core/Simulation";
import Events from "../../core/Events";

export default class UIPanelLambert extends UIPanel
{
    constructor(panelDom) {
        super(panelDom, true);

        this.maxTransferTime = 86400 * 365.25 * 40;

        this.jqSlider = this.jqDom.find('#transferTimeSlider');
        this.jqSlider.on('input change', () => this.changeTransferTime(this.getCurrentTransferTime()));
        this.transferTime = this.getCurrentTransferTime();

        this.jqTransferTimeText = this.jqDom.find('#transferTimeValue');
        this.jqTransferTimeText.html(this.formatTransferTime(this.transferTime));

        this.jqDateText = this.jqDom.find('#departureDateValue');

        this.jqDom.find('#useCurrentTime').click(() => this.useCurrentTime());

        this.jqOrigin = this.jqDom.find('#originSelect');
        this.jqOrigin.on('change', () => this.changeOrigin(0|this.jqOrigin.val()));

        this.jqTarget = this.jqDom.find('#targetSelect');
        this.jqTarget.on('change', () => this.changeTarget(0|this.jqTarget.val()));

        this.useCurrentTime();

        this.origin = 399;
        this.jqOrigin.val(this.origin);

        Events.addListener(Events.STAR_SYSTEM_LOADED, () => {
            this.jqOrigin.html('');
            this.jqTarget.html('');
            const listData = this.buildListData();
            if (listData) {
                this.updateList(this.jqTarget, listData);
                this.updateList(this.jqOrigin, listData);
            }
        });
    }

    solve() {
        if (!this.origin || !this.target || this.origin === this.target) {
            return;
        }

        const parentObject = sim.getModule('PatchedConics').getCommonParent(this.origin, this.target);

        if (parentObject === null || parentObject.id == this.origin || parentObject.id == this.target) {
            return;
        }

        const referenceFrameId = ReferenceFrameFactory.buildId(parentObject.id, ReferenceFrame.INERTIAL_ECLIPTIC);
        const origin = sim.starSystem.getObject(this.origin);
        const target = sim.starSystem.getObject(this.target);
        const state1 = origin.trajectory.getStateByEpoch(this.departureTime, referenceFrameId);
        const state2 = target.trajectory.getStateByEpoch(this.departureTime + this.transferTime, referenceFrameId);

        const solverResult = LambertSolver.solveFullTransfer(
            origin,
            target,
            origin.physicalModel ? origin.physicalModel.radius + 200 : 0,
            target.physicalModel ? target.physicalModel.radius + 200 : 0,
            this.departureTime,
            this.transferTime
        );
        if (!solverResult) {
            return;
        }
        const transferTrajectory = solverResult.trajectory;
        transferTrajectory.setObject(new EphemerisObject(-1, EphemerisObject.TYPE_UNKNOWN, origin.name + '->' + target.name + ' transfer'));

        if (this.visualModel) {
            this.visualModel.drop();
            this.visualModel2 && this.visualModel2.drop();
            this.visualModel3 && this.visualModel3.drop();
            this.vector1.drop();
            this.vector2.drop();
        }

        this.visualModel = new VisualTrajectoryModelKeplerian(transferTrajectory.components[0], 'yellow');
        if (transferTrajectory.components[1]) {
            this.visualModel2 = new VisualTrajectoryModelKeplerian(transferTrajectory.components[1], 'red');
        }
        if (transferTrajectory.components[2]) {
            this.visualModel3 = new VisualTrajectoryModelKeplerian(transferTrajectory.components[2], 'red');
        }
        this.vector1 = new VisualVector(state1.position, referenceFrameId);
        this.vector2 = new VisualVector(state2.position, referenceFrameId);

        this.jqDom.find('#deltaVEjection').html(solverResult.ejectionDeltaV.toPrecision(4));
        this.jqDom.find('#deltaVInsertion').html(solverResult.insertionDeltaV.toPrecision(4));
        this.jqDom.find('#deltaVTotal').html((solverResult.ejectionDeltaV + solverResult.insertionDeltaV).toPrecision(4));
    }

    collapse() {
        if (this.visualModel) {
            this.visualModel.drop();
            this.visualModel2.drop();
            this.visualModel3.drop();
            this.vector1.drop();
            this.vector2.drop();
            this.visualModel = null;
        }
        super.collapse();
    }

    useCurrentTime() {
        this.departureTime = sim.currentEpoch;
        this.updateTime(sim.currentDate);
        this.solve();
    }

    changeOrigin(newOrigin) {
        this.origin = newOrigin;
        this.updateSliderScale();
        this.solve();
    }

    changeTarget(newTarget) {
        this.target = newTarget;
        this.updateSliderScale();
        this.solve();
    }

    updateSliderScale() {
        if (!this.origin || !this.target || this.origin === this.target) {
            return;
        }

        const periods = sim.getModule('PatchedConics').getRelativePeriod(this.origin, this.target, this.departureTime);

        if (periods === null) {
            return;
        }

        this.maxTransferTime = Math.max(periods.period1, periods.period2);
        this.jqSlider.val(this.getNeededSliderValue((periods.period1 + periods.period2) / 4));
        this.changeTransferTime(this.getCurrentTransferTime());
    }

    changeTransferTime(newTransferTime) {
        this.transferTime = newTransferTime;
        this.jqTransferTimeText.html(this.formatTransferTime(this.transferTime));
        this.solve();
    }

    getCurrentTransferTime() {
        const val = this.jqSlider.val();
        return val * val * val * val * this.maxTransferTime;
    }

    getNeededSliderValue(transferTime) {
        const val = Math.sqrt(Math.sqrt(transferTime / this.maxTransferTime));
        return Math.max(0, Math.min(1, val));
    }

    buildListData() {
        const root = sim.getModule('PatchedConics').getRootSoi();

        if (!root) {
            return null;
        }

        return this.buildSoiTreeData(root, 0);
    }

    buildSoiTreeData(soiObject, level) {
        let result = [{id: soiObject.id, level: level, name: soiObject.name}];
        for (let child of soiObject.data.patchedConics.childSois) {
            result = result.concat(this.buildSoiTreeData(child, level + 1));
        }
        return result;
    }

    updateList(jqList, data) {
        const indent = '&nbsp;&nbsp;&nbsp;';
        for (let entry of data) {
            jqList.append($('<option>', {value: entry.id}).html(indent.repeat(entry.level) + entry.name));
        }
    }

    updateTime(date) {
        this.jqDateText.html(sim.time.formatDateFull(date));
    }


    formatTransferTime(scale) {
        const precision = 3;

        const prefix = (scale < 0) ? '-' : '';
        const abs = Math.abs(scale);
        if (abs === 0) {
            return '0';
        }

        if (abs < 60) {
            return prefix + abs.toPrecision(precision) + ' s';
        }

        if (abs < 3600) {
            return prefix + (abs / 60).toPrecision(precision) + ' min';
        }

        if (abs < 86400) {
            return prefix + (abs / 3600).toPrecision(precision) + ' h';
        }

        if (abs < 2592000) {
            return prefix + (abs / 86400).toPrecision(precision) + ' days';
        }

        if (abs < 31557600) {
            return prefix + (abs / 2592000).toPrecision(precision) + ' months';
        }

        return prefix + (abs / 31557600).toPrecision(precision) + ' years';
    }
}
