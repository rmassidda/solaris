class Swipe{
    constructor(x,y){
        //  Initial condition
        this.distance = 0;
        this.time = new Date().getTime();
        this.startX = x;
        this.startY = y;
    }

    checkSwipe(x,y,minDistance = 100, maxDistance = 500, timeLimit = 500){
        //  Difference of current and initial condition
        var elapsedTime = new Date().getTime() - this.time;
        var distanceX = this.startX - x;
        var distanceY = this.startY - y;
        //  Assumption that a swipe didn't happened
        var swipeDirection = null;
        //  Log
        console.log(elapsedTime)
        console.log(distanceX);
        console.log(distanceY);
        //  Check if a swipe happened
        if(elapsedTime<=timeLimit){
            if(Math.abs(distanceX) >= minDistance && Math.abs(distanceY) <= maxDistance){
                swipeDirection = (distanceX < 0)? 'rigth' : 'left';
            }
            else if (Math.abs(distanceY) >= minDistance && Math.abs(distanceX) <= maxDistance){
                swipeDirection = (distanceY < 0)? 'down' : 'up';
            }
        }
        return swipeDirection;
    }
}

export default Swipe;