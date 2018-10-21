import TrajectoryAbstract from "./Abstract";
import ExceptionOutOfRange from "./ExceptionOutOfRange";

export default class TrajectoryComposite extends TrajectoryAbstract
{
    constructor() {
        super();
        this.components = [];
        this.lastUsedTrajectory = null;
        this.isSelected = false;
    }

    select() {
        this.isSelected = true;
        this.visualModel && this.visualModel.select();
        this.components.map(traj => traj.select());
    }

    deselect() {
        super.deselect();
        this.components.map(traj => traj.deselect());
    }

    drop() {
        super.drop();
        this.components.map(traj => traj.drop());
    }

    isEditableAtEpoch(epoch) {
        return this.getComponentByEpoch(epoch).isEditableAtEpoch(epoch);
    }

    getReferenceFrameByEpoch(epoch) {
        return this.getComponentByEpoch(epoch).getReferenceFrameByEpoch(epoch);
    }

    getStateInOwnFrameByEpoch(epoch) {
        return this.getComponentByEpoch(epoch).getStateInOwnFrameByEpoch(epoch);
    }

    getKeplerianObjectByEpoch(epoch) {
        return this.getComponentByEpoch(epoch).getKeplerianObjectByEpoch(epoch);
    }

    getStateByEpoch(epoch, referenceFrameOrId) {
        return this.getComponentByEpoch(epoch).getStateByEpoch(epoch, referenceFrameOrId);
    }

    getComponentByEpoch(epoch) {
        if (this.lastUsedTrajectory
            && (this.lastUsedTrajectory.minEpoch === false || this.lastUsedTrajectory.minEpoch <= epoch)
            && (this.lastUsedTrajectory.maxEpoch === false || this.lastUsedTrajectory.maxEpoch >= epoch)
        ) {
            return this.lastUsedTrajectory;
        }

        for (let trajectory of this.components) {
            if (trajectory.isValidAtEpoch(epoch)) {
                this.lastUsedTrajectory = trajectory;
                return trajectory;
            }
        }

        throw new ExceptionOutOfRange(this.object, this, epoch, this.minEpoch, this.maxEpoch);
    }

    addComponent(trajectory) {
        this.components.push(trajectory);
        trajectory.setParent(this);

        if (this.isSelected) {
            trajectory.select();
        }

        if (this.minEpoch === false
            || (trajectory.minEpoch !== false
                && this.minEpoch > trajectory.minEpoch
            )
        ) {
            this.minEpoch = trajectory.minEpoch;
        }
        if (this.maxEpoch === false
            || (trajectory.maxEpoch !== false
                && this.maxEpoch < trajectory.maxEpoch
            )
        ) {
            this.maxEpoch = trajectory.maxEpoch;
        }
    }

    clearAfterEpoch(epoch) {
        while (this.components[this.components.length - 1].minEpoch >= epoch) {
            this.components[this.components.length - 1].drop();
            this.components.pop();
        }
        while (this.flightEvents.length && this.flightEvents[this.flightEvents.length - 1].epoch >= epoch) {
            this.flightEvents.pop();
        }
        for (let component of this.components) {
            if (component.maxEpoch === false || component.maxEpoch > epoch) {
                component.clearAfterEpoch(epoch);
            }
        }
    }
}
