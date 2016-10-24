/*global angular, $scope*/

angular.module('result',[]).controller('resultController',resultController);

function resultController($scope,resultService){
    
    console.log('checking whether the service is working in result controller', resultService);
     $scope.testResult = resultService.testResult;
     $scope.percentage = resultService.percentage;
     $scope.evaluation = resultService.evaluation;
     console.log("checking result passing, testResult is: ", $scope.testResult);
    
}