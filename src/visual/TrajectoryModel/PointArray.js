import VisualTrajectoryModelAbstract from "./Abstract";
import {deg2rad} from "../../algebra";

export default class VisualTrajectoryModelPointArray extends VisualTrajectoryModelAbstract
{
    constructor(trajectory, color, modelParams) {
        super(trajectory, color);

        this.referenceFrame = sim.starSystem.getReferenceFrame(modelParams.referenceFrame);
        this.showAhead = modelParams.showAhead;
        this.showBehind = modelParams.showBehind;
        this.trailPeriod = modelParams.trailPeriod;

        this.minCos = Math.cos(deg2rad(2));
        this.minStep = 180;
        this.threeObj.position.set(0, 0, 0);

        this.initVertices();
    }

    render(epoch) {
        const endingBrightness = 0.4;
        const originPos = this.referenceFrame.getOriginPositionByEpoch(epoch);
        let points = [];
        let colors = [];

        if (epoch < this.trajectory.minEpoch) {
            this.threeObj.visible = false;
            return;
        }

        for (let i = 0; i < this.positions.length; ++i) {
            if (this.epochs[i] < epoch - this.trailPeriod) {
                if (this.showBehind) {
                    points.push(sim.getVisualCoords(this.positions[i].add(originPos)));
                    colors.push(0);
                }
                if (this.epochs[i+1] > epoch - this.trailPeriod) {
                    points.push(sim.getVisualCoords(
                        this.trajectory.getPositionByEpoch(epoch - this.trailPeriod, this.referenceFrame).add(originPos)
                    ));
                    colors.push(0);
                }
            } else if (this.epochs[i] < epoch) {
                points.push(sim.getVisualCoords(this.positions[i].add(originPos)));
                colors.push(1 - (epoch - this.epochs[i]) / this.trailPeriod);
            } else if (this.epochs[i] > epoch && this.showAhead) {
                points.push(sim.getVisualCoords(this.positions[i].add(originPos)));
                colors.push(0);
            }

            if ((this.epochs[i] < epoch)
                && (this.epochs[i+1] >= epoch)
            ) {
                const pos = sim.getVisualCoords(
                    this.trajectory.getPositionByEpoch(epoch, this.referenceFrame).add(originPos)
                );
                points.push(pos);
                points.push(pos);
                colors.push(1);
                colors.push(0);
            }
        }

        this.threeObj.visible = true;
        this.updateGeometry(points, colors, endingBrightness);

        this.threeObj.quaternion.copy(this.referenceFrame.getQuaternionByEpoch(epoch).toThreejs());
    }

    findPointByEpoch(epoch) {
        let low  = 0;
        let high = this.epochs.length - 1;
        let idx = Math.floor((low + high) / 2);

        do {
            if (this.epochs[idx] < epoch) {
                low = idx;
            } else if (this.epochs[idx] > epoch) {
                high = idx;
            } else {
                return idx;
            }
            idx = Math.floor((low + high) / 2)
        } while (idx != low);

        return (epoch - this.epochs[idx] > this.epochs[idx + 1] - epoch)
            ? idx + 1
            : idx;
    }

    initVertices() {
        const traj = this.trajectory;
        let step = this.minStep;
        let curEpoch = traj.minEpoch;
        let curState = traj.getStateByEpoch(curEpoch, this.referenceFrame);
        let curVelocity = curState.velocity.unit_();

        this.positions = [curState.position];
        this.epochs = [curEpoch];
        let i = 1;

        while (curEpoch < traj.maxEpoch) {
            let lastState;
            let lastEpoch;
            let lastDrMag;
            let isIncreasing = null;
            let stepsLeft = 20;
            while (true) {
                const nextEpoch = (curEpoch + step > traj.maxEpoch)
                    ? traj.maxEpoch
                    : curEpoch + step;
                step = nextEpoch - curEpoch;
                const newState = traj.getStateByEpoch(nextEpoch, this.referenceFrame);
                const dr = newState._position.sub(curState._position);
                const drMag = dr.mag;
                let angleCos = dr.dot(curVelocity) / drMag;

                if (nextEpoch != traj.maxEpoch) {
                    const nextNextEpoch = (nextEpoch + step > traj.maxEpoch)
                        ? traj.maxEpoch
                        : nextEpoch + step;
                    const nextNewState = traj.getStateByEpoch(nextNextEpoch, this.referenceFrame);
                    const nextDr = nextNewState._position.sub(newState._position);
                    angleCos = Math.min(angleCos, dr.dot(nextDr) / drMag / nextDr.mag);
                }

                // angle is too big
                if (angleCos < this.minCos) {
                    if (isIncreasing === true) {
                        break;
                    }
                    step /= 2;
                    isIncreasing = false;
                // angle is acceptable
                } else {
                    lastState = newState;
                    lastEpoch = nextEpoch;
                    lastDrMag = drMag;
                    if (isIncreasing === false || nextEpoch === traj.maxEpoch) {
                        break;
                    }
                    step *= 2;
                    isIncreasing = true;
                }

                --stepsLeft;
                if (stepsLeft === 0 || Math.abs(step) < this.minStep) {
                    step = this.minStep * Math.sign(step);
                    if (lastState === undefined) {
                        lastState = newState;
                        lastEpoch = nextEpoch;
                        lastDrMag = drMag;
                    }
                    break;
                }
            }

            this.epochs[i] = lastEpoch;
            this.positions[i] = lastState.position;

            curState = lastState;
            curVelocity = curState.velocity.unit_();
            curEpoch = lastEpoch;
            i++;
        }
    }
}