import React from "react";
import PropTypes from "prop-types";

import { Consumer } from "../../../../store";
import Select, { optionPropTypes } from "../../../common/select/select";
import "./star-system-selector.css";

function StarSystemSelector({ options, defaultValue, onSelect }) {
    return (
        <div className="star-system-selector">
            <div className="star-system-selector__label">Star system</div>
            <Select
                className="star-system-selector__selector"
                options={options}
                value={defaultValue || options[0]}
                onSelect={onSelect}
            />
        </div>
    );
}

StarSystemSelector.propTypes = {
    options: PropTypes.arrayOf(optionPropTypes).isRequired,
    defaultValue: optionPropTypes,
    onSelect: PropTypes.func,
};

export default () => (
    <Consumer>
        {({ store }) => {
            const { options, defaultValue, onSelect } = store.starSystemSelectorSettings;

            return <StarSystemSelector options={options} defaultValue={defaultValue} onSelect={onSelect} />;
        }}
    </Consumer>
);
