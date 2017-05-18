var _ = require('underscore')
  , moment = require('moment');

module.exports = AdminController;

AdminController.$inject = ['$scope', '$routeParams', '$location', '$filter', require('../factories/user.service'), require('../factories/device.service'), require('../factories/login.service'), require('../factories/team.resource'), require('../factories/event.resource'), require('../factories/layer.resource')];

function AdminController($scope, $routeParams, $location, $filter, UserService, DeviceService, LoginService, Team, Event, Layer) {
  $scope.currentAdminPanel = $routeParams.adminPanel || "";

  var filter = {};
  $scope.user = {};
  $scope.device = {};
  $scope.login = {
    startDateOpened: false,
    endDateOpened: false
  };

  var firstLogin = null;
  $scope.showPrevious = false;
  $scope.showNext = true;

  $scope.usersPerPage = 10;
  $scope.usersPage = 0;
  $scope.inactiveUsers = [];

  $scope.devicesPerPage = 10;
  $scope.devicesPage = 0;
  $scope.unregisteredDevices = [];

  UserService.getAllUsers().then(function(users) {
    $scope.users = users.data || users;
  });

  UserService.getInactiveUsers().success(function(data) {
    $scope.inactiveUsers = data;
  });

  DeviceService.getAllDevices().success(function (devices) {
    $scope.devices = devices;
  });

  DeviceService.getAllDevices({expand: 'user', registered: false}).success(function(data) {
    $scope.unregisteredDevices = data;
  });

  Team.query(function (teams) {
    $scope.teamCount = _.reject(teams, function(team) { return team.teamEventId; }).length;
  });

  Event.count(function (data) {
    $scope.eventCount = data.count;
  });

  Layer.count(function (data) {
    $scope.layerCount = data.count;
  });

  LoginService.query({limit: $scope.loginResultsLimit}).success(function(loginPage) {
    $scope.loginPage = loginPage;
    if (loginPage.logins.length) {
      firstLogin = loginPage.logins[0];
    }
  });

  $scope.iconClass = function(device) {
    if (!device) return;

    if (device.iconClass) return device.iconClass;

    var userAgent = device.userAgent || "";

    if (device.appVersion === 'Web Client') {
      device.iconClass = 'fa-desktop admin-desktop-icon-xs';
    } else if (userAgent.toLowerCase().indexOf("android") !== -1) {
      device.iconClass = 'fa-android admin-android-icon-xs';
    } else if(userAgent.toLowerCase().indexOf("ios") !== -1) {
      device.iconClass = 'fa-apple admin-apple-icon-xs';
    } else {
      device.iconClass = 'fa-mobile admin-generic-icon-xs';
    }

    return device.iconClass;
  };

  $scope.newUser = function() {
    $location.path('/admin/users/new');
  };

  $scope.activateUser = function($event, user) {
    $event.stopPropagation();

    user.active = true;
    UserService.updateUser(user.id, user, function(data) {
      $scope.$apply(function() {
        $scope.inactiveUsers = _.reject($scope.inactiveUsers, function(u) { return u.id === data.id; });
      });
    });
  };

  $scope.gotoUser = function(user) {
    $location.path('/admin/users/' + user.id);
  };

  $scope.newTeam = function() {
    $location.path('/admin/teams/new');
  };

  $scope.newEvent = function() {
    $location.path('/admin/events/new');
  };

  $scope.newDevice = function() {
    $location.path('/admin/devices/new');
  };

  $scope.registerDevice = function($event, device) {
    $event.stopPropagation();

    device.registered = true;
    DeviceService.updateDevice(device).success(function(data) {
      $scope.unregisteredDevices = _.reject($scope.unregisteredDevices, function(d) { return d.id === data.id; });
    });
  };

  $scope.gotoDevice = function(device) {
    $location.path('/admin/devices/' + device.id);
  };

  $scope.filterDevices = function(device) {
    var filteredDevices = $filter('filter')([device], $scope.deviceSearch);
    return filteredDevices && filteredDevices.length;
  };

  $scope.newLayer = function() {
    $location.path('/admin/layers/new');
  };

  $scope.pageLogin = function(url) {
    LoginService.query({url: url, filter: filter, limit: $scope.loginResultsLimit}).success(function(loginPage) {

      if (loginPage.logins.length) {
        $scope.loginPage = loginPage;
        $scope.showNext = loginPage.logins.length !== 0;
        $scope.showPrevious = loginPage.logins[0].id !== firstLogin.id;
      }
    });
  };

  $scope.filterLogins = function() {
    filter.user = $scope.user.selected;
    filter.device = $scope.device.selected;
    filter.startDate = $scope.login.startDate;
    if ($scope.login.endDate) {
      filter.endDate = moment($scope.login.endDate).endOf('day').toDate();
    }

    LoginService.query({filter: filter, limit: $scope.loginResultsLimit}).success(function(loginPage) {
      $scope.showNext = loginPage.logins.length !== 0;
      $scope.showPrevious = false;
      $scope.loginPage = loginPage;
    });
  };

  $scope.openLoginStart = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.login.startDateOpened = true;
  };

  $scope.openLoginEnd = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.login.endDateOpened = true;
  };

  $scope.loginResultsLimitChanged = function() {
    $scope.filterLogins();
  };

  $scope.$watch('login.startDate', function(newDate, oldDate) {
    if (!newDate && !oldDate) return;

    $scope.filterLogins();
  });

  $scope.$watch('login.endDate', function(newDate, oldDate) {
    if (!newDate && !oldDate) return;

    $scope.filterLogins();
  });
}
