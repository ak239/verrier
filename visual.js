"use_strict";

class VisualBodyModel
{
    constructor(shape, color, texturePath) {
        this.shape = shape;   // class VisualShapeAbstract
        this.color = color;
        this.body = null; // class Body
        
        this.threeObj = new THREE.Mesh(
            this.shape.getThreeGeometry(),
            this.getMaterial({color: this.color, wireframe: true})
        );
        
        scene.add(this.threeObj);

        if (texturePath !== undefined) {
            var that = this;
            
            textureLoader.load(
                COMMON_TEXTURE_PATH + texturePath,
                function(txt) {
                    that.threeObj.material.dispose();
                    that.threeObj.material = that.getMaterial({map: txt});
                },
                undefined,
                function(err) { 
                    console.log(err);
                }                    
            );
        }
    }

    getMaterial(parameters) {
    	parameters.metalness = 0;
    	parameters.roughness = 1;
    	return new THREE.MeshStandardMaterial(parameters);
    }

    render(epoch, pos) {
        this.threeObj.position.set(pos.x, pos.y, pos.z);
        this.threeObj.quaternion.copy(
            this.body.orientation.getOrientationByEpoch(epoch)
        );
    }
}

class VisualBodyModelLight extends VisualBodyModel
{
    constructor(shape, color, texturePath, lightColor, lightIntensity, lightDistance, lightDecay) {
        super(shape, color, texturePath);

        this.light = new THREE.PointLight(lightColor, lightIntensity, lightDistance, lightDecay);
        scene.add(this.light);
    }

    render(epoch, pos) {
        super.render(epoch, pos);
        this.light.position.set(pos.x, pos.y, pos.z);
    }

    getMaterial(parameters) {
    	return new THREE.MeshBasicMaterial(parameters);
    }
}

class VisualShapeAbstract
{
    getThreeGeometry() {}
}

class VisualShapeSphere extends VisualShapeAbstract
{
    constructor(radius, segments) {
        super();

        this.radius = radius;
        this.threeGeometry = new THREE.SphereGeometry(radius, segments * 2, segments);
        this.threeGeometry.rotateX(Math.PI / 2);
    }

    getThreeGeometry() {
        return this.threeGeometry;
    }
}

class VisualShapeModel extends VisualShapeAbstract
{
    constructor(modelFile) {
        super();
        
        this.modelFile = modelFile;
    }

    getThreeGeometry() {
        // @todo implement
    }
}
