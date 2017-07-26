const _ = require('lodash');
const https = require('https');
const util = require('util');
const cheerio = require('cheerio');
const Promise = require('bluebird');

//TODO perform a store location search and use the results
const locations = {
    manchester: {
        'Cross Street': 'https://eat.co.uk/store-locations/cross-street',
        'St Anns Street': 'https://eat.co.uk/store-locations/st-anns-street',
        'Arndale': 'https://eat.co.uk/store-locations/arndale',
        'Trafford Centre': 'https://eat.co.uk/store-locations/trafford-centre'
    }
};

const get = (url, callback) => {
    const request = https.get(url, response => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => callback(null, cheerio.load(data)));
    });

    request.on('error', callback);
};

const hasLaksa = dom => dom('a[href*="chicken-laksa"]').length > 0;

module.exports.checkCity = (city) => {
    const key = city.toLowerCase();
    if (!_.has(locations, key)) {
        return Promise.resolve([]);
    }

    let laksaToday = false;
    return Promise.map(Object.keys(locations[key]), (place) => {
        return Promise.fromNode(function (cb) {
            get(locations[key][place], cb);
        }).then(dom => {
            const l = hasLaksa(dom);
            laksaToday = laksaToday | l;
            return {place, hasLaksa: l};
        });
    }).then(results => {
        return Promise.resolve(results);
    });
};
