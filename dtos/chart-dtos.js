const ShootingSpotsConstants = require ('../helpers/shooting-spots-constants');
const {convertISODateToDDMMYYYY} = require('../helpers/dates')

module.exports = class ChartDTOs {

    static toShotsDispersionDTO(data, isSpotToCategory = false) {

        const result = {};
    
        data.forEach(userSpotResult => {
            
            const shooterId = userSpotResult['shooter_id'];
    
            if(!(shooterId in result)) {
    
                result[shooterId] = {};
            }
    
            let spotKey = userSpotResult['spot_key'];
    
            if(isSpotToCategory) {
    
                spotKey = ShootingSpotsConstants.getSpotCategory(spotKey);
            }
    
            if(spotKey in result[shooterId]) {
    
                result[shooterId][spotKey] += parseInt(userSpotResult['sum']);
            }
            else {
    
                result[shooterId][spotKey] = parseInt(userSpotResult['sum']);
            }
    
        });
    
        return result;
    }
    
    static toShotsNotGroupedBySpotDTO(data) {
    
        const result = {};
    
        data.forEach((item) => {
    
            const shooterId = item['shooter_id'];
    
            if(!(shooterId in result)) {
    
                result[shooterId] = {};
            }
    
            const date = new Date(item['truncated_date']).getTime()
    
            if(!(date in result[shooterId])) {
    
                const tries = parseInt(item['sum_tries'])
                const makes = parseInt(item['sum_makes'])
                const percent = Math.round(makes * 100 / tries)
    
                result[shooterId][date] = {
                    tries,
                    makes,
                    percent,
                };
            }
        });
    
        return result
    }
    
    static toShotsGroupedBySpotDTO(data, isSpotToCategory = false) {

        const result = {};
    
        data.forEach((item) => {
    
            const shooterId = item['shooter_id'];
    
            if(!(shooterId in result)) {
    
                result[shooterId] = {};
            }
    
            const spotKey = item['spot_key'];

            if(isSpotToCategory) {
    
                spotKey = ShootingSpotsConstants.getSpotCategory(spotKey);
            }
    
            if(!(spotKey in result[shooterId])) {
    
                result[shooterId][spotKey] = {};
            }
    
            const date = new Date(item['truncated_date']).getTime()

            const tries = parseInt(item['sum_tries'])
            const makes = parseInt(item['sum_makes'])
            const percent = Math.round(makes * 100 / tries)
            
            if(date in result[shooterId][spotKey]) {

                result[shooterId][spotKey][date] = {
                    tries: result[shooterId][spotKey][date] + tries,
                    makes: result[shooterId][spotKey][date] + makes,
                    percent: result[shooterId][spotKey][date] + percent,
                };
            }
            else {
    
                result[shooterId][spotKey][date] = {
                    tries,
                    makes,
                    percent,
                };
            }
        });
    
        return result
    }
}
