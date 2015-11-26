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
