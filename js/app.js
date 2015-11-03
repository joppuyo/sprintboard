var app = angular.module('sprintBoard', []);

app.controller('boardController', function($scope, $http) {
    var promise = $http.get(API_ROOT + 'board/' + BOARD_HASH);
    promise.then(function(data){
        $scope.cards = data.data.cards;
        console.log(data.data.cards);
    })
});