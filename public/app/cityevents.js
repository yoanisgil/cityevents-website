/**
 * Created by Yoanis Gil on 15-10-13.
 */

angular.module("cityevents", ['ngMaterial', 'ngMap', 'scDateTime'])
    .controller('AppController', function ($scope, $http) {
        $scope.types = "['geocode']";

        $scope.when = new Date();
        $scope.address = '';
        $scope.name = '';
        $scope.markers = [];

        var latLngBounds = new google.maps.LatLngBounds();

        $scope.placeChanged = function () {
            $scope.place = this.getPlace();
        };

        $scope.isValidForCreation = function () {
            return $scope.address.length > 0 && $scope.place != null && $scope.name.length > 0;
        };

        $scope.create = function () {
            console.log($scope.place);

            var lat = $scope.place.geometry.location.lat();
            var lng = $scope.place.geometry.location.lng();

            var _address_components = _.filter($scope.place.address_components, function (address_component) {
                return _.intersection(address_component.types, ['locality', 'postal_code', 'administrative_area_level_1', 'country']).length > 0;
            });

            var component_type_mapping = {
                locality: 'city',
                postal_code: 'postal_code',
                administrative_area_level_1: 'province',
                country: 'country'
            };

            var geo_data = _.map(_address_components, function (value) {
                var result = {};

                var component_type = _.find(value.types, function (v) {
                    return v != 'political';
                });

                result[component_type_mapping[component_type]] = value.short_name;

                return result;
            });

            var event_data = {
                address: $scope.place.formatted_address,
                lat: lat,
                lng: lng,
                name: $scope.name,
                when: $scope.when.getTime() / 1000
            };

            _.forEach(geo_data, function (value) {
                event_data = _.merge(event_data, value);
            });

            $http.post('http://localhost:3001/event', event_data).success(function (response) {
                console.log('event created');
            });
        };


        var socket = io.connect('http://localhost:3002');

        socket.on('new location', function (data) {
            console.log('NEW LOCATION', JSON.stringify(data));
            if (undefined === $scope.markers[data.id]) {
                var marker = new google.maps.Marker({
                    position: {lat: data.location.coordinates[1], lng: data.location.coordinates[0]},
                    map: $scope.map,
                    title: data.address
                });

                latLngBounds.extend(marker.position);
                $scope.map.fitBounds(latLngBounds);

                $scope.markers[data.id] = marker;
            }
        });

        socket.on('delete location', function (data) {
            console.log('DELETE LOCATION', JSON.stringify(data));
            if (undefined !== $scope.markers[data.id]) {
                $scope.markers[data.id].setMap(null);
            }
        });

    });
