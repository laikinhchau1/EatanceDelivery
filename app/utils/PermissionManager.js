import { check, request, RESULTS } from 'react-native-permissions';

export async function requestPermission(paramPermission, onSuccess, onFailure) {

    request(paramPermission)
        .then((result) => {
            switch (result) {
                case RESULTS.UNAVAILABLE:
                    onFailure()
                    break;
                case RESULTS.DENIED:
                    onFailure()
                    break;
                case RESULTS.GRANTED:
                    onSuccess()
                    break;
                case RESULTS.BLOCKED:
                    onFailure()
                    break;
            }
        })
}

export async function checkPermission(paramPermission, onSuccess, onFailure) {

    check(paramPermission)
        .then((result) => {
            switch (result) {
                case RESULTS.UNAVAILABLE:
                    requestPermission(paramPermission, onSuccess, onFailure)
                    break;
                case RESULTS.DENIED:
                    requestPermission(paramPermission, onSuccess, onFailure)
                    break;
                case RESULTS.GRANTED:
                    requestPermission(paramPermission, onSuccess, onFailure)
                    break;
                case RESULTS.BLOCKED:
                    requestPermission(paramPermission, onSuccess, onFailure)
                    break;
            }
        })
}