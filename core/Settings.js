class Settings
{
    constructor(initial) {
        this.guiMain = new dat.GUI({width: 350});
        this.guiTimeLine = new dat.GUI({
            autoPlace: false,
            width: window.innerWidth * 0.9
        });

        document.getElementById('bottomPanel').appendChild(this.guiTimeLine.domElement);
        this.timeLine = initial.timeLinePos;
        this.timeScale = initial.timeScale;
        this.isTimeRunning = initial.isTimeRunning;
        this.trackingObject = initial.trackingObject;
        this.currentDate = '';

        this.timeLineController = this.guiTimeLine.add(this, 'timeLine', initial.timeLineStart, initial.timeLineEnd);
        this.guiMain.add(this, 'timeScale', -2000, 2000);
        this.guiMain.add(this, 'currentDate').listen();
        this.guiMain.add(this, 'isTimeRunning');
        this.guiMain.add(this, 'trackingObject', initial.objectsForTracking).onChange(function(value) {
            camera.setOrbitingPoint(value);
        });

        const trajectoryMenu = {
            velocity: {
                folder: null,
                x   : null,
                y   : null,
                z   : null,
                mag : null,

                values: {
                    x   : "",
                    y   : "",
                    z   : "",
                    mag : ""
                }
            },

            position: {
                folder: null,
                x   : null,
                y   : null,
                z   : null,
                mag : null,

                values: {
                    x   : "",
                    y   : "",
                    z   : "",
                    mag : ""
                }
            }
        };

        for (let group of ['velocity', 'position']) {
            trajectoryMenu[group].folder = this.guiMain.addFolder(group);
            for (let id of ['x', 'y', 'z', 'mag']) {
                trajectoryMenu[group][id] = trajectoryMenu[group].folder.add(trajectoryMenu[group].values, id);
            }
        }

        this.currentTrajectoryMenu = trajectoryMenu;

        this.timeLineController.onChange(function(value) {
            time.forceEpoch(value);
        });

        this.guiAddTrajectory = new dat.GUI({
            autoPlace: false,
            width: 350
        });

        const that = this;
        this.baseTrajectorySettings = {
            sma  : 120000000,
            e    : 0,
            inc  : 0,
            raan : 0,
            aop  : 0,
            ta   : 0,
        };

        this.guiAddTrajectoryElements = {
            sma: null, e: null, inc: null, raan: null, aop: null, ta: null,
            settingsFolder: null, addTrajectoryFolder: null
        };

        this.trajectorySettings = {
            sma  : this.baseTrajectorySettings.sma  + 1e-2,
            e    : this.baseTrajectorySettings.e    + 1e-2,
            inc  : this.baseTrajectorySettings.inc  + 1e-2,
            raan : this.baseTrajectorySettings.raan + 1e-2,
            aop  : this.baseTrajectorySettings.aop  + 1e-2,
            ta   : this.baseTrajectorySettings.ta   + 1e-2,

            addTrajectory: function() {
                that.guiAddTrajectoryElements.sma  .setValue(that.baseTrajectorySettings.sma);
                that.guiAddTrajectoryElements.e    .setValue(that.baseTrajectorySettings.e  );

                that.guiAddTrajectoryElements.inc  .setValue(deg2rad(that.baseTrajectorySettings.inc ));
                that.guiAddTrajectoryElements.raan .setValue(deg2rad(that.baseTrajectorySettings.raan));
                that.guiAddTrajectoryElements.aop  .setValue(deg2rad(that.baseTrajectorySettings.aop ));
                that.guiAddTrajectoryElements.ta   .setValue(deg2rad(that.baseTrajectorySettings.ta  ));

                if (!TRAJECTORIES[lastTrajectoryId]) {
                    TRAJECTORIES[lastTrajectoryId] = new TrajectoryKeplerianOrbit(
                        App.getReferenceFrame(that.trackingObject, RF_TYPE_ECLIPTIC),
                        new KeplerianObject(
                            that.trajectorySettings.e,
                            that.trajectorySettings.sma,
                            deg2rad(that.trajectorySettings.aop ),
                            deg2rad(that.trajectorySettings.inc ),
                            deg2rad(that.trajectorySettings.raan),
                            deg2rad(that.trajectorySettings.ta  ),
                            time.epoch,
                            BODIES[that.trackingObject]
                                ? BODIES[that.trackingObject].physicalModel.mu
                                : 0,
                            true
                        ),
                        '#00ff00'
                    );
                }

                that.guiAddTrajectoryElements.addTrajectoryFolder.close();
                that.guiAddTrajectoryElements.settingsFolder.open();
            },

            saveTrajectory: function() {
                while (TRAJECTORIES[lastTrajectoryId]) {
                    --lastTrajectoryId;
                }

                that.guiAddTrajectoryElements.addTrajectoryFolder.open();
                that.guiAddTrajectoryElements.settingsFolder.close();
            },

            dropLastTrajectory: function() {
                while (!TRAJECTORIES[lastTrajectoryId]
                && (lastTrajectoryId !== -1)
                    ) {
                    ++lastTrajectoryId;
                }

                if (TRAJECTORIES[lastTrajectoryId]) {
                    TRAJECTORIES[lastTrajectoryId].drop();
                    delete TRAJECTORIES[lastTrajectoryId];
                }

                that.guiAddTrajectoryElements.addTrajectoryFolder.open();
                that.guiAddTrajectoryElements.settingsFolder.close();
            }
        };

        this.guiAddTrajectoryElements.settingsFolder = this.guiAddTrajectory.addFolder("trajectory settings");

        this.guiAddTrajectoryElements.sma = this.guiAddTrajectoryElements.settingsFolder.add(
            this.trajectorySettings, 'sma', 1500000, 8000000000
        ).onChange(function(value) {
            const trajectory = TRAJECTORIES[lastTrajectoryId];
            if (trajectory) {
                trajectory.sma = value;
            }
        });

        this.guiAddTrajectoryElements.e = this.guiAddTrajectoryElements.settingsFolder.add(
            this.trajectorySettings, 'e', 0, 1
        ).onChange(function(value) {
            const trajectory = TRAJECTORIES[lastTrajectoryId];
            if (trajectory) {
                trajectory.e = value;
            }
        });

        this.guiAddTrajectoryElements.inc = this.guiAddTrajectoryElements.settingsFolder.add(
            this.trajectorySettings, 'inc', 0, 180
        ).onChange(function(value) {
            const trajectory = TRAJECTORIES[lastTrajectoryId];
            if (trajectory) {
                trajectory.inc = deg2rad(value);
            }
        });

        this.guiAddTrajectoryElements.raan = this.guiAddTrajectoryElements.settingsFolder.add(
            this.trajectorySettings, 'raan', 0, 360
        ).onChange(function(value) {
            const trajectory = TRAJECTORIES[lastTrajectoryId];
            if (trajectory) {
                trajectory.raan = deg2rad(value);
            }
        });

        this.guiAddTrajectoryElements.aop = this.guiAddTrajectoryElements.settingsFolder.add(
            this.trajectorySettings, 'aop', 0, 360
        ).onChange(function(value) {
            const trajectory = TRAJECTORIES[lastTrajectoryId];
            if (trajectory) {
                trajectory.aop = deg2rad(value);
            }
        });

        this.guiAddTrajectoryElements.ta = this.guiAddTrajectoryElements.settingsFolder.add(
            this.trajectorySettings, 'ta', 0, 360
        ).onChange(function(value) {
            const trajectory = TRAJECTORIES[lastTrajectoryId];
            if (trajectory) {
                trajectory.ta = deg2rad(value);
            }
        });

        this.guiAddTrajectoryElements.addTrajectoryFolder = this.guiAddTrajectory.addFolder("");

        this.guiAddTrajectoryElements.addTrajectoryFolder.add(this.trajectorySettings, 'addTrajectory');
        this.guiAddTrajectoryElements.settingsFolder.add(this.trajectorySettings, 'saveTrajectory');
        this.guiAddTrajectoryElements.addTrajectoryFolder.open();

        this.guiAddTrajectory.add(this.trajectorySettings, 'dropLastTrajectory');
        document.getElementById('leftPanel').appendChild(this.guiAddTrajectory.domElement);
    }
}