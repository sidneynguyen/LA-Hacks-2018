const express = require('express');
const request = require('request');
const app = express();

app.use(express.static('public'));

app.get('/', function(req, res) {
    res.send('<h1>hello</h1>');
});

const activityTimeSpent = {
    food: 15,
    drinks: 15,
    coffee: 15,
    arts: 15,
    outdoors: 15,
    sights: 15
}

app.get('/api', function(req, res) {
    let lat = req.query.lat;
    let long = req.query.long;
    let timeConstraint = req.query.timeConstraint;
    let activity = req.query.activity;
    let location = req.query.location;

    //get activity time
    let timeSpent = activityTimeSpent[activity];

    // calculate radius
    let radius = 1609.34 * 80 * ((timeConstraint - timeSpent)/60);

    let params = {};
    if (location) {
        request({
            url: 'https://api.foursquare.com/v2/venues/search',
            method: 'GET',
            qs: {
                client_id: 'RWQV1M0OD3JH0A3403FCFQ3VIPOXLZMTNWNAZFF2U1VZIRP5',
                client_secret: 'LED1QHL4MIHDH0NL1QXPX3JGA5IEE3X4KOAESBOAQR2PPX53',
                near: location,
                v: '20180323',
            }
        }, function(err, response, body) {
            if (err) {
                return res.send(err);
            }
            lat = JSON.parse(body).response.venues[0].location.lat;
            long = JSON.parse(body).response.venues[0].location.lng;
            params = {
                url: 'https://api.foursquare.com/v2/venues/explore',
                method: 'GET',
                qs: {
                    client_id: 'RWQV1M0OD3JH0A3403FCFQ3VIPOXLZMTNWNAZFF2U1VZIRP5',
                    client_secret: 'LED1QHL4MIHDH0NL1QXPX3JGA5IEE3X4KOAESBOAQR2PPX53',
                    near: location,
                    query: activity,
                    limit: 10,
                    radius: radius,
                    venuePhotos: 1,
                    v: '20180323',
                }
            };
            request(params, function(err, response, body) {
                if (err) {
                    console.error(err);
                    return res.send('oh no');
                } else {
                    console.log(JSON.parse(body).response.groups[0].items);
                    //res.send(body);

                    let places = JSON.parse(body).response.groups[0].items;
                    let origins = '';
                    let destinations = '';
                    for (var i = 0; i < places.length; i++) {
                        if (i > 0) {
                            origins += '|';
                            destinations += '|';
                        }
                        origins += lat + ',' + long;
                        destinations += places[i].venue.location.lat + ',' + places[i].venue.location.lng;
                    }
                    // call google maps
                    request({
                        url: 'https://maps.googleapis.com/maps/api/distancematrix/json',
                        method: 'GET',
                        qs: {
                            origins: origins,
                            destinations: destinations,
                            key: 'AIzaSyAW-l0rP40j6E6aLbZXhmDyPV3_hIhob8E',
                        }
                        }, function(err, response, body) {
                        if (err) {
                            console.error(err);
                            return res.send('oh no');
                        } else {
                            console.log(body);
                            let recommendations = [];
                            for (var i = 0; i < places.length; i++) {
                                recommendations[i] = {
                                    name: places[i].venue.name,
                                    lat: places[i].venue.lat,
                                    long: places[i].venue.lng,
                                    rating: places[i].venue.rating,
                                    photo: places[i].venue.photos.groups[0].items[0].prefix + '500x500' + places[i].venue.photos.groups[0].items[0].suffix,
                                    time: JSON.parse(body).rows[0].elements[i].duration.value,
                                }
                            }
                            // filter result
                            recommendations.filter(rec => rec.time < (timeConstraint - timeSpent));

                            recommendations.sort(function(a, b) {
                                if (a.rating > b.rating) {
                                    return -1;
                                }
                                if (a.rating < b.rating) {
                                    return 1;
                                }
                                if (a.time < b.time) {
                                    return -1;
                                }
                                if (a.time > b.time) {
                                    return 1;
                                }
                                return 0;
                            });

                            // return result
                            return res.send(recommendations);
                        }
                    }); 
                }
            });

        });
    } else {
        params = {
            url: 'https://api.foursquare.com/v2/venues/explore',
            method: 'GET',
            qs: {
                client_id: 'RWQV1M0OD3JH0A3403FCFQ3VIPOXLZMTNWNAZFF2U1VZIRP5',
                client_secret: 'LED1QHL4MIHDH0NL1QXPX3JGA5IEE3X4KOAESBOAQR2PPX53',
                ll: lat + ',' + long,
                query: activity,
                limit: 10,
                radius: radius,
                venuePhotos: 1,
                v: '20180323',
            }
        };
        // call foursquare
        request(params, function(err, response, body) {
            if (err) {
                console.error(err);
                return res.send('oh no');
            } else {
                console.log(JSON.parse(body).response.groups[0].items);
                //res.send(body);

                let places = JSON.parse(body).response.groups[0].items;
                let origins = '';
                let destinations = '';
                for (var i = 0; i < places.length; i++) {
                    if (i > 0) {
                        origins += '|';
                        destinations += '|';
                    }
                    origins += lat + ',' + long;
                    destinations += places[i].venue.location.lat + ',' + places[i].venue.location.lng;
                }
                // call google maps
                request({
                    url: 'https://maps.googleapis.com/maps/api/distancematrix/json',
                    method: 'GET',
                    qs: {
                        origins: origins,
                        destinations: destinations,
                        key: 'AIzaSyAW-l0rP40j6E6aLbZXhmDyPV3_hIhob8E',
                    }
                    }, function(err, response, body) {
                    if (err) {
                        console.error(err);
                        return res.send('oh no');
                    } else {
                        console.log(body);
                        let recommendations = [];
                        for (var i = 0; i < places.length; i++) {
                            recommendations[i] = {
                                name: places[i].venue.name,
                                lat: places[i].venue.lat,
                                long: places[i].venue.lng,
                                rating: places[i].venue.rating,
                                photo: places[i].venue.photos.groups[0].items[0].prefix + '500x500' + places[i].venue.photos.groups[0].items[0].suffix,
                                time: JSON.parse(body).rows[0].elements[i].duration.value,
                            }
                        }
                        // filter result
                        recommendations.filter(rec => rec.time < (timeConstraint - timeSpent));

                        recommendations.sort(function(a, b) {
                            if (a.rating > b.rating) {
                                return -1;
                            }
                            if (a.rating < b.rating) {
                                return 1;
                            }
                            if (a.time < b.time) {
                                return -1;
                            }
                            if (a.time > b.time) {
                                return 1;
                            }
                            return 0;
                        });

                        // return result
                        return res.send(recommendations);
                    }
                }); 
        }
    });
    }

});
// localhost:3000/api?lat=30&...

app.listen(3000, function() {
    console.log('hi');
});
