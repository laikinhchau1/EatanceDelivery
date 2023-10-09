import React from 'react';
import { AppState, Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { default as i18n, default as I18n } from "i18n-js";
import { PERMISSIONS } from 'react-native-permissions';
import RNRestart from 'react-native-restart';
import { connect } from 'react-redux';
import EDLanguageSelect from '../components/EDLanguageSelect';
import EDOrdersViewFlatList from '../components/EDOrdersViewFlatList';
import EDPlaceholderComponent from '../components/EDPlaceholderComponent';
import EDPopupView from '../components/EDPopupView';
import EDTopTabBar from '../components/EDTopTabBar';
import { strings } from '../locales/i18n';
import { saveNavigationSelection } from "../redux/actions/Navigation";
import { saveCurrencySymbol, saveEarningInRedux, saveLanguageInRedux, saveUserFCMInRedux } from "../redux/actions/User";
import { getLanguage, saveLanguage } from '../utils/AsyncStorageHelper';
import { fetchBackgroundLocationServices, fetchBackgroundLocationStop } from '../utils/BackgroundLocationServicesManager';
import { showNoInternetAlert } from '../utils/EDAlert';
import { EDColors } from '../utils/EDColors';
import { debugLog, getProportionalFontSize, GOOGLE_API_KEY, isRTLCheck } from '../utils/EDConstants';
import { EDFonts } from '../utils/EDFontConstants';
import { checkFirebasePermission } from '../utils/FirebaseServices';
import { getCurrentLocation } from '../utils/LocationServiceManager';
import Metrics from '../utils/metrics';
import { netStatus } from '../utils/NetworkStatusConnection';
import { checkPermission } from '../utils/PermissionManager';
import { getAllOrders, updateDeviceTokenAPI, updateDriverLocation, userLanguage } from '../utils/ServiceManager';
import BaseContainer from './BaseContainer';
import NavigationEvents from '../components/NavigationEvents';
import Context from '../../Context';

class HomeContainer extends React.Component {

  //#region LIFECYCLE METHODS
  static contextType = Context
  constructor(props) {
    super(props);
    this.userDetails = this.props.userData;
    this.strCurrentOrdersTitle = '';
    this.strCurrentOrdersSubtitle = '';
    this.strPastOrdersTitle = '';
    this.strPastOrdersSubtitle = '';
    this.arrayCurrentOrders = [];
    this.arrayPastOrders = undefined;
    this.refreshing = false,
      this.isRefresh = 0;
  }

  /** STATE */
  state = {
    isLoading: false,
    isLoadingPastOrders: false,
    appState: AppState.currentState,
    selectedIndex: 0,
    languageModal: false,
    value: '',
    isRefresh: 0
  };

  componentDidMount() {
    this.locationUpdateHandler()
    this.getLanguageFromAsync()
    AppState.addEventListener('change', this._handleAppStateChange);
    // this.setState({isRefresh : this.context.isRefresh})
    this.isRefresh = this.context.isRefresh
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  componentDidUpdate(nextProps, nextState) {
    if (this.context.isRefresh !== this.isRefresh) {
      this.isRefresh = this.context.isRefresh
      this.strCurrentOrdersTitle = '';
      this.strCurrentOrdersSubtitle = '';
      this.strPastOrdersTitle = '';
      this.strPastOrdersSubtitle = '';
      this.refreshing = false
      this.arrayPastOrders = []
      this.arrayCurrentOrders = []
      this.callAllOrderAPI()
    }
  }


  getLanguageFromAsync = () => {
    getLanguage(languageSelected => {
      var languageToSave = languageSelected || 'en'
      this.setUserLanguage(languageToSave)

    },
      _err => {
        var languageToSave = 'en'
        this.setUserLanguage(languageToSave)

      })
  }

  onConnectionChangeHandler = () => {
    this.callAllOrderAPI()
    // this.callPastOrderAPI()
  }

  /**
  *
  * @param {The call API for get Product data}
  */
  setUserLanguage = (lan) => {
    netStatus(status => {
      if (status) {
        let objUserLanguageParams = {
          user_id: this.userDetails.UserID,
          language_slug: lan,
        };

        userLanguage(
          objUserLanguageParams,
          this.onSuccessUserLanguage,
          this.onFailureUserLanguage,
          this.props,
        )
      }
      else
        showNoInternetAlert()
    })
  }

  //#region NETWORK METHODS
  /**
  *
  * @param {The success response object} objSuccess
  */
  onSuccessUserLanguage = (onSuccess) => {


  }

  /**
  *
  * @param {The failure response object} objFailure
  */
  onFailureUserLanguage = (onFailure) => {

  }
  //#region


  //#region APP STATE
  /**
   * @param { nextAppState for GPS } nextAppState
   */
  _handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      this.locationUpdateHandler()
    }
    this.setState({ appState: nextAppState });
  };
  //#endregion

  locationUpdateHandler = () => {
    var paramPermission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    checkPermission(paramPermission,
      () => {
        this.didFocusEventHandler()
      },
      () => {
      })
  }

  // //#region TRACKING DRIVER LOCATION
  didFocusEventHandler = () => {

    getCurrentLocation(
      GOOGLE_API_KEY,
      onSuccessResponse => {

        this.driverTracking(
          onSuccessResponse.latitude,
          onSuccessResponse.longitude,
        );
      },
      onFailureResponse => {

      }
    )
  };
  // //#endregion

  //#region CHANGE API TOKEN
  updateDeviceToken = () => {
    netStatus(isConnectedToNetwork => {
      if (isConnectedToNetwork) {
        let params = {
          user_id: this.userDetails.UserID,
          firebase_token: this.props.token,
          language_slug: this.props.lan
        };
        updateDeviceTokenAPI(params, this.onSuccessToken, this.onFailureToken, this.props);
      }
    })
  };

  onSuccessToken = () => {
  };

  onFailureToken = () => {
  };
  //#endregion

  //#region TRACK DRIVER LOCATION
  /**
   * @param { latitude cordinate for traking } latitude
   * @param { longitude cordinate for traking } longitude
   */
  driverTracking = (latitude, longitude) => {
    netStatus(status => {
      if (status) {
        let param = {
          user_id: this.userDetails.UserID,
          latitude: latitude,
          longitude: longitude,
          language_slug: this.props.lan

        };
        updateDriverLocation(param, this.onSuccessTracking, this.onFailureTracking, this.props);
      } else {
        this.strCurrentOrdersSubtitle = strings('noInternet');
        this.strCurrentOrdersTitle = strings('noInternetTitle')
        this.strPastOrdersSubtitle = strings('noInternet');
        this.strPastOrdersTitle = strings('noInternetTitle')
      }
    });
  };

  onSuccessTracking = () => {
  };
  onFailureTracking = () => {
  };


  //#region 

  /**
   *  Button Menu Pressed
   */

  buttonMenuPressed = () => {
    this.props.navigation.openDrawer();
  }

  /**
        * LANGUAGE CHANGE PRESSED
        */
  _onChangeLanguagePressed = () => {
    this.setState({ languageModal: true })
  }

  /** RENDER LANGUAGE CHANGE DIALOGUE */
  renderLanguageSelectDialogue = () => {
    return (
      <EDPopupView isModalVisible={this.state.languageModal}>
        <EDLanguageSelect
          languages={this.props.arrayLanguages}
          lan={this.props.lan}
          onChangeLanguageHandler={this.onChangeLanguageHandler}
          onDismissHandler={this.onDismissHandler}
          title={strings('chooseLanguage')}
        />
      </EDPopupView>
    )
  }
  //#endregion

  onDismissHandler = () => {
    this.setState({ languageModal: false })
  }

  //#region LANGUAGE CHANGE BUTTON EVENTS
  onChangeLanguageHandler = (language) => {
    this.setState({ languageModal: false })

    let lan = I18n.currentLocale();
    switch (language) {
      case 0: {
        lan = "en";
        I18n.locale = "en";
        break;
      }
      case 1: {
        lan = "fr";
        I18n.locale = "fr";
        break;
      }
      case 2: {
        lan = "ar";
        I18n.locale = "ar";
        break;
      }
    }
    this.props.saveLanguageRedux(lan);
    saveLanguage
      (
        lan,
        success => {
          RNRestart.Restart();
        },
        error => { }
      );


  }
  //#endregion


  //#endregion

  // Navigation Events

  onWillFocusHomeContainer = () => {
    this.props.saveNavigationSelection(strings("homeTitle"))
    this.setState({ selectedIndex: 0 })
    this.scrollViewOrders.scrollTo({
      x: 0,
      y: 0,
      animated: true,
    });
    this.arrayCurrentOrders = undefined;
    this.arrayPastOrders = undefined;
    this.callAllOrderAPI();
    // this.callPastOrderAPI();
    checkFirebasePermission(
      onSucces => {
        this.props.saveToken(onSucces)
        this.updateDeviceToken();
      },
      () => {
      }
    )

  }


  /** NETWORK API FOR ORDERS */
  callAllOrderAPI = () => {
    this.strCurrentOrdersTitle = '';
    this.strCurrentOrdersSubtitle = '';
    this.strPastOrdersSubtitle = ''
    this.strPastOrdersTitle = ''
    this.arrayCurrentOrders = [];
    this.arrayPastOrders = [];

    netStatus(isConnectedToNetwork => {
      if (isConnectedToNetwork) {
        let params = {
          user_id: this.userDetails.UserID,
          language_slug: this.props.lan

        };
        this.setState({ isLoading: true });
        getAllOrders(params, this.onGetAllOrderSuccess, this.onGetAllOrderFailure, this.props)
      } else {
        this.arrayCurrentOrders = [];
        this.arrayPastOrders = []
        this.strCurrentOrdersTitle = strings('noInternetTitle');
        this.strCurrentOrdersSubtitle = strings('noInternet');
        this.strPastOrdersTitle = strings('noInternetTitle');
        this.strPastOrdersSubtitle = strings('noInternet');
        this.setState({ isLoading: false })
      }
    })
  };

  /**
     * @param {The success response object} objSuccess
     */
  onGetAllOrderSuccess = objSuccess => {
    this.strCurrentOrdersTitle = strings('noCurrentOrder');
    this.strCurrentOrdersSubtitle = strings('noCurrentOrderSubtitle');
    this.arrayCurrentOrders = [];
    this.strPastOrdersTitle = strings('noPastOrder');
    this.strPastOrdersSubtitle = strings('noPastOrderSubtitle');
    this.arrayPastOrders = [];
    console.log("eanings::" , objSuccess.data)
    if (objSuccess.data.total_earning !== undefined &&
      objSuccess.data.total_earning !== null &&
      objSuccess.data.total_earning !== "" &&
      objSuccess.data.total_earning !== "0.00"
    ) {
      this.props.saveTotalEarning(objSuccess.data.total_earning)
    }
    this.props.saveCurrency(objSuccess.data.currency)

    // CURRENT ORDERS ARRAY
    if (objSuccess.data.order_list !== undefined && objSuccess.data.order_list.current.length !== 0) {
      this.onGoingOrders = objSuccess.data.order_list.current.filter(items => {
        return items.order_status !== undefined && items.order_status.toLowerCase() == "ongoing"
      })
      this.arrayCurrentOrders = objSuccess.data.order_list.current;
      if (this.onGoingOrders.length !== 0) {
        fetchBackgroundLocationServices(
          onCurrentLocation => {
            this.driverTracking(
              onCurrentLocation.latitude,
              onCurrentLocation.longitude,
            );
          },
          onBackgroundLocation => {
            this.driverTracking(
              onBackgroundLocation.latitude,
              onBackgroundLocation.longitude,
            );
          },
          () => { }
        )
      } else {
        fetchBackgroundLocationStop()
      }
    } else {
      fetchBackgroundLocationStop()
      this.strCurrentOrdersTitle = strings('noCurrentOrder');
      this.strCurrentOrdersSubtitle = strings('noCurrentOrderSubtitle');
    }

    // PAST ORDER ARRAY 
    if (this.arrayPastOrders === undefined) {
      this.arrayPastOrders = []
    }


    // PAST ORDERS ARRAY
    if (objSuccess.data.order_list !== undefined && objSuccess.data.order_list.past.length > 0) {
      this.arrayPastOrders = objSuccess.data.order_list.past || []
    }


    this.setState({ isLoading: false });
  };

  /**
   * @param {The failure response object} objFailure
   */
  onGetAllOrderFailure = objFailure => {
    fetchBackgroundLocationStop()
    this.strCurrentOrdersTitle = objFailure.message
    this.strCurrentOrdersSubtitle = ''
    this.strPastOrdersTitle = objFailure.message
    this.strCurrentOrdersSubtitle = ''
    this.setState({ isLoading: false });
  };

  handleIndexChange = segmentIndex => {
    this.setState({ selectedIndex: segmentIndex });
    this.scrollViewOrders.scrollTo({
      x: Metrics.screenWidth * segmentIndex,
      y: 0,
      animated: true,
    });
  }

  onPullToRefreshHandler = () => {
    this.strCurrentOrdersTitle = '';
    this.strCurrentOrdersSubtitle = '';
    this.strPastOrdersTitle = '';
    this.strPastOrdersSubtitle = '';
    this.refreshing = false
    this.arrayPastOrders = []
    this.arrayCurrentOrders = []
    this.callAllOrderAPI()
  }

  /** CURRENT ORDER TAB */
  renderCurrentOrder = () => {
    return this.arrayCurrentOrders !== undefined && this.arrayCurrentOrders.length > 0 ? (
      <EDOrdersViewFlatList
        style={styles.flatlistContainer}
        arrayOrders={this.arrayCurrentOrders}
        onPressHandler={this.navigateToCurrentOrderDetails}
        onPullToRefreshHandler={this.onPullToRefreshHandler}

      />
    ) : (this.strCurrentOrdersTitle || '').trim().length > 0 ? (
      <View>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={this.refreshing || false}
              titleColor={EDColors.textAccount}
              title={strings("refresh")}
              tintColor={EDColors.textAccount}
              colors={[EDColors.textAccount]}
              onRefresh={this.onPullToRefreshHandler}
            />
          }>
          <EDPlaceholderComponent
            title={this.strCurrentOrdersTitle}
            subTitle={this.strCurrentOrdersSubtitle}
          />
        </ScrollView>
      </View>
    ) : null;
  };

  navigateToCurrentOrderDetails = (currentOrderDetails) => {
    this.props.navigation.navigate('CurrentOrderContainer', { currentOrder: currentOrderDetails });
  }

  /** PAST ORDERS TAB */
  renderPastOrders = () => {
    return this.arrayPastOrders !== undefined && this.arrayPastOrders.length > 0 ? (
      <EDOrdersViewFlatList
        style={styles.flatlistContainer}
        arrayOrders={this.arrayPastOrders}
        onPressHandler={this.navigateToEarningsContainer}
        onPullToRefreshHandler={this.onPullToRefreshHandler}
      />
    ) : (this.strPastOrdersTitle || '').trim().length > 0 ? (
      <View>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={this.refreshing || false}
              title={strings("refresh")}
              titleColor={EDColors.textAccount}
              tintColor={EDColors.textAccount}
              colors={[EDColors.textAccount]}
              onRefresh={this.onPullToRefreshHandler}
            />
          }
        >
          <EDPlaceholderComponent
            title={this.strPastOrdersTitle}
            subTitle={this.strPastOrdersSubtitle}
          />
        </ScrollView>
      </View>
    ) : null;
  };


  navigateToEarningsContainer = () => {
    this.props.navigation.navigate('myEarningFromHome');
  }


  //#region  RENDER
  render() {
    return (
      <BaseContainer
        title={strings('homeTitle')}
        left={'menu'}
        onLeft={this.buttonMenuPressed}
        right={this.props.arrayLanguages.length > 1 ? 'language' : null}
        iconFamily={"material"}
        loading={this.state.isLoading}
        onRight={this.props.arrayLanguages.length > 1 ? this._onChangeLanguagePressed : null}
        availabilityStatus={this.props.status}
        navigationProps={this.props}
      >
        {/* <NavigationEvents onWillFocus={this.onWillFocusHomeContainer} /> */}
        <NavigationEvents
          onFocus={this.onWillFocusHomeContainer}
          navigationProps={this.props}
        />

        {this.renderLanguageSelectDialogue()}
        <View style={{ flex: 1 }}>



          {/* VIKRANT 20-07-21 */}
          <EDTopTabBar
            data={[{ title: strings("currentOrders"), onPress: this.handleIndexChange, index: 0 },
            { title: strings("pastOrder"), onPress: this.handleIndexChange, index: 1 }]}
            selectedIndex={this.state.selectedIndex}
          />
          <View style={styles.parentContaier}>

            <ScrollView
              contentContainerStyle={styles.scrollContent, {
                flexDirection: isRTLCheck() ? "row" : "row"
              }}
              scrollEnabled={false}
              ref={scrollView => (this.scrollViewOrders = scrollView)}
              bounces={false}
              pagingEnabled={true}
              showsHorizontalScrollIndicator={false}
              horizontal={true}>


              {this.renderCurrentOrder()}
              {this.renderPastOrders()}
            </ScrollView>
          </View>
        </View>
      </BaseContainer>
    )
  }

  //#endregion
}

