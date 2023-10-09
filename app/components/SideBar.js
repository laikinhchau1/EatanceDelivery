import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import React from 'react';
import { Platform } from 'react-native';
import { FlatList, StyleSheet, Text, View, Image } from 'react-native';
import deviceInfoModule from 'react-native-device-info';
import { initialWindowMetrics } from 'react-native-safe-area-context';
import { connect } from 'react-redux';
import Assets from '../assets';
import ToggleSwitch from 'toggle-switch-react-native';
import { strings } from '../locales/i18n';
import { saveNavigationSelection } from '../redux/actions/Navigation';
import { saveLanguageInRedux, saveOnlineStatus, saveUserDetailsInRedux } from '../redux/actions/User';
import { flushAllData, saveLanguage, saveUserStatus } from '../utils/AsyncStorageHelper';
import { fetchBackgroundLocationStop } from '../utils/BackgroundLocationServicesManager';
import { showDialogue, showNoInternetAlert, showTopDialogue } from '../utils/EDAlert';
import { EDColors } from '../utils/EDColors';
import { getProportionalFontSize, isRTLCheck } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import Metrics from '../utils/metrics';
import { netStatus } from '../utils/NetworkStatusConnection';
import { driverStatus, logoutUser } from '../utils/ServiceManager';
import EDProgressLoader from './EDProgressLoader';
import EDRTLView from './EDRTLView';
import EDSideMenuHeader from './EDSideMenuHeader';
import EDSideMenuItem from './EDSideMenuItem';
import NavigationEvents from '../components/NavigationEvents';
import { CommonActions } from '@react-navigation/native';



class SideBar extends React.PureComponent {
    //#region LIFECYCLE METHODS

    /** CONSTRUCTOR */
    constructor(props) {
        super(props);
        this.arrayFinalSideMenu = [];
    }

    /** STATE */
    state = {
        isLoading: false,
        isActive: this.props.status || false
    };



    /** Toggle Switch Handler */
    _toggleSwitchActive = () => {
        this.setState({ isActive: !this.state.isActive })

        saveUserStatus(!this.props.status, onSuccess => { this.props.saveStatus(!this.props.status) }, onFailure => { })
        let objDriverStatus = {
            language_slug: this.props.lan,
            user_id: this.props.userDetails.UserID,
            availability_status: this.state.isActive ? 0 : 1
        }
        driverStatus(objDriverStatus, this.onDriverSuccessHandler, this.onDriverFailureHandler, this.props)
    }

    onDriverSuccessHandler = (response) => {


    }
    onDriverFailureHandler = (onFailure) => {
    }



