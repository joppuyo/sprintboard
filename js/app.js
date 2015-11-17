var app = angular.module('sprintBoard', ['ui.bootstrap', 'ng-sortable']);

app.controller('boardController', function($scope, $http, $uibModal) {

    $scope.updateBoard = function(){
        var promise = $http.get(API_ROOT + 'team/' + TEAM_HASH);
        promise.then(function(response){
            $scope.team = response.data;
            $scope.sprint = _.findWhere(response.data.sprints, { id: SPRINT_ID });
        });
        promise.catch(function(response){
            alert("Error. Backend returned: " + response.data.message );
        });
    };

    $scope.updateBoard();

    $scope.$on('boardUpdateEvent', function() {
        $scope.updateBoard();
    });

    $scope.addCard = function(){
        var modal = $uibModal.open({
            templateUrl: 'js/templates/modal-add-card.html',
            controller: "ModalAddCardController"
        });
    };

    $scope.addSprint = function(){
        var modal = $uibModal.open({
            templateUrl: 'js/templates/modal-add-sprint.html',
            controller: "ModalAddSprintController",
            scope: $scope
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
        var promise = $http.post(API_ROOT + 'team/' + TEAM_HASH + '/' + SPRINT_ID + '/card', body);
        promise.then(function(){
            $uibModalInstance.dismiss();
            $rootScope.$broadcast('boardUpdateEvent');
        });
        promise.catch(function(response){
            alert('Error. Backend returned: ' + response.data.message );
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
            var promise = $http.put(API_ROOT + 'card/' + $scope.card.id + '/sort', taskIds);
            promise.catch(function(response){
                alert('Error. Backend returned: ' + response.data.message );
            });
        }
    };
});

app.controller('taskController', function($scope, $http, $rootScope, $uibModal){
    $scope.markAsDone = function() {
        var promise;
        if ($scope.task.is_done) {
            promise = $http.delete(API_ROOT + 'task/' + $scope.task.id + '/done');
        } else {
            promise = $http.put(API_ROOT + 'task/' + $scope.task.id + '/done');
        }
        promise.then(function(){
            $rootScope.$broadcast('boardUpdateEvent');
        });
        promise.catch(function(response){
            alert('Error. Backend returned: ' + response.data.message );
        });
    };
    $scope.deleteTask = function () {
        var promise = $http.delete(API_ROOT + 'task/' + $scope.task.id);
        promise.catch(function(response){
            alert('Error. Backend returned: ' + response.data.message );
        });
        promise.then(function(){
            $rootScope.$broadcast('boardUpdateEvent');
        });
        promise.catch(function(response){
            alert('Error. Backend returned: ' + response.data.message );
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
        var promise = $http.post(API_ROOT + 'card/' + $scope.card.id + '/task', body);
        promise.then(function(){
            $uibModalInstance.dismiss();
            $rootScope.$broadcast('boardUpdateEvent');
        });
        promise.catch(function(response){
            alert('Error. Backend returned: ' + response.data.message );
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
        var promise = $http.put(API_ROOT + 'task/' + $scope.task.id, body);
        promise.then(function(){
            $uibModalInstance.dismiss();
            $rootScope.$broadcast('boardUpdateEvent');
        });
        promise.catch(function(response){
            alert('Error. Backend returned: ' + response.data.message );
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
        var promise = $http.put(API_ROOT + 'card/' + $scope.card.id, body);
        promise.then(function(){
            $uibModalInstance.dismiss();
            $rootScope.$broadcast('boardUpdateEvent');
        });
        promise.catch(function(response){
            alert('Error. Backend returned: ' + response.data.message );
        });
    }
});

app.controller('ModalDeleteCardController', function ($scope, $uibModalInstance, $http, $rootScope) {
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.deleteCard = function() {
        var promise = $http.delete(API_ROOT + 'card/' + $scope.card.id);
        promise.then(function(){
            $uibModalInstance.dismiss();
            $rootScope.$broadcast('boardUpdateEvent');
        });
        promise.catch(function(response){
            alert('Error. Backend returned: ' + response.data.message );
        });
    }
});

app.controller('ModalAddSprintController', function($scope, $uibModalInstance, $http, $rootScope, $location){
    $scope.newSprint = {};
    $scope.newSprint.name = 'Sprint ' + ($scope.team.sprints.length + 1);
    $scope.newSprint.startDate = moment().format('DD.MM.YYYY');
    $scope.newSprint.endDate = moment().add(2, 'weeks').format('DD.MM.YYYY');
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submit = function() {
        var body = {};
        body.name = $scope.newSprint.name;
        body.start_date = $scope.newSprint.startDate;
        body.end_date = $scope.newSprint.endDate;
        var promise = $http.post(API_ROOT + 'team/' + TEAM_HASH + '/sprint', body);
        promise.then(function(response){
            // Redirect to new board
            window.location = 'team/' + TEAM_HASH + '/' + response.data.id;
        });
        promise.catch(function(response){
            alert('Error. Backend returned: ' + response.data.message );
        });
    };
});
