app.controller('boardController', function($scope, $http, $uibModal, $interval) {

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

    $interval($scope.updateBoard,5000);

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
