function getElementsByPositionAndVelocity(pos,vel,mu) //mu = mu of parent body
{
    var angMomentum = pos.mulCrossByVector(vel);
    
	var raan = Math.atan2(angMomentum.x, -angMomentum.y); //raan
    var inc = Math.atan2((Math.sqrt(Math.pow(angMomentum.x, 2) + Math.pow(angMomentum.y, 2))) , angMomentum.z); //inclination
    
	var sma = (mu * pos.mag) / (2.0 * mu - pos.mag * Math.pow(vel.mag, 2)); //semimajor axis
    var e = Math.sqrt(1.0 - (Math.pow(angMomentum.mag, 2) / (mu * sma))); //eccentricity
    
    var p = pos.rotateZ(-raan).rotateX(-inc);
	console.log(p);
    var u = Math.atan2(p.y , p.x);
	
	if (p.x < 0) {
		u += Math.PI;
	}
    var radVel = pos.mulDotByVector(vel) / pos.mag;
    var cosE = (sma - pos.mag) / (sma * e);
    var sinE = (pos.mag * radVel) / (e * Math.sqrt(mu * sma));
    var E = Math.acos (cosE);
    var ta = Math.atan2((Math.sqrt(1.0 - e * e) * sinE) , (cosE - e));
    
	E = (sinE < 0) ? E : (2 * Math.PI - E);
	ta = (ta > 0) ? ta : (ta + 2 * Math.PI);
	
    var aop = u - ta; //argument of periapsis
	var m0 = 2 * Math.PI - (E - e * sinE); //mean anomaly
	
	console.log(m0);
    
    return {
        _sma: sma,
		_e: e,
		_inc: rad2deg(inc),
		_raan: rad2deg(raan),
		_aop: rad2deg(aop),
		_m0: rad2deg(m0)
    }
}