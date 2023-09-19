module.exports = class UserSimpleStatsDto {

    freethrows;
    threePointers;
    twoPointers;

    constructor(model) {

        if(!model) {

            model = {};

            model.freethrows = 0;
            model.threePointers = 0;
            model.twoPointers = 0;
        }

        this.freethrows = model.freethrows;
        this.threePointers = model.threePointers;
        this.twoPointers = model.twoPointers;
        
    }
}