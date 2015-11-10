var app = angular.module('sprintBoard', ['ui.bootstrap', 'ng-sortable']);

app.controller('boardController', function($scope, $http, $uibModal) {

    $scope.updateBoard = function(){
        var promise = $http.get(API_ROOT + 'board/' + BOARD_HASH);
        promise.then(function(data){
            $scope.board = data.data;
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
    $scope.deleteCard = function() {
        var modal = $uibModal.open({
            templateUrl: 'js/templates/modal-delete-card.html',
            controller: 'ModalDeleteCardController',
            scope: $scope
        });
    };
    $scope.renameCard = function () {
        var modal = $uibModal.open({
            templateUrl: 'js/templates/modal-rename-card.html',
            controller: 'ModalRenameCardController',
            scope: $scope
        });
    };
    $scope.sortConfig = {
        animation: 200,
        onSort: function (event) {
            var taskIds = _.map(event.models, function(task){
                return task.id;
            });
            var promise = $http.put(API_ROOT + 'board/' + BOARD_HASH + '/card/' + $scope.card.id + '/sort', taskIds);
        }
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
        });
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

app.controller('ModalRenameCardController', function ($scope, $uibModalInstance, $http, $rootScope) {
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function() {
        var body = {};
        body.name = $scope.card.newName;
        var promise = $http.put(API_ROOT + 'board/' + BOARD_HASH + '/card/' + $scope.card.id, body);
        promise.then(function(){
            $uibModalInstance.dismiss();
            $rootScope.$broadcast('boardUpdateEvent');
        });
    }
});

app.controller('ModalDeleteCardController', function ($scope, $uibModalInstance, $http, $rootScope) {
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.deleteCard = function() {
        var promise = $http.delete(API_ROOT + 'board/' + BOARD_HASH + '/card/' + $scope.card.id);
        promise.then(function(){
            $uibModalInstance.dismiss();
            $rootScope.$broadcast('boardUpdateEvent');
        });
    }
});
