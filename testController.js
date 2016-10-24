/*global angular, $scope,resultService*/



angular.module('test',[]).controller('colorTestController',colorTestController);
function colorTestController($scope, $timeout, $location,resultService){
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
    var evaluations = [
        'You seem to have just started seeing color as a combination of different charactors. A basic understanding and training might be needed.',
        'You get the idea of the difference of hue and brightness, but you have some difficulty seperate hue from brightness.',
        'You have some basic sensitivity over the brightness of color, but the purity and hue of a color affects you too much.',
        'You are quite sensitive over the brihtness of color. But you sensitivity is affected by the environment the color is presented in.',
        'You are a master of color.'
        ]
    var checkPoint = [6,9,12];
    $scope.testFinished = false;
    $scope.testResult = null;
	$scope.canvasHeight = '500px';
	$scope.canvasWidth = ' 500px';
	$scope.barHeight = '50px';
	$scope.progressBarClass = 'progress progress-warning';
	$scope.progressValue= '1';
	$scope.progressMax = '100';
	$scope.backgroundId = 'nuetral';
	
	
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
    
    var canvasOriginalLength = 600;
    var canvasCenterX = canvasOriginalLength / 2;
    var canvasCenterY = canvasCenterX;
    var canvasInnerRadius = Math.floor(canvasCenterX * 0.25);
    var canvasOuterRadius = Math.floor(canvasCenterX * 0.4);
    var canvasGreyInnerRadius = Math.floor(canvasCenterX* 0.6);
    var canvasGreyOuterRadius = Math.floor(canvasCenterX * (6/7));

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
		ctx.arc(canvasCenterX,canvasCenterY,radius, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fillStyle = color;
		ctx.fill();
	}

	function drawFan(start,end,color){

		ctx.beginPath();
		ctx.arc(canvasCenterX,canvasCenterY,canvasGreyOuterRadius,start,end,true);
		ctx.arc(canvasCenterX,canvasCenterY,canvasGreyInnerRadius,end,start,false);
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
	    
	    console.log("the correct answer is", currentQuestion.correctAnswer);

		ctx.clearRect(0,0,canvasOriginalLength,canvasOriginalLength);
		
		//draw background if exist;
		if (currentQuestion.color2){
			var outerCircleColor = toHex(currentQuestion.color2);
			drawCircle(outerCircleColor,canvasOuterRadius);
		}
		//draw inner circle
		var innerCircleColor = toHex(currentQuestion.color1);
		drawCircle(innerCircleColor,canvasInnerRadius);
		
		
	
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

    	}
    	
    	var onTheRing = verifyOnTheRing(mouseX,mouseY);
    	
    	if (onTheRing){
    	    var possibleChoice = getPossibleChoice(mouseX,mouseY);

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


		
    function calculateTargetL(hsl){
        var h = hsl[0];
        var s = hsl[1];
        var l = hsl[2];
        
		var rgbColor = hslToRgb(h,s,l);
        
        
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
      var currentIndex = array.length;
      var temporaryValue;
      var randomIndex;
    
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
               correctAnswer = i + 1;
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
        
        var d1 = difference * -2;
        var d2 = difference * -1;
        var d3 = difference;
        var d4 = difference *2
        


        var differenceArray = [[d2, d3], [d3, d4],[d1, d2]];
  
        differenceArray = shuffle(differenceArray);
  
		var targetArrayLegual = false;
		var targetArray;
		
		while (!targetArrayLegual && differenceArray.length != 0){
			if((l + differenceArray[0][0] >= 0) && (l + differenceArray[0][0] <=1) 
					&& (l + differenceArray[0][1] >= 0) && (l + differenceArray[0][1] <=1)){
					
					targetArrayLegual = true;	
					targetArray =  [[h,0,l],[h,0,l + differenceArray[0][0]],[h, 0, l + differenceArray[0][1]]];
			}else{
			    
			    var dropping = differenceArray.shift(); 

			}
		}

        targetArray = shuffle(targetArray);
        return targetArray;
        
    }
    //level1 helper for get the firstQuestion & generateTheNextQustion
    function questionGenerater(args){

        var color1 = generateColor(args.minS,args.maxS,args.minL,args.maxL);

        
        /* get three target and shuffle */
        var targetL = calculateTargetL(color1);
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
            minS: 0.85,
            maxS: 1,
            minL: 0.4,
            maxL: 0.6,
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
    function setProgressBar(){
        
        
        if ($scope.noOfQuestions <6){
            $scope.progressValue = Math.floor(($scope.noOfQuestions)/6 * 100).toString();
        } else if($scope.noOfQuestions <9){
             $scope.progressValue = Math.floor(($scope.noOfQuestions)/9 * 100).toString();
             $scope.progressBarClass = 'progress progress-info';
        }else {
             $scope.progressValue = Math.floor(($scope.noOfQuestions)/12 * 100).toString();
             $scope.progressBarClass = 'progress progress-success';
        }
   
    }
   
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
        
        setProgressBar();
        
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
            
            $scope.backgroundId = 'right';
            $timeout(function () {
              $scope.backgroundId = "neutral";
          }, 500);
            $scope.result = true;
            currentQuestion.result = true;
        }else{
            $scope.backgroundId = 'wrong';
            $timeout(function () {
              $scope.backgroundId = "neutral";
          }, 500);
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
            drawQuestion(currentQuestion);
         
            
        }else{
            var finalResultArray = generateTheArrayOfTestResultForAnalyse();
            $scope.testResult = analyseTest(finalResultArray);
            $scope.progressValue = '100';
            resultService.testResult = $scope.testResult;
            resultService.percentage = 0.2;
            resultService.evaluation = getEvaluation($scope.testResult);
            $location.path('/finish');
        }
    };
	
	function getEvaluation(result){
	    if (result == 0){
	        return evaluations[0];
	    }else if((result >0) & (result <=1)){
	        return evaluations[1];
	    }else if((result >1) & (result <= 3)){
	        return evaluations[2];
	    }else if((result >3) & (result <= 4)){
	        return evaluations[3];
	    }else{ return evaluations[4];}
	    
	}
	
	$scope.handleClick = function(event){
        if (!$scope.testFinished){
    	    var choice =returnChoice(event);
    	    if(choice){
    	        verifyAnswer(choice)
    	    }
        }
	}
	
	//canvas functions(should be moved to another module when I know how)
	$scope.initializeTest();
	
}