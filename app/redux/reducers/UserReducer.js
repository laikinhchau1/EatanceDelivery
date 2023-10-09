import { SAVE_ALERT_DATA, SAVE_CMS_PAGES_DATA, SAVE_STATUS, TYPE_REMEMBER_LOGIN, TYPE_SAVE_COUNTRY_CODE, TYPE_SAVE_LANGUAGE, TYPE_SAVE_LANGUAGE_ARRAY, TYPE_SAVE_LOGIN_DETAILS, TYPE_SAVE_LOGIN_FCM, TYPE_SAVE_COUNTRY_DATA, TYPE_SAVE_APP_VERSION, TYPE_SAVE_UPDATE_PROMPT, TYPE_SAVE_EARNING, SAVE_CURRENCY_SYMBOL } from "../actions/User";

const initialStateUser = {
  // LOGIN DETAILS
  isLoginRemembered: false,
  arrayCMSData: [],
  arrayLanguages: [],
  userData: {},
  alertData: {},
  activeStatus: false,
  countryData: [],
  appVersion: {},
  updatePrompt: false,
  totalEarning: undefined,
  currencySymbol: ""
};

export function userOperations(state = initialStateUser, action) {
  switch (action.type) {
    case TYPE_SAVE_LOGIN_DETAILS: {
      return Object.assign({}, state, {
        userData: action.value
      });
    }
    case TYPE_SAVE_LANGUAGE: {
      return Object.assign({}, state, {
        lan: action.value
      });
    }
    case TYPE_SAVE_LANGUAGE_ARRAY: {
      return Object.assign({}, state, {
        arrayLanguages: action.value
      });
    }


    case TYPE_SAVE_LOGIN_FCM: {
      return Object.assign({}, state, {
        token: action.value
      });
    }
    case TYPE_SAVE_COUNTRY_CODE: {
      return Object.assign({}, state, {
        code: action.value
      });
    }
    case TYPE_SAVE_APP_VERSION: {
      return Object.assign({}, state, {
        appVersion: action.value
      });
    }

    case TYPE_SAVE_UPDATE_PROMPT: {
      return Object.assign({}, state, {
        updatePrompt: action.value
      });
    }
    case TYPE_REMEMBER_LOGIN: {
      return Object.assign({}, state, {
        isLoginRemembered: action.value
      });
    }

    case SAVE_CMS_PAGES_DATA: {
      return Object.assign({}, state, {
        arrayCMSData: (action.value)
      });
    }

    case SAVE_ALERT_DATA: {
      return Object.assign({}, state, {
        alertData: (action.value)
      });
    }
    case SAVE_STATUS: {
      return Object.assign({}, state, {
        activeStatus: action.value
      });
    }

    case TYPE_SAVE_COUNTRY_DATA: {
      return Object.assign({}, state, {
        countryData: action.value
      });
    }

    case TYPE_SAVE_EARNING: {
      return Object.assign({}, state, {
        totalEarning: action.value
      });

    } case SAVE_CURRENCY_SYMBOL: {
      return Object.assign({}, state, {
        currencySymbol: action.value
      });
    }

    default:
      return state;
  }
}
