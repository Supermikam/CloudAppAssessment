/*global angular, $scope*/

	var canvas = document.getElementById('board');
	var ctx = canvas.getContext('2d');
	var topBar = document.getElementById('top');
	var bottomBar = document.getElementById('bottom');

	var canvasBorderLength;
	var centerX;
	var centerY;
	var innerRadius;
	var outerRadius;
	var greyInnerRadius;
	var greyOuterRadius;
	var startAngle = Math.PI * (1/12);
	var endAngle = Math.PI * (3/2 + (1/12));
	var canvasPosition;
	var slope1 = Math.tan(5 * Math.PI/12);
	var slope2 = Math.tan(-Math.PI/12);
    var slope3 = Math.tan(-Math.PI/4);
    var slope4 = Math.tan(-3 * Math.PI/4);
    var slope5 = Math.tan(-11 * Math.PI/12 );
    var slope6 = Math.tan(7 * Math.PI/12 );


	function resizePage(){

	var windowHight = window.innerHeight;
	var windowWidth = window.innerWidth;
	var barHeight;
	
	if(windowWidth >= windowHight * 0.8){
		canvasBorderLength = Math.floor(windowHight * 0.7);
		barHeight = Math.floor(windowHight * 0.1);
		
	}else{
		canvasBorderLength  = Math.floor(windowWidth * 0.9);
		barHeight = Math.floor((windowHight - windowWidth)/2);
	}
	
	
	canvas.style.width = canvasBorderLength + 'px';
	canvas.style.height = canvasBorderLength + 'px' ;
	topBar.style.height = barHeight + 'px';
	bottomBar.style.height = barHeight + 'px';	
	
	centerX = Math.floor(canvasBorderLength/2);
	centerY = centerX;

	innerRadius = Math.floor(canvasBorderLength * 0.125);
	outerRadius = Math.floor(canvasBorderLength * 0.2);
	greyInnerRadius = Math.floor(canvasBorderLength * 0.3);
	greyOuterRadius = Math.floor(canvasBorderLength * (3/7));

}

	function drawCircle(color,radius){
		ctx.beginPath();
		ctx.arc(centerX,centerY,radius, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fillStyle = color;
		ctx.fill();
	}

	function drawFan(start,end,color){

		ctx.beginPath();
		ctx.arc(centerX,centerY,greyOuterRadius,start,end,true);
		ctx.arc(centerX,centerY,greyInnerRadius,end,start,false);
		ctx.closePath();
		ctx.fillStyle = color;
		ctx.fill();
	}

	function drawChoice(colors){
		var increase = Math.PI/2;
		var gap = Math.PI/6;
		
		drawFan(startAngle,endAngle,colors[0]);
		drawFan(startAngle+increase +gap,endAngle +increase +gap,colors[1]);
		drawFan(startAngle + 2*(increase+gap), endAngle +2*(increase+gap), colors[2]);
			
	}


	function drawQuestion(currentQuestion){

		console.log('canvas border length is', canvasBorderLength);
		ctx.clearRect(0,0,canvasBorderLength,canvasBorderLength);
		
		//draw background if exist;
		if (currentQuestion.color2){
			var outerCircleColor = toHex(currentQuestion.color2);
			drawCircle(outerCircleColor,outerRadius);
		}
		//draw inner circle
		var innerCircleColor = toHex(currentQuestion.color1);
		drawCircle(innerCircleColor,innerRadius);
		
		
	
		var choiceColors = [];
		choiceColors.push(toHex(currentQuestion.target1));
		choiceColors.push(toHex(currentQuestion.target2));
		choiceColors.push(toHex(currentQuestion.target3));
		drawChoice(choiceColors);
		
	}

	function getPosition(el){
		var xPos = 0;
		var yPos = 0;
		
		while(el){
			if(el.tagName == 'BODY') {
				var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
				var yScroll = el.scrollTop || document.documentElement.scrollTop;
				
				xPos += (el.offsetLeft - xScroll + el.clientLeft);
				yPos += (el.offsetTop - yScroll + el.clientTop);
				
			}else{
				xPos += (el.offsetLeft - el.scrollLeft +el.clientLeft);
				yPos += (el.offsetTop - el.scrollTop + el.clientTop);
			}
			
			el = el.offsetParent;	
		}
		console.log('the position of the canvas returned by getPosition function is:', xPos, yPos);

		return {x:xPos,y:yPos};
	}
	


	function updatePosition(){
	    
	    
		canvasPosition = canvas.getBoundingClientRect();

	}
	
	function verifyOnTheRing(x,y){
	    var sqrDistance = (x-centerX)*(x-centerX) + (y-centerY)*(y-centerY);
	    var sqrInnerRadius = greyInnerRadius * greyInnerRadius;
	    var sqrOuterRadius = greyOuterRadius * greyOuterRadius;
	    if (( sqrDistance >= sqrInnerRadius) && (sqrDistance <= sqrOuterRadius)){
	        return true
	    }else{return false}
	    
	}
    
    function getPossibleChoice(x,y){
        
        

        
        x = x-centerX;
        y = centerY-y;
        
        if ((y < x * slope1) && (y> x * slope2)){return 1}
        else if ((y < x * slope3) && (y < x * slope4)){return 2}
        else if ((y > x * slope5) && (y< x * slope6)){return 3}
        else{return null}
    }
    
    
	function returnChoice(e){
	    var mouseX;
	    var mouseY;
    	if (e.button == 0){
    		mouseX = e.clientX - canvasPosition.left;
    		mouseY = e.clientY - canvasPosition.top;
    		console.log('mouse clicked at point', mouseX,mouseY);
    	}
    	
    	var onTheRing = verifyOnTheRing(mouseX,mouseY);
    	
    	if (onTheRing){
    	    var possibleChoice = getPossibleChoice(mouseX,mouseY);
    	    console.log("in returnChoice, choice calculated is", possibleChoice);
    	    if (possibleChoice) {return possibleChoice}
    	    else{return null}
    	    
    	}else{return null}
    }

	//level2 helper function for calculateTargetL and toHex
	function hslToRgb(h,s,l){
		var t1;
        var t2;
        var tr;
        var tg;
        var tb;
        var th;
        
        if (l < 0.5){
            t1 = l * ( 1 + s);
        }else{
            t1 = l + s - l * s;
        }
        
        t2 = 2 * l - t1;
        
        th = h / 360;
        
        tr = th + 0.333;
        tg = th;
        tb = th - 0.333;
        
        tr = shiftBackToRange(tr);
        tg = shiftBackToRange(tg);
        tb = shiftBackToRange(tb);
        
        var r = Math.floor(255 * toChanelPercentage(tr,t1,t2));
        var g = Math.floor(255 * toChanelPercentage(tg,t1,t2));
        var b = Math.floor(255 * toChanelPercentage(tb,t1,t2));
		
		return [r,g,b];
	}
	
	function hexColorExpression(rgbColor){
		var hexColor = '#';
		for(var i = 0; i<3; i++){
			if (rgbColor[i].toString(16).length >1){
				hexColor += rgbColor[i].toString(16);
			}else{hexColor = hexColor + '0' + rgbColor[i].toString(16)};
		}
		return hexColor;
	}
	//level1 helper function for drawQuestion
	function toHex(hslColor){
		var h = hslColor[0];
		var s = hslColor[1];
		var l = hslColor[2];
		
		var rgbColor = hslToRgb(h,s,l);
		


		var hexColor = hexColorExpression(rgbColor);

		
		return hexColor;
	}
		//level3 helper function for calculateTargetL
	function shiftBackToRange(t){
        t = t>1? t - 1:t;
        t = t<0? t + 1:t;
        return t;
    }
	
	 function toChanelPercentage(t,t1,t2){
        if (t * 6 < 1){
            t = t2 + (t1 - t2) * 6 * t; 
        }else if(t *2 <1){
            t = t1;
        }else if(t * 3 < 2){
            t = t2 +(t1 - t2) * (0.666 - t) * 6;
        }else{
            t = t2;
        }
        return t;
    }
		
	//window.addEventListener('load', resizePage, false);
	//window.addEventListener('resize', resizePage, false);
	//canvas.addEventListener('click', returnChoice,false);

angular.module('app',[]).controller('colorTestController',colorTestController);
function colorTestController($scope){
    var questionHistory;
    var currentQuestion;
    var levelArgs = [
            {minS: 0.85, maxS: 1, minL: 0.4, maxL: 0.6, difference: 0.15, level: 0, color2Type: null},
            {minS: 0.5, maxS: 0.85, minL: 0.4, maxL: 0.6, difference: 0.15, level: 1, color2Type: null},
            {minS: 0.3, maxS: 1, minL: 0.4, maxL: 0.6, difference: 0.1, level: 2, color2Type: null},
            {minS: 0.3, maxS: 1, minL: 0.2, maxL: 0.7, difference: 0.08, level: 3, color2Type: null},
            {minS: 0.5, maxS: 1, minL: 0.4, maxL: 0.6, difference: 0.1, level: 4, color2Type: "contrast"},
            {minS: 0.3, maxS: 1, minL: 0.2, maxL: 0.7, difference: 0.1, level: 5, color2Type: "random"},
        ];
    var checkPoint = [6,9,12];
    $scope.testFinished = false;
    $scope.testResult = null;
	$scope.canvasHeight = '500px';
	$scope.canvasWidth = ' 500px';
	$scope.barHeight = '50px';
	

		
    function calculateTargetL(hsl){
        var h = hsl[0];
        var s = hsl[1];
        var l = hsl[2];
        console.log( "the hsl color is", h, ",", s, ',', l);
        
		var rgbColor = hslToRgb(h,s,l);
        
        console.log("rgb color is ", rgbColor[0], ',',rgbColor[1],',',rgbColor[2]);
        
		var r = rgbColor[0];
		var g = rgbColor[1];
		var b = rgbColor[2];
        var greyScale = r * 0.3 + g * 0.59 + b * 0.11;
        
        var targetL = greyScale/255;
        return targetL;
        
    }
    
	//Generater Qustion
    function Question(args){
        this.color1 = args.color1;
        this.color2 = args.color2;
        this.target1 = args.target1;
        this.target2 = args.target2;
        this.target3 = args.target3;
        this.correctAnswer = args.correctAnswer;
        this.answer = null;
        this.level = args.level;
        this.result = null;
    }
    //level3 helper for generateTargetArray
    function shuffle(array) {
      var currentIndex = array.length, temporaryValue, randomIndex;
    
      // While there remain elements to shuffle...
      while (0 !== currentIndex) {
    
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
    
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }
    
      return array;
    }
    //level2 helper for questionGenerater
    function findTheCorrectAnswer(targetL, targetArrqy){
        var correctAnswer;
        for(var i = 0; i <3; i++){
           if (targetArrqy[i][2] === targetL){
               correctAnswer = i;
           } 
        }
        return correctAnswer;
        
    }
    //level2 helper for questionGenerater
    function generateColor(minS,maxS,minL,maxL){
        var h = Math.round(Math.random() * 360);
        var s = Math.random() * (maxS-minS) + minS;
        var l = Math.random() * (maxL-minL) + minL;
        var color1 = [h,s,l];
        return color1;
    }
    //level2 helper for generateTargetArray
    function generateTargetArray(targetL,difference){
        var h = 0;
        var l = targetL;
        var differenceArray = [[difference * -1, difference], [difference, difference * 2],[difference * -2, difference * -1] ];
        differenceArray = shuffle(differenceArray);
		var targetArrayLegual = false;
		var targetArray;
		
		while (!targetArrayLegual && differenceArray.length != 0){
			if((l+differenceArray[0][0] >=0) && (l+ differenceArray[0][0] <=1) 
					&& (l+differenceArray[0][1] >= 0) &&(l+differenceArray[0][1] <=1)){
					targetArrayLegual = true;	
					targetArray =  [[h,0,l],[h,0,l+differenceArray[0][0]],[h, 0, l+differenceArray[0][1]]];
			}else{differenceArray.pop();}
		}

        targetArray = shuffle(targetArray);
        return targetArray;
        
    }
    //level1 helper for get the firstQuestion & generateTheNextQustion
    function questionGenerater(args){
        
        var color1 = generateColor(args.minS,args.maxS,args.minL,args.maxL);

        
        /* get three target and shuffle */
        var targetL = calculateTargetL(color1);
        console.log("target lumination is: ", targetL);
        var targetArrqy = generateTargetArray(targetL,args.difference);
        var correctAnswer = findTheCorrectAnswer(targetL, targetArrqy);
        
        var color2;
        switch (args.color2Type) {
            case null:
                color2 = null;
                break;
            case 'contrast':
                color2 = color1.slice(0);
                color2[0] = 360 - color1[0];
                break;
            case 'random':
                color2 = generateColor(args.minS,args.maxS,args.minL,args.maxL);
                break;
            default:
                color2 = null;
        }
      
        var question = new Question({
            color1: color1,
            color2: color2,
            target1: targetArrqy[0],
            target2: targetArrqy[1],
            target3: targetArrqy[2],
            correctAnswer: correctAnswer,
            level: args.level,
        });
        
        
        return question;
    }
    
    //level0 helper function for $scope.initializeTest
    function getFirstQuestion(){

        var firstQuestion = questionGenerater({
            minS: 1,
            maxS: 1,
            minL: 0.5,
            maxL: 0.5,
            difference: 0.1,
            level: 0,
            color2Type: null,
            });
        return firstQuestion;
    }
    //level0 helper function for $scope.verifyAnswer
    function generateTheNextQustion(history, numOfAnswers,numOfRightAnswers,currentLevel){
       
        if (numOfAnswers === 3 || history.length === 0 || history[history.length - 1].level != currentLevel){
            switch (numOfAnswers) {
                case 1:
                    return questionGenerater(levelArgs[currentLevel]);
                case 2:
                    if (numOfRightAnswers ===2 ){
                        if(currentLevel<5){return questionGenerater(levelArgs[currentLevel + 1])}
                        else{return questionGenerater(levelArgs[currentLevel])}
                    }else if(numOfRightAnswers === 0){
                        if (currentLevel === 0){
                            return questionGenerater(levelArgs[currentLevel]);
                        }else{return questionGenerater(levelArgs[currentLevel - 1])}
                    }else { return questionGenerater(levelArgs[currentLevel])}
                case 3:
                    if (numOfRightAnswers >= 2){
                        if(currentLevel<5){return questionGenerater(levelArgs[currentLevel + 1])}
                        else{return questionGenerater(levelArgs[currentLevel])}
                    }else {
                         if (currentLevel === 0){return questionGenerater(levelArgs[currentLevel])}
                         else{return questionGenerater(levelArgs[currentLevel - 1])}
                    }
            }
        }else{
            var workingQudstion = history.pop();
            numOfAnswers +=1;
            if (workingQudstion.result) { numOfRightAnswers +=1;}
            var question = generateTheNextQustion(history,numOfAnswers,numOfRightAnswers,currentLevel);
        }
        
        return question;
        
    }
    //level0 helper function for $scope.verifyAnswer
    function generateTheArrayOfTestResultForAnalyse(){
        var resultArray = [];
        for (var i = 0; i < questionHistory.length; i ++){
            var shortVersion = {};
            shortVersion.result = questionHistory[i].result;
            shortVersion.level = questionHistory[i].level;
            resultArray.push(shortVersion);
        }
        
        return resultArray;
    }
    //level0 helper for $scope.analyseTest
    function analyseTest(resultArray){
        var baselevel = 0;
        var highestLevel = 0;
        
        /* get the highest level reached */
        for (var i = 0; i < resultArray.length; i++){
            if (highestLevel < resultArray[i].level){ highestLevel = resultArray[i].level;}
        }
        
        /*find out the highest steady level reached */
        var numOfQuestionsAnsweredAtEachLevel = [];
        var numOfQuestionsRightAtEachLevel = [];
        var percentageOfRightAnswersAtEachLevel = [];
        for (var i = 0; i < (highestLevel + 1); i++){
            numOfQuestionsAnsweredAtEachLevel.push(0);
            numOfQuestionsRightAtEachLevel.push(0);
            percentageOfRightAnswersAtEachLevel.push(0);
        }
        
        for (var i = 0; i <resultArray.length; i++){
            numOfQuestionsAnsweredAtEachLevel[resultArray[i].level] += 1;
            if (resultArray[i].result){
                numOfQuestionsRightAtEachLevel[resultArray[i].level] += 1;
            }
        }
        
        
        for (var i = 0; i < (highestLevel + 1); i++){
             percentageOfRightAnswersAtEachLevel[i] = numOfQuestionsRightAtEachLevel[i] / numOfQuestionsAnsweredAtEachLevel[i];
         }
        var baselevelFound = false;
        var i = highestLevel;
        while (!baselevelFound && i >= 0){
            if (numOfQuestionsAnsweredAtEachLevel[i]>=2 && percentageOfRightAnswersAtEachLevel[i] > 0.6){
                baselevelFound = true;
                baselevel = i;
            } else { i--;}
        }
        
        /* decide variation */
        var variation = 0;
        if (highestLevel > baselevel){variation = 0.5;}
        
        return baselevel + variation;
    }
    //level1 helper for setupScopeValue
    function toHSLExpression(color){
        var exp = '';
        exp += color[0].toString();
        exp += ',';
        exp += ((color[1]*100).toFixed(2) + '%');
        exp += ',';
        exp += ((color[2]*100).toFixed(2) + '%');
        return exp;
    
        
    }
    //Level0 helper for $scope.initializeTest 
	//Seems not nessesary
    function setupScopeValue(){
        $scope.colorToTest = currentQuestion.color1;
        $scope.colorToTestExp = toHSLExpression($scope.colorToTest);
        $scope.colorCompany = currentQuestion.color2;
        if(currentQuestion.color2){$scope.colorCompanyExp = toHSLExpression($scope.colorCompany)}
        $scope.target1 = currentQuestion.target1;
        $scope.target1Exp = toHSLExpression($scope.target1);
        $scope.target2 = currentQuestion.target2;
        $scope.target2Exp = toHSLExpression($scope.target2);
        $scope.target3 = currentQuestion.target3;
        $scope.target3Exp = toHSLExpression($scope.target3);
        
    }
    
    //Entry
    $scope.initializeTest = function(){

        $scope.noOfQuestions = 0;
        questionHistory = [];
		currentQuestion =getFirstQuestion();
		setupScopeValue();
        $scope.testFinished = false;
        $scope.testResult = null; 
		

		resizePage();
		drawQuestion(currentQuestion);
		updatePosition();

    };
    
    //EventHandler
    function verifyAnswer(choice){
        /* record the choice */
        $scope.noOfQuestions += 1;
        currentQuestion.answer = choice;
        if (currentQuestion.correctAnswer === choice) {
            $scope.result = true;
            currentQuestion.result = true;
        }
        questionHistory.push(currentQuestion);
        
        /* check whether test finished */
        switch($scope.noOfQuestions){
            case checkPoint[0]:
                if (currentQuestion.level === 0){$scope.testFinished = true;}
                break;
            case checkPoint[1]:
                if (currentQuestion.level <=1 ){$scope.testFinished = true;}
                break;
            case checkPoint[2]:
                $scope.testFinished = true;
                break;
            default:
                break;
        }
        
        /* generate the next question */
        if (!$scope.testFinished){
            var analyseArray = generateTheArrayOfTestResultForAnalyse();
            var newQuestion = generateTheNextQustion(analyseArray,0,0,currentQuestion.level);
            currentQuestion = newQuestion;
            setupScopeValue(currentQuestion);
         
            
        }else{
            var finalResultArray = generateTheArrayOfTestResultForAnalyse();
            $scope.testResult = analyseTest(finalResultArray);
            
        }
    };
	
	$scope.handleClick = function(event){

	    var choice =returnChoice(event);
	   // if(choice){
	   //     verifyAnswer(choice)
	   // }
	}
	

	//canvas functions(should be moved to another module when I know how)
	
	$scope.initializeTest();
	
}