class TLE
{
    constructor(lines) {
        this.lineOne = lines[0];
        this.lineTwo = lines[1];
    }

    getInc() {
        return deg2rad(parseFloat(this.lineTwo.substr(8, 8)));
    }

    getRaan() {
        return deg2rad(parseFloat(this.lineTwo.substr(17, 8)));
    }

    getE() {
        return parseFloat('0.' + this.lineTwo.substr(26, 8));
    }

    getAop() {
        return deg2rad(parseFloat(this.lineTwo.substr(34, 8)));
    }

    getMeanAnomaly() {
        return deg2rad(parseFloat(this.lineTwo.substr(43, 8)));
    }

    getMeanMotion() {
        return parseFloat(this.lineTwo.substr(52, 11)) / 86400; //day^(-1)/86400 (s/day)=s^(-1)
    }

    getSma() {
        //sma^3 = mu[earth] / (2PI * Frequency)^2
        return Math.cbrt(BODIES[EARTH].physicalModel.mu / Math.pow(2 * Math.PI * (this.getMeanMotion()), 2));
    }

    getEpoch() {
        const years = parseInt(this.lineOne.substr(18, 2));
        const days = parseFloat(this.lineTwo.substr(20, 12));

        return years * 31558152.27185062 + days * 86400;
    }
}