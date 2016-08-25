var Beam = {
    length: undefined,
    modulus: undefined,
    listForces: [],
    listSupports: [],
    listMoments: [],
    listMomGraph: [],
    addForce: function (force) {
        this.listForces.push(force);
    },
    addSupport: function (support) {
        this.listSupports.push(support);
    },
    addMoment: function (moment) {
        this.listMoments.push(moment);
    },
    addMomGraph: function (func) {
        this.listMomGraph.push(func);
    },
    forceSupportLeft: function () {
        ForceL = 0;
        distBetSupports = Math.abs(Beam.listSupports[0].location - Beam.listSupports[1].location);
        for (var i = 0; i < Beam.listForces.length; i++) {

            if (Beam.listForces[i].location() < Beam.listSupports[1].location) {
                ForceL = ForceL + (Beam.listForces[i].magnitude() * Math.abs(Beam.listSupports[1].location - Beam.listForces[i].location()) / distBetSupports);
            } else if (Beam.listForces[i].location() > Beam.listSupports[1].location) {
                ForceL = ForceL - Beam.listForces[i].magnitude() * Math.abs(Beam.listSupports[1].location - Beam.listForces[i].location()) / distBetSupports;
            } else {
                ForceL = ForceL + 0;
            }

        }
        ;

        for (var i = 0; i < Beam.listMoments.length; i++) {
            ForceL = ForceL + Beam.listMoments[i].Magnitude / distBetSupports;
        }
        return -ForceL;
    },
    forceSupportRight: function () {
        ForceR = 0;
        distBetSupports = Math.abs(Beam.listSupports[0].location - Beam.listSupports[1].location);

        for (var i = 0; i < Beam.listForces.length; i++) {

            if (Beam.listForces[i].location() < Beam.listSupports[0].location) {
                ForceR = ForceR + Beam.listForces[i].magnitude() * Math.abs(Beam.listSupports[0].location - Beam.listForces[i].location()) / distBetSupports;
            } else if (Beam.listForces[i].location() > Beam.listSupports[0].location) {
                ForceR = ForceR - Beam.listForces[i].magnitude() * Math.abs(Beam.listSupports[0].location - Beam.listForces[i].location()) / distBetSupports;
            } else {
                ForceR = ForceR + 0;
            }
        }
        ;
        for (var i = 0; i < Beam.listMoments.length; i++) {
            ForceR = ForceR + Beam.listMoments[i].Magnitude / distBetSupports;
        }
        return ForceR;
    }
};

var Moment = {
    Magnitude: undefined,
    StartLocation: undefined,
    momentfunction: function (x)
    {

        return this.Magnitude;

    }
};

var PointForce = {
    absmagnitude: undefined,
    StartLocation: undefined,
    angle: undefined,
    EndLocation: -50,
    magnitude: function () {
        if (this.angle < 90) {
            return this.absmagnitude * Math.sin(Math.PI * this.angle / 180);
        } else if (this.angle > 90) {
            return this.absmagnitude * Math.sin(Math.PI * (180 - this.angle) / 180);
        } else {
            return Number(this.absmagnitude);
        }
    },
    location: function () {
        return this.StartLocation;
    },
    shearfunction: function (x)
    {

        return this.magnitude();

    },
    momentfunction: function (x)
    {

        return this.magnitude() * (x - this.StartLocation);

    }
};




var FunctionForce = {
    slope: undefined,
    
    StartLocation: undefined,
    EndLocation: undefined,
    
    magnitude: function () {
   
            return 0;
       
    },
            
    location: function () {
        return this.StartLocation;
    },
    shearfunction: function (x)
    {
        return (this.slope/ 2 * (x - this.StartLocation) * (x - this.StartLocation));
    },
    momentfunction: function (x)
    {
        return (this.slope)/ 6 * (x - this.StartLocation) * (x - this.StartLocation) * (x - this.StartLocation);
        
    }
};

var Support = {
    location: undefined
};


var DistributedForce = {
    StartMagnitude: undefined,
    EndMagnitude: undefined,
    StartLocation: undefined,
    EndLocation: undefined,
    length: function () {
        return this.EndLocation - this.StartLocation;
    },
    magnitude: function ()
    {
        if (this.EndMagnitude === this.StartMagnitude) //this is when it is rectangular
        {
            return this.length() * this.EndMagnitude;
        } else if (this.EndMagnitude === 0)
        {
            return this.length() * this.StartMagnitude * 0.5;
        } else if (this.StartMagnitude === 0)
        {
            return this.length() * this.EndMagnitude * 0.5;
        } else
        {
            return 0.5 * this.length() * (this.StartMagnitude + this.EndMagnitude);
        }
    },
    location: function ()
    {
        if (this.EndMagnitude === this.StartMagnitude) // rectangular distributed location
        {
            return this.length() / 2 + Number(this.StartLocation);
        } else if (this.EndMagnitude === 0)
        {
            return this.length() / 3 + this.StartLocation;
        } else if (this.StartMagnitude === 0)
        {
            return this.length() * 2 / 3 + this.StartLocation;
        } else
        {
            if (this.StartMagnitude > this.EndMagnitude)
            {
                a = ((this.length() * Math.min(this.StartMagnitude, this.EndMagnitude) *
                        this.length() * 0.5 + 0.5 * this.length() *
                        Math.abs(this.EndMagnitude - this.StartMagnitude) * this.length() * (1 / 3)) /
                        Math.abs(this.magnitude())) + this.StartLocation;

            } else if (this.EndMagnitude > this.StartMagnitude)
            {
                a = ((this.length() * Math.min(this.StartMagnitude, this.EndMagnitude) *
                        this.length() * 0.5 + 0.5 * this.length() *
                        Math.abs(this.EndMagnitude - this.StartMagnitude) * this.length() * (2 / 3)) /
                        Math.abs(this.magnitude())) + this.StartLocation;
            }
            return a;
        }
    },
    shearfunction: function (x)
    {
        if (this.StartMagnitude === this.EndMagnitude) // rectangular dist force
        {
            return this.StartMagnitude * (x - this.StartLocation);
        } else if (this.StartMagnitude === 0) // triangular dist f
        {

            return (this.EndMagnitude / this.length()) / 2 * (x - this.StartLocation) * (x - this.StartLocation);
        } else if (this.EndMagnitude === 0) {// triangular dist force
        
         
            return ((this.StartMagnitude / this.length()) / 2 * (x - this.StartLocation) * (x - this.StartLocation));}
        
             
    },
    momentfunction: function (x)
    {
        if (this.StartMagnitude === this.EndMagnitude) // moment rectangular dist for e
        {

            return this.StartMagnitude * (x - this.StartLocation) * (x - this.StartLocation) / 2;
        } else if (this.StartMagnitude === 0)
        {

            return (this.EndMagnitude / this.length()) / 6 * (x - this.StartLocation) * (x - this.StartLocation) * (x - this.StartLocation);
        } else if (this.EndMagnitude === 0)
        {

            return (this.StartMagnitude / this.length()) / 6 * (x - this.StartLocation) * (x - this.StartLocation) * (x - this.StartLocation);
        }
    }

};
