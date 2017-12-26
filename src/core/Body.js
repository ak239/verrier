import EphemerisObject from "./EphemerisObject";

export default class Body extends EphemerisObject
{
    constructor(bodyId, name, visualModel, physicalModel, orientation) {
        super(bodyId, name);

        this.visualModel   = visualModel;    // class VisualBodyModelBasic
        this.physicalModel = physicalModel;  // class PhysicalBodyModel
        this.orientation   = orientation;    // class OrientationAbstract

        if (this.visualModel) {
            this.visualModel.body = this;
        }
    }
}