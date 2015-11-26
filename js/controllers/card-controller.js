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
