'use strict';

/**
 * @ngdoc function
 * @name Pear2Pear.service:Pear
 * @description
 * # Pear service
 * Provides controllers with a data model for pear to pear app
 * It serves as an abstraction between Pear data and backend (SwellRT)
 */

angular.module('Pear2Pear')
  .constant('SwellRTConfig', SwellRTConfig)
  .factory('pear', ['$rootScope', 'SwellRTConfig', 'swellRT', '$q', function($rootScope, SwellRTConfig, swellRT, $q) {

    var model = {
      model : swellRT.copy
    };

    var projects = {
      all: function() {
        return model.model;
      },
      find: function(id) {
        return model.model[id];
      },
      create: function(callback) {
        var p = {
          id: Math.random().toString(36).substr(2, 5),
          title: '',
          chat: [],
          pad: '',
          needs: [],
          promoter: users.current()
        };

        swellRT.copy[p.id] = p;
        callback(p);
      },
      destroy: function(id) {
        delete model.model[id];
      }
    };

    var users = {
      current: function() {
        return window.sessionStorage.getItem('userId');
      },
      setCurrent: function() {
      },
      isCurrent: function(user) {
        return user === users.current();
      }
    };

    var addChatMessage = function(projectId, message) {
      model.model[projectId].chat.push({
        text: message,
        // TODO change when ready
        standpoint: 'mine',
        who: users.current(),
        time: (new Date()).toJSON()
      });
    };

    var def = $q.defer();

    swellRT.startSession(SwellRTConfig.server, SwellRTConfig.user, SwellRTConfig.pass);

    swellRT.open(SwellRTConfig.chatpadWaveId).then(
      function() {
        model.model = swellRT.copy;
        def.resolve(swellRT.copy);
      });

    return {
      projects: projects,
      users: users,
      addChatMessage: addChatMessage,
      onLoad: function(f){
        def.promise.then(f);
      }
    };
  }]);
