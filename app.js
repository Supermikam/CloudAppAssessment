/*global angular, $scope*/

var app = angular.module('app', ['ngRoute', 'test','result']);
app.config(function ($routeProvider) {
    $routeProvider.when('/start', { templateUrl: 'partials/start.html' });
    $routeProvider.when('/test', { templateUrl: 'partials/test.html', controller: 'colorTestController' });
    $routeProvider.when('/finish', { templateUrl: 'partials/finish.html', controller: 'resultController' });
    $routeProvider.otherwise({ redirectTo: '/start' });
});


app.service('resultService', function () {
    var testResult = null;
    var percentage = 20;
    var evaluation = null;
    return testResult;
});