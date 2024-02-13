module.exports = class ShootingSpotsConstants {

    static shootingSpotsTypes = {
        'threes': ['th1','th2','th3','th4','th4','th5','th6','th7'],
        'freethrows': ['fr1'],
        'midRange': ['mi1','mi2','mi3','mi4','mi5','mi6','mi7','mi8','mi9'],
        'shortMidRange': ['shm1','shm2','shm3','shm4'],
        'shortRange': ['sh1','sh2','sh3','sh4'],
    }

    static getShootingSpotsTypes = () => {return structuredClone(this.shootingSpotsTypes)}

    static getSpotCategory(spotKey) {

        const result = Object.entries(this.shootingSpotsTypes).find((item) => {
    
            return item[1].includes(spotKey);
        })
    
        if(!result) {
    
            return spotKey; 
        }
    
        return result[0];
    }
    
    static translateSpotCategoryToSimpleStatCategory(spotCategory) {

        switch (spotCategory) {
            case 'threes':
                return 'threePointers';
            case 'freethrows':
                return 'freethrows';
            case 'midRange':
            case 'shortMidRange':
            case 'shortRange':
                return 'twoPointers'
        
            default:
                throw new Error('Wrong spot category')
        }
    }
}