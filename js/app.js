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
        });
    };
});

app.controller('cardController', function($scope, $http, $rootScope, $uibModal){
    $scope.addTask = function() {
        var modal = $uibModal.open({
            templateUrl: 'js/templates/modal-add-task.html',
            controller: 'ModalAddTaskController',
            scope: $scope
        });
    };
});

app.controller('taskController', function($scope, $http, $rootScope, $uibModal){
    $scope.markAsDone = function() {
        var promise;
        if ($scope.task.is_done) {
            promise = $http.delete(API_ROOT + 'board/' + BOARD_HASH + '/card/' + $scope.card.id + '/task/' + $scope.task.id + '/done');
        } else {
            promise = $http.put(API_ROOT + 'board/' + BOARD_HASH + '/card/' + $scope.card.id + '/task/' + $scope.task.id + '/done');
        }
        promise.then(function(){
            $rootScope.$broadcast('boardUpdateEvent');
        });
    };
    $scope.deleteTask = function () {
        var promise = $http.delete(API_ROOT + 'board/' + BOARD_HASH + '/card/' + $scope.card.id + '/task/' + $scope.task.id);
        promise.then(function(){
            $rootScope.$broadcast('boardUpdateEvent');
        })
    };
    $scope.renameTask = function () {
        var modal = $uibModal.open({
            templateUrl: 'js/templates/modal-rename-task.html',
            controller: 'ModalRenameTaskController',
            scope: $scope
        });
    }
});

app.controller('ModalAddTaskController', function($scope, $uibModalInstance, $http, $rootScope){
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function() {
        var body = {};
        body.name = $scope.task.name;
        var promise = $http.post(API_ROOT + 'board/' + BOARD_HASH + '/card/' + $scope.card.id + '/task', body);
        promise.then(function(){
            $uibModalInstance.dismiss();
            $rootScope.$broadcast('boardUpdateEvent');
        });
    };
});

app.controller('ModalRenameTaskController', function ($scope, $uibModalInstance, $http, $rootScope) {
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function() {
        var body = {};
        body.name = $scope.task.newName;
        var promise = $http.put(API_ROOT + 'board/' + BOARD_HASH + '/card/' + $scope.card.id + '/task/' + $scope.task.id, body);
        promise.then(function(){
            $uibModalInstance.dismiss();
            $rootScope.$broadcast('boardUpdateEvent');
        });
    }
});
