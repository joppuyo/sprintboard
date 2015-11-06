var app = angular.module('sprintBoard', ['ui.bootstrap']);

app.controller('boardController', function($scope, $http, $uibModal) {

    $scope.updateBoard = function(){
        var promise = $http.get(API_ROOT + 'board/' + BOARD_HASH);
        promise.then(function(data){
            $scope.board = data.data;
            console.log(data.data.cards);
        });
    };

    $scope.updateBoard();

    $scope.$on('boardUpdateEvent', function() {
        $scope.updateBoard();
    });

    $scope.addCard = function(){
        var modal = $uibModal.open({
            templateUrl: 'js/templates/modal-add-card.html',
            controller: 'ModalAddCardController'
        });
    };
});

app.controller('ModalAddCardController', function($scope, $uibModalInstance, $http, $rootScope){
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function() {
        var body = {};
        body.name = $scope.card.name;
        var promise = $http.post(API_ROOT + 'board/' + BOARD_HASH + '/card', body);
        promise.then(function(){
            $uibModalInstance.dismiss();
            $rootScope.$broadcast('boardUpdateEvent');
        })
    }
});
