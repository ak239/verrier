const RF_BASE = App.getReferenceFrame(RF_TYPE_ECLIPTIC, SOLAR_SYSTEM_BARYCENTER);

const BODIES = {};

const STARDATA = [
    [0, 0, 100],
    [45, 80, 50],
    [90, 90 , 100]
];

const TLEDATA = {
    "10001":{
        name: 'ISS',
        lines: [
            '1 25544U 98067A   17119.54718229  .00016717  00000-0  10270-3 0  9015',
            '2 25544  51.6378 280.7424 0005784 109.0002 251.1778 15.53903632 14187'
        ],
        color: 'springgreen'
    },
    "10002":{
        name: 'Hubble Space Telescope',
        lines: [
            '1 20580U 90037B   16345.19836807  .00000608  00000-0  26678-4 0  9992',
            '2 20580  28.4685 176.1733 0002613 302.2358  16.6063 15.08617271261710'
        ],
        color: 'gold'
    }
};
