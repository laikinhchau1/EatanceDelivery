import Geolocation from "@react-native-community/geolocation";
import { Dimensions } from "react-native";
import Geocoder from "react-native-geocoding";
import { showDialogue } from "./EDAlert";
import { GOOGLE_API_KEY } from "./EDConstants";

let { width, height } = Dimensions.get('window')
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export function getCurrentLocation(googleMapsAPIKey, onSucess, onFailure) {

    if (googleMapsAPIKey == undefined || googleMapsAPIKey == null || googleMapsAPIKey.trim().length == 0 || googleMapsAPIKey == GOOGLE_API_KEY) {
        showDialogue('Please configure Google Maps API Key')
        onFailure({ data: {}, message: strings('webServiceError') })
        return;
      }

    Geocoder.init(googleMapsAPIKey);
    Geolocation.getCurrentPosition(
        position => {
            
            getAddress(position.coords.latitude, position.coords.longitude,
                onSuccess => {
                    var region = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        address: onSuccess
                    }
                    onSucess(region)
                },
                onFailure => {
                    onFailure(onFailure)
                })
            
        },
        error => {
            onFailure(error);

        },
        { enableHighAccuracy: false, timeout: Number.MAX_SAFE_INTEGER, maximumAge: 1000 }
    )
}

export function getAddress(latitude, longitude, onSuccess, onFailure) {
    Geocoder.from(latitude, longitude)
        .then(json => {
            if (json.results.length !== 0) {
                var city = json.results[0].address_components.filter(
                    x =>
                        x.types.filter(t => t == "administrative_area_level_1").length > 0
                )

                if (city.length !== 0) {
                    city = city[0].long_name;
                } else {
                    city = ""
                }

                var pincode = json.results[0].address_components.filter(
                    x => x.types.filter(t => t == "postal_code").length > 0
                )

                if (pincode.length !== 0) {
                    pincode = pincode[0].short_name;
                } else {
                    pincode = ""
                }

                var addressComponent = json.results[0].formatted_address;

                var address = {
                    strAddress: addressComponent,
                    city: city,
                    zipCode: pincode
                }
                onSuccess(address)
            }else{
                onFailure()
            }
        })
}