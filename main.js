function init() {
    let objectsForTracking = {
        'Solar System barycenter': SOLAR_SYSTEM_BARYCENTER
    };

    scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xFFEFD5, 0.15));

    axisHelper = new THREE.AxisHelper(100000000);
    scene.add(axisHelper);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    rendererEvents = new EventHandler(renderer.domElement);

    camera = new Camera(renderer.domElement, rendererEvents, EARTH, new Vector([30000, 30000, 10000]));

    document.getElementById('viewport').appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);

    textureLoader = new THREE.TextureLoader();

    raycaster = new VisualRaycaster(camera.threeCamera, 7);

    selection = new SelectionHandler(raycaster);

    for (const objId in SSDATA) {
        objectsForTracking[SSDATA[objId].name] = objId;
    }

    settings = new Settings({
        timeLinePos:        TimeLine.getEpochByDate(new Date()),
        timeScale:          0.001,
        isTimeRunning:      true,
        trackingObject:     EARTH,
        objectsForTracking: objectsForTracking,
    });

    time = new TimeLine(settings);

    ui = new UI(5, objectsForTracking);

    statistics = new Stats();
    document.body.appendChild(statistics.dom);
    statistics.dom.style.display = "none";

    document.addEventListener('vr_select', function() {
        event.detail.trajectory.keplerianEditor = new KeplerianEditor(event.detail.trajectory, false)
    });

    document.addEventListener('vr_deselect', function() {
        event.detail.trajectory.keplerianEditor.remove();
    });
}

function initBuiltIn() {
    ObjectLoader.loadFromCnfig(SSDATA);

    stars = new VisualStarsModel(STARDATA);

    for (const id in TLEDATA) {
        const tle = new TLE(TLEDATA[id].lines);
        const objId = parseInt(id);

        App.setTrajectory(objId, new TrajectoryKeplerianPrecessing(
            App.getReferenceFrame(RF_TYPE_ECI),
            new KeplerianObject(
                tle.getE(),
                tle.getSma(),
                tle.getAop(),
                tle.getInc(),
                tle.getRaan(),
                tle.getMeanAnomaly(),
                tle.getEpoch(),
                BODIES[EARTH].physicalModel.mu,
                false
            ),
            BODIES[EARTH].physicalModel.radius,
            0.00108263,
            TLEDATA[id].color ? TLEDATA[id].color : 'azure'
        ));
    }
}

function firstRender(curTime) {
    globalTime = curTime;
    camera.init(time.epoch);
    requestAnimationFrame(render);
}

function render(curTime) {
    let lastTrajectory;

    time.tick(curTime - globalTime);
    globalTime = curTime;

    camera.update(time.epoch);

    for (const bodyIdx in BODIES) {
        BODIES[bodyIdx].render(time.epoch);
    }

    if (lastTrajectory = App.getTrajectory(lastTrajectoryId)) {
        lastTrajectory.epoch = time.epoch;
    }

    document.dispatchEvent(new CustomEvent(
        'vr_render',
        {detail: {epoch: time.epoch}}
    ));

    axisHelper.position.fromArray(camera.lastPosition.mul(-1));

    renderer.render(scene, camera.threeCamera);
    statistics.update();
    requestAnimationFrame(render);
}

function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.onResize();
}

var camera, scene, renderer, axisHelper, raycaster;
var settings, time, globalTime;
var textureLoader;
var lastTrajectoryId = -1;
var stars;
var trajArray = [];
var selection;
var statistics;
var rendererEvents;
var ui;

$(() => {
    init();
    initBuiltIn();
    requestAnimationFrame(firstRender);
});