    /** MAIN RENDER METHOD */
    render() {
        let arrCMSPages = ((this.props.arrayCMSPages)).map(itemToIterate => { return { isAsset: true, route: 'cms', screenName: itemToIterate.name, icon: { uri: itemToIterate.cms_icon }, cmsSlug: itemToIterate.CMSSlug }; });
        let arrTemp = this.setupSideMenuData();
        let arraySideMenuData = arrTemp.concat(arrCMSPages);

        // Vikrant 20-07-21

        this.arrayFinalSideMenu =
            this.props.userDetails.FirstName !== undefined
                ? arraySideMenuData.concat({ route: 'Log Out', screenName: strings('logout'), icon: 'exit-outline', iconType: 'ionicon' })
                : arraySideMenuData;
        return (
            <View
                pointerEvents={this.state.isLoading ? 'none' : 'auto'}
                style={style.mainContainer}>

                {/* DETECT DID FOCUS EVENT */}
                <NavigationEvents onFocus={this.onDidFocusNavigationEvents} />

                {this.state.isLoading ? <EDProgressLoader spinnerStyle={{
                    marginRight: isRTLCheck() ? Metrics.screenWidth * .75 : 0
                }} /> : null}

                {/* HEADER VIEW */}
                <EDSideMenuHeader
                    userDetails={this.props.userDetails}
                    onProfilePressed={this.onProfilePressed} />
                {/* TOGGLE SWITCH VIEW  */}
                <View style={style.toggleContainer}>
                    <EDRTLView style={{ alignItems: 'center', paddingVertical: 15 }}>

                        {/* SWITCH */}
                        <ToggleSwitch
                            label={strings("showActive")}
                            containerStyle={{ flexDirection: isRTLCheck() ? "row-reverse" : 'row' }}
                            isRTL={isRTLCheck()}
                            labelStyle={style.switchText}
                            isOn={this.state.isActive}
                            onColor={EDColors.primary}
                            offColor={EDColors.white}
                            trackOffStyle={{ borderWidth: 2, width: 45, borderColor: EDColors.primary }}
                            trackOnStyle={{ borderWidth: 2, width: 45, borderColor: EDColors.primary, backgroundColor: EDColors.palePrimary }}
                            onToggle={this._toggleSwitchActive}
                            size={'small'}
                            icon={
                                <View style={{ height: 12, width: 12, borderRadius: 6, borderWidth: 2, borderColor: EDColors.primary, backgroundColor: EDColors.primary }} />
                            }
                        // style={{}}
                        />
                    </EDRTLView>
                </View>
                {/* SIDE MENU ITEMS LIST */}
                <View style={style.navItemContainer}>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={this.arrayFinalSideMenu}
                        extraData={this.state}
                        keyExtractor={(item, index) => item + index}
                        renderItem={this.renderSideMenuItem}
                    />
                </View>

                {/* Vikrant 20-07-21 */}
                <EDRTLView style={{ alignItems: 'center', width: "100%", marginBottom: 15 + (Platform.OS == "ios" ? initialWindowMetrics.insets.bottom : 0), marginHorizontal: isRTLCheck() ? -15 : 25 }}>
                    <Image source={Assets.bg_version} style={{ height: 24, width: 24 }} resizeMode={'contain'} />
                    <Text style={{ fontFamily: EDFonts.medium, fontSize: getProportionalFontSize(14), color: 'rgba(0, 0, 0, 0.4)', marginHorizontal: 5 }}>{strings("version") + " " + deviceInfoModule.getVersion()}</Text>
                </EDRTLView>
            </View>
        );
    }
    //#endregion

    //#region HELPER FUNCTIONS
    /** SETUP SIDE MENU ITEMS */
    setupSideMenuData = () => {
        return [
          // vikrant 20-07-21
            { route: 'Home', screenName: strings('homeTitle'), icon: "home", iconType: 'simple-line-icon' },
            { route: 'myEarning', screenName: strings('myEarning'), icon: "wallet-outline", iconType: 'ionicon', iconSize: 22 },
        ];
    };

    /**
     *
     * @param {The side menu item to render from this.arrayFinalSideMenu} sideMenuItem
     */
    renderSideMenuItem = (sideMenuItem) => {
        let isSelected = this.props.titleSelected === this.arrayFinalSideMenu[sideMenuItem.index].screenName;
        return <EDSideMenuItem
            totalEarning={this.props.totalEarning}
            currency={this.props.currencySymbol}
            lan={this.props.lan}
            isSelected={isSelected} onPressHandler={this.onPressHandler} item={sideMenuItem.item} index={sideMenuItem.index} />;
    }

    //#region BUTTON/TAP EVENTS

    /**
     *
     * @param {The item selected by the user from the list. Unused for now, so having _ as prefix} _selectedItem
     * @param {The index of item selected by the user} selectedIndex
     */
    onPressHandler = (_selectedItem, selectedIndex) => {

        // CLOSE DRAWER
        if (this.arrayFinalSideMenu[selectedIndex].screenName !== strings('logout')) {
            this.props.navigation.closeDrawer();
        }

        // LOGOUT
        if (this.arrayFinalSideMenu[selectedIndex].screenName === strings('logout')) {


            showDialogue(
                strings('logoutConfirm'),
                strings('appName'),

                [{ text: strings('cancel'), onPress: () => this.props.navigation.closeDrawer() }],
                () => { this.callLogoutAPI() }
                ,
                strings('logout'),
                "warning",
                true
            );
        }



        // CHANGE CENTER SCREEN
        else {
            // SAVE SELECTED ITEM IN REDUX
            this.props.saveNavigationSelection(this.arrayFinalSideMenu[selectedIndex].screenName);

            // CHANGE MAIN SCREEN
            this.props.navigation.navigate(this.arrayFinalSideMenu[selectedIndex].route, { routeParams: this.arrayFinalSideMenu[selectedIndex] });
        }
    }

