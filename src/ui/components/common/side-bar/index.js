import React from "react";
import cn from "classnames";
import "./index.scss";

const SideBar = ({ className, right, children }) => {
    return <aside className={cn(className, "side-bar")}>{children}</aside>;
};

export default SideBar;
