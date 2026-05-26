package com.emisecure.admin

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.emisecure.admin.ui.auth.LoginScreen
import com.emisecure.admin.ui.scanner.OnboardingScannerScreen
import com.emisecure.admin.ui.theme.EMISecureAdminTheme

/**
 * Main application EntryPoint for Phoneworld EMI Onboarding system.
 * Governs active admin operator states and binds Jetpack Compose surface.
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            EMISecureAdminTheme {
                var signedInUsername by remember { mutableStateOf<String?>(null) }

                Surface(
                    modifier = Modifier.fillMaxSize()
                ) {
                    if (signedInUsername == null) {
                        LoginScreen(
                            onLoginSuccess = { username ->
                                signedInUsername = username
                            }
                        )
                    } else {
                        OnboardingScannerScreen(
                            adminUsername = signedInUsername!!,
                            onLogout = {
                                signedInUsername = null
                            }
                        )
                    }
                }
            }
        }
    }
}
