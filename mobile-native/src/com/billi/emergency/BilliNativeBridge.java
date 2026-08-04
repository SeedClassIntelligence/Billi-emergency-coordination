package com.billi.emergency;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.telephony.SmsManager;
import android.webkit.JavascriptInterface;

/**
 * Bridges Billi's existing web app to the one native capability a browser
 * cannot provide: sending a real SMS through this device's own SIM and
 * carrier plan. No gateway, no third-party service - the phone sends it
 * the same way any SMS app would.
 */
public class BilliNativeBridge {

    private final Context context;

    BilliNativeBridge(Context context) {
        this.context = context;
    }

    @JavascriptInterface
    public boolean sendSms(String phoneNumber, String message) {
        if (context.checkSelfPermission(Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) {
            return false;
        }
        try {
            SmsManager smsManager = SmsManager.getDefault();
            java.util.ArrayList<String> parts = smsManager.divideMessage(message);
            if (parts.size() > 1) {
                smsManager.sendMultipartTextMessage(phoneNumber, null, parts, null, null);
            } else {
                smsManager.sendTextMessage(phoneNumber, null, message, null, null);
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @JavascriptInterface
    public boolean isNative() {
        return true;
    }
}
