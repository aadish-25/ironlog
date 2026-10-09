package com.ironlog.app;

import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import ee.forgr.capacitor.social.login.ModifiedMainActivityForSocialLoginPlugin;

public class MainActivity extends BridgeActivity implements ModifiedMainActivityForSocialLoginPlugin {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        setTheme(R.style.AppTheme_NoActionBar);
        super.onCreate(savedInstanceState);

        int brandBgColor = Color.parseColor("#0F0F0F");
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().setBackgroundColor(brandBgColor);
        }

        Window window = getWindow();

        // Disable contrast scrim that Android paints over status bar and navigation bar
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            window.setStatusBarContrastEnforced(false);
            window.setNavigationBarContrastEnforced(false);
        }

        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);


        window.setStatusBarColor(brandBgColor);
        window.setNavigationBarColor(brandBgColor);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            window.setNavigationBarDividerColor(brandBgColor);
        }

        // Set matching brand background on window and decor view
        window.setBackgroundDrawable(new ColorDrawable(brandBgColor));
        window.getDecorView().setBackgroundColor(brandBgColor);

        // Ensure status bar and navigation bar icons/gestures are light (white) on the dark background
        WindowInsetsControllerCompat insetsController = WindowCompat.getInsetsController(window, window.getDecorView());
        if (insetsController != null) {
            insetsController.setAppearanceLightStatusBars(false);
            insetsController.setAppearanceLightNavigationBars(false);
        }

        // Pad the root content view by status bar height so WebView starts strictly below the notification bar
        View contentView = findViewById(android.R.id.content);
        if (contentView != null) {
            contentView.setBackgroundColor(brandBgColor);
            ViewCompat.setOnApplyWindowInsetsListener(contentView, (v, insets) -> {
                Insets statusBar = insets.getInsets(WindowInsetsCompat.Type.statusBars());
                v.setPadding(0, statusBar.top, 0, 0);
                return WindowInsetsCompat.CONSUMED;
            });
        }
    }

    @Override
    public void onActionModeStarted(android.view.ActionMode mode) {
        if (mode != null && mode.getType() == android.view.ActionMode.TYPE_FLOATING) {
            mode.finish();
            return;
        }
        super.onActionModeStarted(mode);
    }

    @Override
    public void IHaveModifiedTheMainActivityForTheUseWithSocialLoginPlugin() {}
}