    /** PROFILE DETAILS TAP EVENT */
    onProfilePressed = () => {
        this.props.navigation.closeDrawer();
        this.props.navigation.navigate('MyProfile');

    }


    //#endregion

    //#region NETWORK

    /** LOGOUT API CALL */
    callLogoutAPI = () => {
        // CHECK INTERNET STATUS
        netStatus(isConnected => {
            if (isConnected) {
                // LOGOUT PARAMS
                const logoutParams = {
                    user_id: this.props.userDetails.UserID,
                    language_slug: this.props.lan,
                };
                // LOGOUT CALL
                this.setState({ isLoading: true });
                logoutUser(logoutParams, this.onLogoutSuccess, this.onLogoutFailure, this.props);
            } else {
                showNoInternetAlert();
            }
        });
    }

    /**
     *
     * @param {The success object returned in logout API response} _objSuccess
     */
    onLogoutSuccess = (_objSuccess) => {

        this.props.navigation.closeDrawer();

        const selectedLanguage = this.props.lan;
        BackgroundGeolocation.checkStatus(status => {
            if (status.isRunning) {
                BackgroundGeolocation.stop()
                fetchBackgroundLocationStop()
            }
        });
        // CLEAR USER DETAILS IN REDUX
        this.props.saveUserDetailsInRedux({});
        this.props.saveLanguageRedux(selectedLanguage);

        // SAVE SELECTED ITEM IN REDUX
        this.props.saveNavigationSelection(this.arrayFinalSideMenu[0].screenName);

        // CLEAR USER DETAILS FROM ASYNC STORE
        flushAllData(
            _response => {

                // MAINTAIN THE SELECTED LANGUAGE IN ASYNC STORE
                saveLanguage(selectedLanguage, _successSaveLanguage => { }, _error => { });

                // TAKE THE USER TO INITIAL SCREEN
                this.props.navigation.popToTop();
                this.props.navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'splash' }]
                    })
                    // StackActions.reset({
                    //     index: 0,
                    //     actions: [
                    //         NavigationActions.navigate({ routeName: 'splash' }),
                    //     ],
                    // })
                );
            },
            _error => { }
        );

        // DISMISS LOGOUT DIALOGUE
        this.setState({ isLoading: false });
    }

    /**
     *
     * @param {The failure response object returned in logout API} _objFailure
     */
    onLogoutFailure = _objFailure => {
        // DISMISS LOGOUT DIALOGUE
        showTopDialogue(_objFailure.message || '', true);
        this.setState({ isLoading: false });
    }
}

const style = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: EDColors.white },
    navItemContainer: { flex: 5, paddingBottom: 20, marginTop: 5 },
    toggleContainer: { paddingHorizontal: 10, backgroundColor: '#F6F6F6', justifyContent: 'center' },
    switchText: { flex: 1, color: EDColors.black, fontFamily: EDFonts.semiBold, fontSize: getProportionalFontSize(16) }
});

export default connect(
    state => {
        return {
            titleSelected: state.navigationReducer.selectedItem,
            totalEarning: state.userOperations.totalEarning,
            currencySymbol: state.userOperations.currencySymbol,
            userDetails: state.userOperations.userData || {},
            isLoggedIn: state.userOperations.isLoggedIn,
            lan: state.userOperations.lan,
            arrayCMSPages: state.userOperations.arrayCMSData,
            status: state.userOperations.activeStatus,


        };
    },
    dispatch => {
        return {
            saveNavigationSelection: dataToSave => {
                dispatch(saveNavigationSelection(dataToSave));
            },
            saveUserDetailsInRedux: detailsToSave => {
                dispatch(saveUserDetailsInRedux(detailsToSave));
            },
            saveLanguageRedux: language => {
                dispatch(saveLanguageInRedux(language));
            },
            saveStatus: dataStatus => {
                dispatch(saveOnlineStatus(dataStatus))
            }
        };
    }
)(SideBar);
