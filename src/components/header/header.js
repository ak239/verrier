import React from "react";
import cn from "classnames";

import "./header.css";
import Logo from "./components/logo";
import StarSystemSelector from "./components/star-system-selector/star-system-selector";
import MainMenu from "./components/main-menu/main-menu";

const Header = ({ className }) => (
    <header className={cn(className, "header", "noselect")}>
        <div className="header__logo-wrapper">
            <Logo className="header__logo" />
        </div>
        <div className="header__top-menu">
            <MainMenu />
        </div>
        <div className="header__star-system-selector">
            <StarSystemSelector />
        </div>
    </header>
);

export default Header;
