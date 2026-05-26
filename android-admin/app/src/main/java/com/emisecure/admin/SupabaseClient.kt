package com.emisecure.admin

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.Auth
import io.github.jan.supabase.postgrest.Postgrest

/**
 * Singleton configuration layer for Phoneworld's Admin Portal.
 * Initializes Supabase plugins required for onboarding, lock tracking, and real-time.
 */
object SupabaseClientProvider {

    // Configure credentials matching your unique Supabase Project Dashboard
    private const val SUPABASE_URL = "https://your-project-id.supabase.co"
    private const val SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here"

    /**
     * Instantiates the modular Kotlin Supabase client with:
     * - GoTrue / Auth: Admin-agent authorization and sessions management
     * - Postgrest: Querying device onboarding records from live tables
     */
    val client: SupabaseClient by lazy {
        createSupabaseClient(
            supabaseUrl = SUPABASE_URL,
            supabaseKey = SUPABASE_ANON_KEY
        ) {
            install(Auth)
            install(Postgrest)
        }
    }
}
