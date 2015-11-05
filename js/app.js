var app = angular.module('sprintBoard', ['ui.bootstrap']);

app.controller('boardController', function($scope, $http, $uibModal) {
    var promise = $http.get(API_ROOT + 'board/' + BOARD_HASH);
    promise.then(function(data){
        $scope.board = data.data;
        console.log(data.data.cards);
    });
    $scope.addCard = function(){
        var modal = $uibModal.open({
            templateUrl: 'js/templates/ModalAddCard.html',
            controller: 'ModalAddCardController'
        });
    };
});

app.controller('ModalAddCardController', function($scope, $uibModalInstance, $http){
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function() {
        var body = {};
        body.name = $scope.card.name;
        var promise = $http.post(API_ROOT + 'board/' + BOARD_HASH + '/card', body);
        promise.then(function(){
            $uibModalInstance.dismiss('cancel');
            // TODO: refresh views
        })
    }
});