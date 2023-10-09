
export const TYPE_SAVE_LOGIN_DETAILS = "TYPE_SAVE_LOGIN_DETAILS"
export function saveUserDetailsInRedux(details) {
    return {
        type: TYPE_SAVE_LOGIN_DETAILS,
        value: details
    }
}

export const TYPE_SAVE_LOGIN_FCM = "TYPE_SAVE_LOGIN_FCM"
export function saveUserFCMInRedux(details) {
    return {
        type: TYPE_SAVE_LOGIN_FCM,
        value: details
    }
}

export const TYPE_SAVE_LANGUAGE = "TYPE_SAVE_LANGUAGE";
export function saveLanguageInRedux(data) {
    return {
        type: TYPE_SAVE_LANGUAGE,
        value: data
    };
}

export const TYPE_SAVE_LANGUAGE_ARRAY = "TYPE_SAVE_LANGUAGE_ARRAY";
export function saveLanguageArrayInRedux(data) {
    return {
        type: TYPE_SAVE_LANGUAGE_ARRAY,
        value: data
    };
}

export const TYPE_SAVE_APP_VERSION = "TYPE_SAVE_APP_VERSION";
export function saveAppVersionInRedux(data) {
    return {
        type: TYPE_SAVE_APP_VERSION,
        value: data
    };
}

export const TYPE_SAVE_UPDATE_PROMPT = "TYPE_SAVE_UPDATE_PROMPT";
export function saveAppUpdatePrompt(data) {
    return {
        type: TYPE_SAVE_UPDATE_PROMPT,
        value: data
    };
}






export const TYPE_SAVE_COUNTRY_CODE = "TYPE_SAVE_COUNTRY_CODE"
export function saveCountryCodeInRedux(details) {
    return {
        type: TYPE_SAVE_COUNTRY_CODE,
        value: details
    }
}

export const TYPE_REMEMBER_LOGIN = "TYPE_REMEMBER_LOGIN";
export function rememberLoginInRedux(data) {
    return {
        type: TYPE_REMEMBER_LOGIN,
        value: data
    };
}

export const SAVE_CMS_PAGES_DATA = "SAVE_CMS_PAGES_DATA";
export function saveCMSPagesData(data) {
    return {
        type: SAVE_CMS_PAGES_DATA,
        value: data
    };
}

export const SAVE_ALERT_DATA = "SAVE_ALERT_DATA";
export function saveAlertData(data) {
    return {
        type: SAVE_ALERT_DATA,
        value: data
    };
}

export const SAVE_STATUS = "SAVE_STATUS"
export function saveOnlineStatus(data) {
    return {
        type: SAVE_STATUS,
        value: data
    }
}

export const TYPE_SAVE_COUNTRY_DATA = "TYPE_SAVE_COUNTRY_DATA";
export function saveCountryDataInRedux(data) {
    return {
        type: TYPE_SAVE_COUNTRY_DATA,
        value: data
    };
}

export const TYPE_SAVE_EARNING = "TYPE_SAVE_EARNING";
export function saveEarningInRedux(data) {
    return {
        type: TYPE_SAVE_EARNING,
        value: data
    };
}

export const SAVE_CURRENCY_SYMBOL = "SAVE_CURRENCY_SYMBOL";
export function saveCurrencySymbol(data) {
    return {
        type: SAVE_CURRENCY_SYMBOL,
        value: data
    };
}