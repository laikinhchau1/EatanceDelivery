import BackgroundGeolocation from "@mauron85/react-native-background-geolocation";
import { strings } from "../locales/i18n";

export function fetchBackgroundLocationServices(getCurrentLocation, getBackgroundLocation, permissionHandler) {

    BackgroundGeolocation.configure({
        desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
        // stationaryRadius: 50,
        distanceFilter: 5,
        notificationTitle: strings("backgroundTracking"),
        notificationText: strings("backgroundEnable"),
        debug: false,
        startOnBoot: false,
        stopOnTerminate: true,
        notificationsEnabled: true,
        locationProvider: BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
        interval: 10000,
        fastestInterval: 2000,
        activitiesInterval: 10000,
        stopOnStillActivity: false,

    },
        success => {
        },
        fail => {
        }
    );

    BackgroundGeolocation.getCurrentLocation(location => {
        getCurrentLocation(location)
    });
    BackgroundGeolocation.on('location', (location) => {

        getBackgroundLocation(location)

        BackgroundGeolocation.startTask(taskKey => {
            // execute long running task
            // eg. ajax post location
            // IMPORTANT: task has to be ended by endTask
            BackgroundGeolocation.endTask(taskKey);
        });
    });

    BackgroundGeolocation.on('stationary', (stationaryLocation) => {
        // handle stationary locations here
    });

    BackgroundGeolocation.on('error', (error) => {
    });

    BackgroundGeolocation.on('start', () => {
    });

    BackgroundGeolocation.on('stop', () => {
    });

    BackgroundGeolocation.on('authorization', (status) => {
    });

    BackgroundGeolocation.on('background', () => {
    });

    BackgroundGeolocation.on('foreground', () => {
    });

    BackgroundGeolocation.on('abort_requested', () => {
    });

    BackgroundGeolocation.on('http_authorization', () => {
    });

    BackgroundGeolocation.checkStatus(status => {
        permissionHandler(status)
        // you don't need to check status before start (this is just the example)
        if (!status.isRunning) {
            BackgroundGeolocation.start(); //triggers start on start event
        }
    });

}

export function fetchBackgroundLocationStop(){
    BackgroundGeolocation.removeAllListeners()
}