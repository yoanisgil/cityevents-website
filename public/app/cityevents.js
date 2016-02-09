/**
 * Created by Yoanis Gil on 15-10-13.
 */

angular.module("cityevents", ['ngMaterial', 'ngMap', 'scDateTime', 'jkuri.gallery'])
    .controller('AppController', function ($scope, $http) {
        $scope.types = "['geocode']";

        $scope.when = new Date();
        $scope.address = '';
        $scope.from_address = '';
        $scope.to_address = '';
        $scope.name = '';
        $scope.markers = [];
        $scope.show_details = false;
        $scope.origin = "";
        $scope.destination = "";
        $scope.flex = 100;
        $scope.directions_flex = 0;

        $scope.event_images = [];

        var latLngBounds = new google.maps.LatLngBounds();

        $scope.mapWidth = function () {
            return $scope.from_address.length > 0 ? $scope.flex : 100;
        };

        $scope.placeChanged = function () {
            var place = this.getPlace();
            $scope.from_adress = place.formatted_address;
        };

        $scope.fromPlaceChanged = function () {
            var place = this.getPlace();
            $scope.destination = $scope.to_address;

            $scope.flex = 70;
            $scope.directions_flex = 100 - $scope.flex;
        };

        $scope.isValidForCreation = function () {
            return $scope.address.length > 0 && $scope.place != null && $scope.name.length > 0;
        };

        $scope.hideDetails = function () {
            $scope.show_details = false;
            $scope.from_address = "";
            $scope.flex = 100;
            $scope.directions_flex = 0;

            $scope.apply();
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

            var photos = $scope.place.photos || [];

            photos = _.map(photos, function (photo) {
                return {url: photo.getUrl({'maxWidth': 800})};
            });

            var event_data = {
                address: $scope.place.formatted_address,
                lat: lat,
                lng: lng,
                name: $scope.name,
                when: $scope.when.getTime() / 1000,
                photos: photos
            };

            _.forEach(geo_data, function (value) {
                event_data = _.merge(event_data, value);
            });

            $http.post('http://localhost:3001/event', event_data);
        };


        var socket = io.connect('http://localhost:3002');

        socket.on('new location', function (data) {
            $scope.addEvent(data);
        });

        socket.on('delete location', function (data) {
            if (undefined !== $scope.markers[data.id]) {
                $scope.markers[data.id].setMap(null);
            }
        });

        $scope.search = function () {
            $http.get('http://localhost:3001/event').success(function (response) {
                _(response).forEach(function (event) {
                    $scope.addEvent(event);
                });
            });
        };

        $scope.addEvent = function (data) {
            if (undefined === $scope.markers[data.id]) {
                var marker = new google.maps.Marker({
                    position: {lat: data.location.coordinates[1], lng: data.location.coordinates[0]},
                    map: $scope.map,
                    title: data.address
                });

                latLngBounds.extend(marker.position);
                $scope.map.fitBounds(latLngBounds);

                $scope.markers[data.id] = marker;
                marker.setValues({event: data});

                marker.addListener('click', function () {
                    $scope.event_name = data.name;
                    $scope.show_details = true;
                    $scope.event_images = [];
                    //$scope.map.setCenter(marker.getPosition());

                    if (data.photos.length > 0) {
                        _.each(_.sampleSize(data.photos, 3), function (value) {
                            $scope.event_images.push({thumb: value.url, img: value.url});
                        });

                    }

                    $scope.to_address = data.address;

                    $scope.$apply();
                });
            }
        };

        $scope.$on('mapInitialized', function (evt, map) {
            $scope.search();
        });

    });
