import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./camera-panel.css";
import Panel from "../../../../../common/panel";

const CameraPanel = () => {
    return (
        <Panel
            id="cameraPanel"
            className="camera-panel"
            caption="Camera"
            titleIcon={<FontAwesomeIcon className="camera-panel__icon" icon="expand" />}
        >
            <div className="camera-panel__content">
                <label className="panel__field camera-panel__field">
                    Target: <select className="camera-panel__field-control" id="targetSelect" />
                </label>
                <label className="panel__field camera-panel__field">
                    Frame type: <select className="camera-panel__field-control" id="rfTypeSelect" />
                </label>
            </div>
        </Panel>
    );
};

CameraPanel.propTypes = {
    className: PropTypes.string,
};

export default CameraPanel;