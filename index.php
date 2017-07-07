<?php
require 'functions.php';

$scripts = array_merge(
    getDirScripts('vendor'),
    reorderScripts(array_merge(
        getDirScripts('core'),
        getDirScripts('visual'),
        getDirScripts('interface'),
        getDirScripts('ui')
    )),
    ['algebra.js', 'const.js', 'ssdata.js']
);
$scripts = array_map('addTime', $scripts);
?>
<!DOCTYPE html>
<html>
<head>
    <script src="http://code.jquery.com/jquery-3.2.1.min.js"></script>
    <script src="https://threejs.org/build/three.min.js"></script>

    <?php foreach ($scripts as $script) { ?>
        <script src="<?= $script ?>"></script>
    <?php } ?>

    <style type="text/css">
        html {
            width: 100%;
            height: 100%;
        }

        body {
            width: 100%;
            height: 100%;
            margin: 0;
            overflow: hidden;
        }

        canvas {
            width: 100%;
            height: 100%;
        }

        #leftPanel {
            position: absolute;
            left: 0;
            top: 0;
            margin-right: auto;
            margin-bottom: auto;
            background-color: black;
            opacity: 1;
            font: 13px/1.231 "Lucida Grande", Lucida, Verdana, sans-serif;
        }

        #bottomPanel {
            position: absolute;
            bottom: 0;
            left: 5%;
            margin-left: auto;
            margin-right: auto;
            width: 90%;
            /*height: 35px;*/
            /*background-color: black;*/
            opacity: 1;
            font: 13px/1.231 "Lucida Grande", Lucida, Verdana, sans-serif;
        }

        #timeLineCanvas {
            height: 35px;
        }

        /*#bottomPanel .property-name {*/
        /*width: 4%;*/
        /*}*/

        /*#bottomPanel .c {*/
        /*width: 96%;*/
        /*}*/

        /*#bottomPanel .slider {*/
        /*width: 92%;*/
        /*}*/

        /*#bottomPanel input {*/
        /*width: 7%;*/
        /*}*/

        .menuBlock {
            display: inline-block;
        }

        .menuBlock, #metricsPanel {
            border: 1px solid black;
            background-color: white;
        }

        button {
            float: right;
        }

        #metricsPanel {
            position: absolute;
            top: 0;
            right: 0;
        }

        #timeBoxHeader {
            width: 300px;
        }

        #cameraBoxHeader {
            width: 235px;
        }

        .metrics {
            width: 100%;
        }

        .toggleButton {
            width: 49px;
        }

        #pauseButton {
            width: 65px;
        }
    </style>
</head>

<body>
<script type="text/javascript" src="<?= addTime('builtin.js') ?>"></script>
<script type="text/javascript" src="<?= addTime('main.js') ?>"></script>

<div id="leftPanel"></div>
<div id="viewport"></div>
<div id="metricsPanel">
    <table id="metricsHeader" style="width: 300px">
        <tr>
            <td>
                Metrics
                <?= generateToggleButton('metrics') ?>
            </td>
        </tr>
    </table>

    <table class="metrics">
        <tr>
            <td style="width: 80px"><b>of</b></td>
            <td id="metricsOf">Cassini</td>
        </tr>

        <tr>
            <td><b>relative to</b></td>
            <td id="relativeTo">Sun</td>
        </tr>
    </table>

    <table class="metrics">
        <tr>
            <td colspan="3">
                Keplerian
            </td>
        </tr>

        <?php foreach ([
                           ['Ecc', ''],
                           ['SMA', 'Mkm'],
                           ['Inc', 'deg.'],
                           ['AoP', 'deg.'],
                           ['RAAN', 'deg.'],
                           ['TA', 'deg.'],
                       ] as $param) { ?>
            <tr>
                <td style="width: 60px"><?= $param[0] ?></td>
                <td id="<?= strtolower($param[0]) ?>Value" align="right"></td>
                <td style="width: 60px"><?= $param[1] ?></td>
            </tr>
        <?php } ?>
    </table>

    <table class="metrics">
        <tr>
            <td colspan="6">Cartesian</td>
        </tr>

        <?php foreach ([
                           ['Position', 'km'],
                           ['Velocity', 'km/s']
                       ] as $type) { ?>
            <tr>
                <td style="width: 65px"><?= $type[0] ?></td>
                <td id="<?= strtolower($type[0]) ?>Mag" align="right"></td>
                <td style="width: 60px"><?= $type[1] ?></td>
                <td style="width: 49px">
                    <?= generateToggleButton(strtolower($type[0]) . "Coordinate") ?>
                </td>
            </tr>

            <?php foreach (['x', 'y', 'z'] as $coord) { ?>
                <tr class="<?= strtolower($type[0]) ?>Coordinate trajectoryParameter">
                    <td><?= $coord ?></td>
                    <td id="<?= strtolower($type[0]) . strtoupper($coord) ?>" align="right"></td>
                    <td><?= $type[1] ?></td>
                    <td></td>
                </tr>
            <?php } ?>
        <?php } ?>
    </table>
</div>
<div id="bottomPanel">
    <div class="menuBlock">
        <table id="timeBoxHeader">
            <tr>
                <td align="center">
                    Time
                    <?= generateToggleButton('timeBox') ?>
                </td>
            </tr>
        </table>

        <table class="timeBox" style="width: 100%">

            <tr>
                <td style="width: 65px"><b>Current:</b></td>

                <td id="currentDateValue">01.01.2000 12:00:00</td>

                <td style="width: 70px">
                    <button onclick="time.useCurrentTime()">Now</button>
                </td>
            </tr>

            <tr>
                <td><b>Rate:</b></td>
                <td id="timeScaleValue"></td>
                <td>
                    <button onclick="time.useRealTimeScale()">Real</button>
                </td>
            </tr>

            <tr>
                <td colspan="2">
                    <input id="timeScaleSlider" type="range" min="-1" max="1" step="0.001" value="0.001"
                           style="width: 100%">
                </td>

                <td>
                    <button id="pauseButton">Pause</button>
                </td>
            </tr>
        </table>
    </div>

    <div class="menuBlock">
        <table id="cameraBoxHeader">
            <tr>
                <td align="center">
                    Camera
                    <?= generateToggleButton('cameraBox') ?>
                </td>
            </tr>
        </table>

        <table class="cameraBox">
            <tr>
                <td><b>Target:</b></td>
                <td colspan="2">
                    <select id="targetSelect">
                    </select>
                </td>
            </tr>

            <!--<tr>
                <td><b>Mode:</b></td>
                <td>
                    <input id="inputModeOrbit" type="radio" name="inputMode">
                    <label for="inputModeOrbit" style="vertical-align: top;">Orbit</label>
                    <input id="inputModeFree" type="radio" name="inputMode">
                    <label for="inputModeFree" style="vertical-align: top;">Free</label>
                </td>
                <td>
                    <input type="number" value="60.0" step="0.1" min="0.0" max="360.0">
                </td>
            </tr>-->

            <!--<tr>
                <td><b>Zoom:</b></td>
                <td colspan="2">
                    <input id="zoomSlider" type="range" style="width: 100%">
                </td>
            </tr>-->
        </table>
    </div>

    <canvas id="timeLineCanvas"></canvas>
</div>
</body>
</html>
