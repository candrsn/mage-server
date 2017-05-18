var angular = require('angular')
  , $ = require('jquery');

module.exports = {
  factory: DeviceService,
  name: 'DeviceService'
};

DeviceService.$inject = ['$http'];

function DeviceService($http) {
  var resolvedDevices = {};

  var service = {
    count: count,
    getAllDevices: getAllDevices,
    getDevice: getDevice,
    createDevice: createDevice,
    updateDevice: updateDevice,
    deleteDevice: deleteDevice
  };

  return service;

  function count() {
    return $http.get('/api/devices/count');
  }

  function getAllDevices(options) {
    var parameters = {};

    options = options || {};
    if (options.expand) {
      parameters.expand = 'user';
    }

    if (options.registered === false) {
      parameters.registered = false;
    }

    return $http.get('/api/devices?' + $.param(parameters));
  }

  function getDevice(id) {
    return resolvedDevices[id] || $http.get('/api/devices/' + id);
  }

  function createDevice(device) {
    var promise = $http.post('/api/devices', $.param(device),{
      headers: {"Content-Type": "application/x-www-form-urlencoded"}
    });

    promise.then(function(data) {
      resolvedDevices[device.id] = $.when(data);
    });

    return promise;
  }

  function updateDevice(device) {
    var promise = $http.put('/api/devices/' + device.id, $.param(device), {
      headers: {"Content-Type": "application/x-www-form-urlencoded"}
    });

    promise.then(function(data) {
      resolvedDevices[device.id] = $.when(data);
    });

    return promise;
  }

  function deleteDevice(device) {
    var promise = $http.delete('/api/devices/' + device.id);

    promise.then(function() {
      delete resolvedDevices[device.id];
    });

    return promise;
  }
}
