var request = require('supertest')
  , sinon = require('sinon')
  , should = require('chai').should()
  , mongoose = require('mongoose')
  , MockToken = require('../mockToken')
  , app = require('../../express')
  , TokenModel = mongoose.model('Token');

require('sinon-mongoose');

require('../../models/team');
var TeamModel = mongoose.model('Team');

require('../../models/event');
var EventModel = mongoose.model('Event');

var Observation = require('../../models/observation');
var observationModel = Observation.observationModel;

describe("observation delete tests", function() {

  var sandbox;
  before(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  var userId = mongoose.Types.ObjectId();
  function mockTokenWithPermission(permission) {
    sandbox.mock(TokenModel)
      .expects('findOne')
      .withArgs({token: "12345"})
      .chain('populate', 'userId')
      .chain('exec')
      .yields(null, MockToken(userId, [permission]));
  }

  it("should update observation state to archived with UPDATE_EVENT role", function(done) {
    mockTokenWithPermission('UPDATE_EVENT');

    sandbox.mock(TeamModel)
      .expects('find')
      .yields(null, [{ name: 'Team 1' }]);

    var mockEvent = new EventModel({
      _id: 1,
      name: 'Mock Event',
      collectionName: 'observations1',
      acl: {}
    });

    sandbox.mock(EventModel)
      .expects('findById')
      .yields(null, mockEvent);

    var ObservationModel = observationModel({
      _id: 1,
      name: 'Event 1',
      collectionName: 'observations1'
    });
    var observationId = mongoose.Types.ObjectId();
    var mockObservation = new ObservationModel({
      _id: observationId,
      type: 'Feature',
      geometry: {
        type: "Point",
        coordinates: [0, 0]
      },
      properties: {
        timestamp: Date.now()
      },
      userId: mongoose.Types.ObjectId()
    });

    sandbox.mock(ObservationModel)
      .expects('findById')
      .withArgs(observationId.toString())
      .yields(null, mockObservation);

    sandbox.mock(ObservationModel)
      .expects('update')
      .yields(null, mockObservation);

    request(app)
      .post('/api/events/1/observations/' + observationId.toString() + '/states')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer 12345')
      .send({
        name: 'archive'
      })
      .expect(201)
      .expect(function(res) {
        var state = res.body;
        should.exist(state);
        state.should.have.property('name').and.equal('archive');
      })
      .end(done);
  });

  it("should update observation state to archived with acl update role", function(done) {
    mockTokenWithPermission('');

    sandbox.mock(TeamModel)
      .expects('find')
      .yields(null, [{ name: 'Team 1' }]);

    var mockEvent = new EventModel({
      _id: 1,
      name: 'Mock Event',
      collectionName: 'observations1',
      acl: {}
    });
    mockEvent.acl[userId] = 'MANAGER';

    sandbox.mock(EventModel)
      .expects('findById')
      .yields(null, mockEvent);

    var ObservationModel = observationModel({
      _id: 1,
      name: 'Event 1',
      collectionName: 'observations1'
    });
    var observationId = mongoose.Types.ObjectId();
    var mockObservation = new ObservationModel({
      _id: observationId,
      type: 'Feature',
      geometry: {
        type: "Point",
        coordinates: [0, 0]
      },
      properties: {
        timestamp: Date.now()
      },
      userId: mongoose.Types.ObjectId()
    });

    sandbox.mock(ObservationModel)
      .expects('findById')
      .withArgs(observationId.toString())
      .yields(null, mockObservation);

    sandbox.mock(ObservationModel)
      .expects('update')
      .yields(null, mockObservation);

    request(app)
      .post('/api/events/1/observations/' + observationId.toString() + '/states')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer 12345')
      .send({
        name: 'archive'
      })
      .expect(201)
      .expect(function(res) {
        var state = res.body;
        should.exist(state);
        state.should.have.property('name').and.equal('archive');
      })
      .end(done);
  });

  it("should update observation state to archived if observation owner", function(done) {
    mockTokenWithPermission('');

    sandbox.mock(TeamModel)
      .expects('find')
      .yields(null, [{ name: 'Team 1' }]);

    var mockEvent = new EventModel({
      _id: 1,
      name: 'Mock Event',
      collectionName: 'observations1',
      acl: {}
    });

    sandbox.mock(EventModel)
      .expects('findById')
      .yields(null, mockEvent);

    var ObservationModel = observationModel({
      _id: 1,
      name: 'Event 1',
      collectionName: 'observations1'
    });
    var observationId = mongoose.Types.ObjectId();
    var mockObservation = new ObservationModel({
      _id: observationId,
      type: 'Feature',
      geometry: {
        type: "Point",
        coordinates: [0, 0]
      },
      properties: {
        timestamp: Date.now()
      },
      userId: userId
    });

    sandbox.mock(ObservationModel)
      .expects('findById')
      .withArgs(observationId.toString())
      .yields(null, mockObservation);

    sandbox.mock(ObservationModel)
      .expects('update')
      .yields(null, mockObservation);

    request(app)
      .post('/api/events/1/observations/' + observationId.toString() + '/states')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer 12345')
      .send({
        name: 'archive'
      })
      .expect(201)
      .expect(function(res) {
        var state = res.body;
        should.exist(state);
        state.should.have.property('name').and.equal('archive');
      })
      .end(done);
  });

  it("should not update observation state if name is missing", function(done) {
    mockTokenWithPermission('DELETE_OBSERVATION');

    var mockEvent = new EventModel({
      _id: 1,
      name: 'Event 1',
      collectionName: 'observations1',
      acl: {}
    });
    sandbox.mock(EventModel)
      .expects('findById')
      .yields(null, mockEvent);

    var ObservationModel = observationModel({
      _id: 1,
      name: 'Event 1',
      collectionName: 'observations1'
    });

    var observationId = mongoose.Types.ObjectId();
    var mockObservation = new ObservationModel({
      _id: observationId,
      type: 'Feature',
      geometry: {
        type: "Point",
        coordinates: [0, 0]
      },
      properties: {
        timestamp: Date.now()
      },
      userId: userId
    });

    sandbox.mock(ObservationModel)
      .expects('findById')
      .withArgs(observationId.toString())
      .yields(null, mockObservation);

    request(app)
      .post('/api/events/1/observations/' + observationId.toString() + '/states')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer 12345')
      .send({
      })
      .expect(400)
      .expect(function(res) {
        res.text.should.equal('name required');
      })
      .end(done);
  });

  it("should not update observation state if name is not allowed", function(done) {
    mockTokenWithPermission('DELETE_OBSERVATION');

    var mockEvent = new EventModel({
      _id: 1,
      name: 'Event 1',
      collectionName: 'observations1',
      acl: {}
    });

    sandbox.mock(EventModel)
      .expects('findById')
      .yields(null, mockEvent);

    var observationId = mongoose.Types.ObjectId();

    var ObservationModel = observationModel({
      _id: 1,
      name: 'Event 1',
      collectionName: 'observations1'
    });

    var mockObservation = new ObservationModel({
      _id: observationId,
      type: 'Feature',
      geometry: {
        type: "Point",
        coordinates: [0, 0]
      },
      properties: {
        timestamp: Date.now()
      },
      userId: userId
    });

    sandbox.mock(ObservationModel)
      .expects('findById')
      .withArgs(observationId.toString())
      .yields(null, mockObservation);

    request(app)
      .post('/api/events/1/observations/' + observationId + '/states')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer 12345')
      .send({
        name: 'foo'
      })
      .expect(400)
      .expect(function(res) {
        res.text.should.equal("state name must be one of 'active', 'complete', 'archive'");
      })
      .end(done);
  });

  it("should not update observation state if name did not change", function(done) {
    mockTokenWithPermission('DELETE_OBSERVATION');

    var mockEvent = new EventModel({
      _id: 1,
      name: 'Event 1',
      collectionName: 'observations1',
      acl: {}
    });

    sandbox.mock(EventModel)
      .expects('findById')
      .yields(null, mockEvent);

    sandbox.mock(TeamModel)
      .expects('find')
      .yields(null, [{ name: 'Team 1' }]);

    sandbox.mock(EventModel)
      .expects('populate')
      .yields(null, {
        name: 'Event 1',
        teamIds: [{
          name: 'Team 1',
          userIds: [mongoose.Types.ObjectId()]
        }]
      });

    var ObservationModel = observationModel({
      _id: 1,
      name: 'Event 1',
      collectionName: 'observations1'
    });

    var observationId = mongoose.Types.ObjectId();
    var mockObservation = new ObservationModel({
      _id: observationId,
      type: 'Feature',
      geometry: {
        type: "Point",
        coordinates: [0, 0]
      },
      properties: {
        timestamp: Date.now()
      },
      userId: userId
    });

    sandbox.mock(ObservationModel)
      .expects('findById')
      .withArgs(observationId.toString())
      .yields(null, mockObservation);

    sandbox.mock(ObservationModel)
      .expects('update')
      .yields(new Error("some mock error"), null);

    request(app)
      .post('/api/events/1/observations/' + observationId.toString() + '/states')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer 12345')
      .send({
        name: 'archive'
      })
      .expect(400)
      .expect(function(res) {
        res.text.should.equal("state is already 'archive'");
      })
      .end(done);
  });
});
