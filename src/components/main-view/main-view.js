import React from "react";
import cn from "classnames";

import "./main-view.scss";
import BottomPanel from "./components/bottom-panel";
import CreationPanel from "./components/creation-panel";
import TransferCalculationPanel from "./components/transfer-calculation-panel";
import MetricsPanel from "./components/metrics-panel/index";
import SatelliteSearchPanel from "./components/satellite-search-panel";
import SideBar from "../common/side-bar";
import ManeuverPanel from "./components/maneuver-panel/index";

const MainView = ({ className, children }) => {
    return (
        <main className={cn(className, "main-view")}>
            <div id="viewport-id" />
            {children}
            <SideBar className="main-view__left-side-bar">
                <CreationPanel className="main-view__creation-panel" />
                <ManeuverPanel className="main-view__maneuver-panel" />
                <TransferCalculationPanel className="main-view__transfer-calculation-panel" />
            </SideBar>
            <SideBar className="main-view__right-side-bar" right>
                <MetricsPanel />
            </SideBar>
            <SatelliteSearchPanel className="main-view__satellite-search-panel" />
            <BottomPanel className="main-view__bottom-panel" />
        </main>
    );
};

export default MainView;
