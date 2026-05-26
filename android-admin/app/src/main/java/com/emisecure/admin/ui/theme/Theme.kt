package com.emisecure.admin.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Visual Brand Theme Colors
val IndigoPrimary = Color(0xFF4F46E5)
val IndigoSecondary = Color(0xFF6366F1)
val SlateBackgroundLight = Color(0xFFF8FAFC)
val CardBackgroundLight = Color(0xFFFFFFFF)
val HeavySlateGray = Color(0xFF0F172A)
val MediumMutedGray = Color(0xFF64748B)

private val LightColorScheme = lightColorScheme(
    primary = IndigoPrimary,
    secondary = IndigoSecondary,
    background = SlateBackgroundLight,
    surface = CardBackgroundLight,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = HeavySlateGray,
    onSurface = HeavySlateGray
)

private val DarkColorScheme = darkColorScheme(
    primary = IndigoSecondary,
    secondary = IndigoPrimary,
    background = HeavySlateGray,
    surface = Color(0xFF1E293B),
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = SlateBackgroundLight,
    onSurface = SlateBackgroundLight
)

@Composable
fun EMISecureAdminTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
