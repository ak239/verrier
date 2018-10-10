import * as THREE from "three";

import Constant from "../FunctionOfEpoch/Constant";
import VisualModelAbstract from "./ModelAbstract";
import {RF_BASE} from "../ReferenceFrame/Factory";
import VirtualPlane from "./VirtualPlane";
import {TWO_PI} from "../algebra";
import ArrowObject from "./Arrow";
import { sim } from "../Simulation";

export default class VisualAngle extends VisualModelAbstract
{
    constructor(referenceFrame, position, orientation, value, color, size, type, editingCallback) {
        super();

        this._referenceFrame = referenceFrame;
        this._position = position;
        this._orientation = orientation;
        this._value = value;
        this.color = color;
        this.type = type;
        this.arcSize = size;
        this.editingCallback = editingCallback;
        this.isEditMode = !!editingCallback;

        this.orientationUpdated = false;
        this.valueUpdated = false;
        this.isHidden = false;
        this.sizeNeedsUpdate = false;

        this.init();
    }

    hide() {
        this.threeObj.visible = false;
        this.isHidden = true;
    }

    show() {
        this.threeObj.visible = true;
        this.isHidden = false;
    }

    getReferenceFrame(epoch) {
        return this._referenceFrame.evaluate(epoch);
    }

    getPosition(epoch) {
        return this._position.evaluate(epoch);
    }

    getOrientation(epoch) {
        return this._orientation.evaluate(epoch);
    }

    getValue(epoch) {
        return this._value.evaluate(epoch);
    }

    init() {
        this.onWheelListener = this.onMouseWheel.bind(this);
        document.addEventListener('wheel', this.onWheelListener);

        if (this.isEditMode) {
            this.mouseDownListener = this.onMouseDown.bind(this);
            document.addEventListener('mousedown', this.mouseDownListener);
        }

        this.size = sim.camera.position.mag / 6 * this.arcSize;

        if (this.type === VisualAngle.TYPE_ARC) {
            this.createArcObject();
        } else {
            this.createSectorObject();
        }
        this.valueUpdated = true;
        this.orientationUpdated = true;
    }

    onMouseWheel() {
        this.sizeNeedsUpdate = true;
    }

    onMouseDown(event) {
        let intersection;
        if (this.type === VisualAngle.TYPE_ARC) {
            intersection = sim.raycaster.intersectObjects([this.threeAngle.line])[0];
        } else {
            intersection = sim.raycaster.intersectObjects(
                [this.threeAngle.children[0].line, this.threeAngle.children[0].cone]
            )[0];
        }

        if (intersection && (event.button == 0)) { //check if the mouse button pressed is left
            this.mouseUpListener = this.onMouseUp.bind(this);
            document.addEventListener('mouseup', this.mouseUpListener);
            this.mouseMoveListener = this.onMouseMove.bind(this);
            sim.addEventListener('mousemove', this.mouseMoveListener, 2);
        }
    }

    onMouseUp(event) {
        document.removeEventListener('mouseup', this.mouseUpListener);
        sim.removeEventListener('mousemove', this.mouseMoveListener);
    }

    onMouseMove() {
        const plane = this.getVirtualPlane();
        let intersection = sim.raycaster.intersectObjects([plane])[0];
        if (intersection) {
            const direction = intersection.point
                .clone()
                .sub(this.threeObj.position)
                .normalize();
            let mainAxis = new THREE.Vector3(1, 0, 0);
            mainAxis.applyQuaternion(this.threeObj.quaternion);

            let newAngleValue = Math.acos(mainAxis.dot(direction) / mainAxis.length() / direction.length()); // no division by lengths because direction and mainAxis are normalized (length = 1)
            mainAxis.cross(direction);

            this._value = new Constant((mainAxis.dot(plane.normal) > 0) ? newAngleValue : TWO_PI - newAngleValue);
            this.valueUpdated = true;
            if (this.editingCallback) {
                this.editingCallback(this._value.value);
            }
        }
    }

    getVirtualPlane() {
        let normal = new THREE.Vector3(0, 0, 1);
        normal.applyQuaternion(this.threeObj.quaternion);
        const angle = Math.acos(normal.dot(this.threeObj.position) / this.threeObj.position.length() / normal.length());
        const distance = this.threeObj.position.length() * Math.cos(angle);

        if (this.virtualPlane) {
            this.virtualPlane.normal.copy(normal);
            this.virtualPlane.constant = distance;
        } else {
            this.virtualPlane = new VirtualPlane(normal, distance);
        }

        return this.virtualPlane;
    }