export default connect(
  state => {
    return {
      userData: state.userOperations.userData,
      isLogout: state.userOperations.isLogout,
      token: state.userOperations.token,
      lan: state.userOperations.lan,
      arrayLanguages: state.userOperations.arrayLanguages,
      status: state.userOperations.activeStatus,


    };
  },
  dispatch => {
    return {
      saveNavigationSelection: dataToSave => {
        dispatch(saveNavigationSelection(dataToSave));
      },
      saveLanguageRedux: language => {
        dispatch(saveLanguageInRedux(language));
      },
      saveToken: token => {
        dispatch(saveUserFCMInRedux(token))
      },
      saveTotalEarning: token => {
        dispatch(saveEarningInRedux(token))
      },
      saveCurrency: token => {
        dispatch(saveCurrencySymbol(token))
      }
    };
  }
)(HomeContainer);

const styles = StyleSheet.create({
  parentContaier: {
    flex: 1,

  },
  scrollContent: { backgroundColor: EDColors.offWhite, paddingBottom: 10 },
  flatlistContainer:
  {
    width: Metrics.screenWidth, //Vikrant 20-07-21
    paddingHorizontal: 15,   //Vikrant 20-07-21
  },
  scrollContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: Metrics.screenWidth,
  },
  tabStyle: { borderColor: EDColors.primary, height: 40 },
  tabTextStyle: { color: EDColors.primary, fontFamily: EDFonts.regular, fontSize: getProportionalFontSize(16) },

})