    createArcObject() {
        let material = new THREE.LineBasicMaterial({color: this.color});
        let threeObj = new THREE.Object3D();

        this.threeArc = new THREE.Line(new THREE.Geometry(), material);
        this.threeMainAxis = new THREE.Line(new THREE.Geometry(), material);
        this.threeAngle = new THREE.Line(new THREE.Geometry(), material);

        this.threeMainAxis.geometry.vertices.push(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(1, 0, 0),
        );
        this.threeAngle.geometry.vertices.push(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(1, 0, 0),
        );

        threeObj.add(this.threeArc);
        threeObj.add(this.threeMainAxis);
        threeObj.add(this.threeAngle);
        threeObj.scale.set(this.size, this.size, this.size);

        this.setThreeObj(threeObj);
    }

    updateArcObject(value) {
        if (value < 0) {
            value -= 2 * Math.PI * Math.floor(value / 2 / Math.PI);
        }
        // todo: optimize this
        this.threeArc.geometry.dispose();
        this.threeArc.geometry = new THREE.Geometry();
        this.threeArc.geometry.setFromPoints(
            (new THREE.EllipseCurve(
                0, 0,
                1 / 3,
                1 / 3,
                0, value,
                false,
                0
            )).getPoints(Math.ceil(value * 30))
        );
    }

    createSectorObject() {
        let material = new THREE.MeshBasicMaterial({
            color: this.color,
            opacity: 0.175,
            transparent: true,
            side: THREE.DoubleSide
        });
        let threeObj = new THREE.Object3D();

        this.threeArc = new THREE.Mesh(new THREE.Geometry(), material);
        this.threeMainAxis = new ArrowObject(
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 0, 0),
            1,
            this.color
        );
        this.threeAngle = new THREE.Object3D();
        this.threeAngle.add(new ArrowObject(
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 0, 0),
            1,
            this.isEditMode ? 0xc2f442 : this.color
        ));

        threeObj.add(this.threeArc);
        threeObj.add(this.threeMainAxis);
        threeObj.add(this.threeAngle);
        threeObj.scale.set(this.size, this.size, this.size);

        this.setThreeObj(threeObj);
    }

    updateSectorObject(value) {
        if (value < 0) {
            value -= 2 * Math.PI * Math.floor(value / 2 / Math.PI);
        }
        // todo: optimize this
        this.threeArc.geometry.dispose();
        this.threeArc.geometry = new THREE.CircleGeometry(
            1,
            Math.ceil(value * 30),
            0,
            value
        );
    }

    drop() {
        super.drop();
        delete this.threeMainAxis;
        delete this.threeAngle;
        delete this.threeArc;
        document.removeEventListener('wheel', this.onWheelListener);
        if (this.mouseDownListener) {
            document.removeEventListener('mousedown', this.mouseDownListener);
        }
    }

    render(epoch) {
        if (this.isHidden) {
            return;
        }

        const referenceFrame = this.getReferenceFrame(epoch);
        const pos = referenceFrame.transformPositionByEpoch(
            epoch,
            this.getPosition(epoch),
            RF_BASE
        );
        this.setPosition(pos);
        this.threeObj.visible = true;

        if (this.valueUpdated || !(this._value instanceof Constant)) {
            const value = this.getValue(epoch);
            if (this.type === VisualAngle.TYPE_ARC) {
                this.updateArcObject(value);
            } else {
                this.updateSectorObject(value);
            }
            this.threeAngle.rotation.z = value;
            this.valueUpdated = false;
        }

        if (this.orientationUpdated || !(this._orientation instanceof Constant)) {
            this.threeObj.quaternion.copy(referenceFrame.getQuaternionByEpoch(epoch).mul_(this.getOrientation(epoch)).toThreejs());
            this.orientationUpdated = false;
        }

        if (this.sizeNeedsUpdate) {
            this.size = this.threeObj.position.length() / 6 * this.arcSize;
            this.threeObj.scale.set(this.size, this.size, this.size);
            this.sizeNeedsUpdate = false;
        }
    }
}

VisualAngle.TYPE_ARC    = 'arc';
VisualAngle.TYPE_SECTOR = 'sector';
