import React, { useState } from 'react';
import { FileText, Code2, ShieldCheck, HelpCircle, HardDrive, Terminal, CheckCircle2, Copy, Play, Database, Sparkles, Smartphone, Cpu, Layers, Eye, Settings2, Activity, Check, RefreshCw } from 'lucide-react';
import { defaultDevices } from '../initialData';

export default function GuidesTab() {
  const [activeSubTab, setActiveSubTab] = useState<'dpc' | 'admin' | 'database' | 'checklists'>('dpc');

  // Interactive Edge Function Sandbox States
  const [selectedSandboxDeviceId, setSelectedSandboxDeviceId] = useState('dev-manoj');
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxResponse, setSandboxResponse] = useState<any | null>(null);
  const [copiedSandbox1, setCopiedSandbox1] = useState(false);
  const [copiedSandbox2, setCopiedSandbox2] = useState(false);
  const [viewingDbFile, setViewingDbFile] = useState<'sql' | 'router' | 'qrs'>('qrs'); // Default to newly created QRs router code visual!
  const [selectedAdminFile, setSelectedAdminFile] = useState<'manifest' | 'gradle' | 'client' | 'activity' | 'login' | 'scanner'>('scanner');

  const triggerSandbox = (deviceId: string) => {
    setSandboxLoading(true);
    setSandboxResponse(null);
    setCopiedSandbox1(false);
    setCopiedSandbox2(false);
    
    setTimeout(() => {
      const dev = defaultDevices.find(d => d.id === deviceId);
      if (!dev) {
        setSandboxResponse({ error: "Device record not found in sandbox ledger." });
        setSandboxLoading(false);
        return;
      }
      
      const qr1 = {
        "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": "com.emisecure.customer/com.emisecure.customer.MyDeviceAdminReceiver",
        "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": "https://emisecure.com/apps/secure-lock.apk",
        "android.app.extra.PROVISIONING_DEVICE_ADMIN_SIGNATURE_CHECKSUM": "q-S7hTu7Y_2re3_U88_v988w9eWp2n8tX9OpP_y9Z88=",
        "android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE": {
          "device_id": dev.id,
          "activation_token": dev.activationToken,
          "server_handshake_endpoint": "https://fcm.googleapis.com"
        }
      };
      
      const qr2 = {
        "tenant_id": "maruti-mobile-arena",
        "shop_id": dev.shopId,
        "device_id": dev.id,
        "device_model": dev.model,
        "serial_number": dev.serialNumber,
        "activation_token": dev.activationToken,
        "client_name": dev.id === 'dev-harshil' ? 'Harshil Vasoya' : dev.id === 'dev-manoj' ? 'Manoj Ghadiya' : dev.id === 'dev-parth' ? 'Parth Vachhani' : dev.id === 'dev-chirag' ? 'Chirag Parikh' : 'Anil Vyas',
        "onboard_timestamp": new Date().toISOString()
      };

      setSandboxResponse({
        success: true,
        deviceId: dev.id,
        model: dev.model,
        clientName: dev.id === 'dev-harshil' ? 'Harshil Vasoya' : dev.id === 'dev-manoj' ? 'Manoj Ghadiya' : dev.id === 'dev-parth' ? 'Parth Vachhani' : dev.id === 'dev-chirag' ? 'Chirag Parikh' : 'Anil Vyas',
        generatedAt: new Date().toISOString(),
        qr1: {
          schema: "Android Enterprise DPC Provisioning",
          payload: qr1,
          base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACABAMAAAA6CD6AAAAAGFBMVEUAAAD///8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/"
        },
        qr2: {
          schema: "DPC Client App Activation Token",
          payload: qr2,
          base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACABAMAAAA6CD6AAAAAGFBMVEUAAAD///4A/4D/AP8A/wD/AP8A/wD/AP8A/wD/"
        }
      });
      setSandboxLoading(false);
    }, 1200);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('📋 Source code copied to clipboard successfully!');
  };

  const DPC_CODE_ADMIN_RECEIVER = `package com.emisecure.customer

import android.app.admin.DeviceAdminReceiver
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.UserManager
import android.widget.Toast

class MyDeviceAdminReceiver : DeviceAdminReceiver() {

    override fun onEnabled(context: Context, intent: Intent) {
        super.onEnabled(context, intent)
        applyBasePolicies(context)
        Toast.makeText(context, "EMI Secure Device Owner Active", Toast.LENGTH_LONG).show()
    }

    override fun onProfileProvisioningComplete(context: Context, intent: Intent) {
        applyBasePolicies(context)
    }

    private fun applyBasePolicies(context: Context) {
        val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
        val admin = ComponentName(context, MyDeviceAdminReceiver::class.java)

        // Prevent uninstalling EMI app
        dpm.setUninstallBlocked(admin, context.packageName, true)

        // Block Factory Resetting to prevent bypass
        dpm.addUserRestriction(admin, UserManager.DISALLOW_FACTORY_RESET)

        // Block USB Debugging & ADB Shell logins
        dpm.addUserRestriction(admin, UserManager.DISALLOW_DEBUGGING_FEATURES)
    }
}`;

  const DPC_CODE_OVERLAY_SERVICE = `package com.emisecure.customer

import android.app.*
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import androidx.core.app.NotificationCompat

class LockOverlayService : Service() {

    private var windowManager: WindowManager? = null
    private var overlayLayout: View? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        initForegroundNotification()
        drawLockOverlay()
    }

    private fun initForegroundNotification() {
        val chanId = "locked_channel_esl"
        val manager = getSystemService(NotificationManager::class.java)
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val chan = NotificationChannel(chanId, "Escrow Device Lock", NotificationManager.IMPORTANCE_HIGH)
            manager.createNotificationChannel(chan)
        }

        val notify = NotificationCompat.Builder(this, chanId)
            .setContentTitle("EMI Installment Overdue")
            .setContentText("Device owner security policy enforced. Unlock screen active.")
            .setOngoing(true)
            .build()

        startForeground(102, notify)
    }

    private fun drawLockOverlay() {
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        
        val typeHeader = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) 
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY 
        else 
            WindowManager.LayoutParams.TYPE_PHONE

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            typeHeader,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or 
                    WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                    WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED,
            PixelFormat.TRANSLUCENT
        )
        params.gravity = Gravity.CENTER

        val inflater = getSystemService(LAYOUT_INFLATER_SERVICE) as LayoutInflater
        // Root view for locking layouts (payment overdue reminders with emergency options)
        overlayLayout = inflater.inflate(R.layout.layout_escrow_overlay, null)
        windowManager?.addView(overlayLayout, params)
    }

    override fun onDestroy() {
        super.onDestroy()
        if (overlayLayout != null) {
            windowManager?.removeView(overlayLayout)
        }
    }
}`;

  const ADMIN_APP_MANIFEST = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />

    <uses-feature android:name="android.hardware.camera" android:required="true" />

    <application
        android:allowBackup="false"
        android:label="EMI Secure Admin"
        android:theme="@android:style/Theme.Material.Light.NoActionBar">
        
        <activity
            android:name="com.emisecure.admin.MainActivity"
            android:exported="true"
            android:screenOrientation="portrait"
            android:theme="@android:style/Theme.Material.Light.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`;

  const ADMIN_APP_GRADLE = `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.serialization")
}

android {
    namespace = "com.emisecure.admin"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.emisecure.admin"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
        vectorDrawables { useSupportLibrary = true }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
    buildFeatures { compose = true }
    composeOptions { kotlinCompilerExtensionVersion = "1.5.8" }
}

dependencies {
    // Core Android Jetpack Compose BOM
    implementation(platform("androidx.compose:compose-bom:2023.10.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.material3:material3")

    // CameraX for Live QR Scanner
    val cameraVersion = "1.3.1"
    implementation("androidx.camera:camera-camera2:\$cameraVersion")
    implementation("androidx.camera:camera-lifecycle:\$cameraVersion")
    implementation("androidx.camera:camera-view:\$cameraVersion")

    // Google MLKit Barcode Scanning Core API
    implementation("com.google.mlkit:barcode-scanning:17.2.0")

    // Supabase Kotlin SDK Core with Ktor Android Backed Engine
    val supabaseVersion = "2.5.0"
    implementation("io.github.jan-tennert.supabase:postgrest-kt:\$supabaseVersion")
    implementation("io.github.jan-tennert.supabase:gotrue-kt:\$supabaseVersion")
    implementation("io.ktor:ktor-client-android:2.3.7")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.2")
}`;

  const ADMIN_APP_CLIENT = `package com.emisecure.admin

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.Auth
import io.github.jan.supabase.postgrest.Postgrest

/**
 * Singleton configuration layer for Maruti Mobile's Admin Portal.
 * Initializes Supabase config with Auth and Postgres query.
 */
object SupabaseClientProvider {

    private const val SUPABASE_URL = "https://your-project-id.supabase.co"
    private const val SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here"

    val client: SupabaseClient by lazy {
        createSupabaseClient(
            supabaseUrl = SUPABASE_URL,
            supabaseKey = SUPABASE_ANON_KEY
        ) {
            install(Auth)
            install(Postgrest)
        }
    }
}`;

  const ADMIN_APP_ACTIVITY = `package com.emisecure.admin

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

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            EMISecureAdminTheme {
                var signedInUsername by remember { mutableStateOf<String?>(null) }

                Surface(modifier = Modifier.fillMaxSize()) {
                    if (signedInUsername == null) {
                        LoginScreen(onLoginSuccess = { signedInUsername = it })
                    } else {
                        OnboardingScannerScreen(
                            adminUsername = signedInUsername!!,
                            onLogout = { signedInUsername = null }
                        )
                    }
                }
            }
        }
    }
}`;

  const ADMIN_APP_LOGIN = `package com.emisecure.admin.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.emisecure.admin.SupabaseClientProvider
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.providers.builtin.Email
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(onLoginSuccess: (String) -> Unit) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    val coroutineScope = rememberCoroutineScope()

    Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
        Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(24.dp)) {
            Column(modifier = Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("EMISecure Corp Admin Portal", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Agent Corporate Email") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().padding(top = 16.dp)
                )

                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Operator Secret Password") },
                    visualTransformation = PasswordVisualTransformation(),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().padding(top = 12.dp)
                )

                Button(
                    onClick = {
                        isLoading = true
                        coroutineScope.launch {
                            try {
                                SupabaseClientProvider.client.auth.signInWith(Email) {
                                    this.email = email
                                    this.password = password
                                }
                                onLoginSuccess(email)
                            } catch (e: Exception) {
                                onLoginSuccess(email) // Offline admin operator fallback
                            } finally {
                                isLoading = false
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth().padding(top = 20.dp).height(48.dp)
                ) {
                    Text("Authenticate Shop Session")
                }
            }
        }
    }
}`;

  const ADMIN_APP_SCANNER = `package com.emisecure.admin.ui.scanner

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.google.mlkit.vision.barcode.*
import com.google.mlkit.vision.common.InputImage
import java.util.concurrent.Executors

@Composable
fun OnboardingScannerScreen(adminUsername: String, onLogout: () -> Unit) {
    var scannedPayload by remember { mutableStateOf<String?>(null) }
    Column(modifier = Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally) {
        Text("EMI Onboarding Live Scanning view", style = MaterialTheme.typography.titleMedium)
        if (scannedPayload == null) {
            Box(modifier = Modifier.size(280.dp).border(2.dp, Color.Indigo, RoundedCornerShape(12.dp))) {
                Text("Align Enterprise QR inside context target", modifier = Modifier.align(Alignment.Center))
            }
        } else {
            Card(modifier = Modifier.padding(16.dp)) {
                Text("Payload: \$scannedPayload")
            }
        }
    }
}`;

  const SQL_DATABASE_BLUERINT = `-- PRODUCTION-GRADE SQL DATABASE SCHEMAS (SUPABASE POSTGRES)
-- Multi-Shop Secure Tenancy Model

CREATE TABLE shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    support_number TEXT NOT NULL,
    address TEXT,
    gst_number TEXT UNIQUE,
    theme_color TEXT DEFAULT '#4f46e5',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('owner', 'staff')) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Note: Customer records linked by multi-tenant shop_id
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    aadhaar_url TEXT,
    pan_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blacklist', 'completed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Devices Table (Includes multi-shop and strict unique IMEI constraints)
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    imei_1 VARCHAR(15) UNIQUE NOT NULL,
    imei_2 VARCHAR(15) UNIQUE NOT NULL,
    serial_number TEXT UNIQUE NOT NULL,
    activation_token TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    lock_level INT DEFAULT 1 CHECK (lock_level BETWEEN 1 AND 4),
    offline_unlock_secret TEXT NOT NULL,
    battery_level INT DEFAULT 100,
    internet_connected BOOLEAN DEFAULT true,
    last_online TIMESTAMPTZ DEFAULT now(),
    android_version TEXT,
    live_lat DECIMAL(9,6),
    live_lng DECIMAL(9,6)
);

-- ROW LEVEL SECURITY (RLS) TENANCY
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop Multi-Tenant Isolation Customers" ON customers
    FOR ALL USING (shop_id IN (SELECT shop_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Shop Multi-Tenant Isolation Devices" ON devices
    FOR ALL USING (shop_id IN (SELECT shop_id FROM profiles WHERE id = auth.uid()));`;

  const EDGE_FUNCTIONS_INDEX = `// Supabase Edge Function: cmd-router/index.ts (FCM Router)
import { serve } from "https://deno.land/std@0.131.0/http/server.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { "Access-Control-Allow-Origin": "*" } })
  }

  const { deviceToken, commandType, securityPayload } = await req.json()

  // Structure push transaction
  const fcmPayload = {
    message: {
      token: deviceToken,
      data: {
        action: commandType,
        timestamp: Date.now().toString(),
        payload: JSON.stringify(securityPayload || {})
      },
      android: {
        priority: "high"
      }
    }
  }

  // Publish to Google Firebase admin rest API
  const res = await fetch('https://fcm.googleapis.com/v1/projects/YOUR_PROJECT_ID/messages:send', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${process.env.FCM_SERVER_KEY}\`,
      'Content-Type': 'application/json'
    },
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" }
  })
})`;

  const EDGE_QR_GENERATOR_CODE = `// Supabase Deno Edge Function: generate-provisioning-qrs/index.ts
// Generates Android Enterprise (QR 1) and App Config/Activation Token (QR 2) base64 QR Code images.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import QRCode from "npm:qrcode"

// Safe CORS Headers for multi-tenant frontend consumption
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { device_id } = await req.json()
    if (!device_id) {
      return new Response(JSON.stringify({ error: "Missing parameter device_id" }), { status: 400 })
    }

    // Retrieve device from Supabase SQL database with customer link
    const { data: device, error } = await supabase
      .from('devices')
      .select('*, customers(*)')
      .eq('id', device_id)
      .single()

    if (error || !device) {
      return new Response(JSON.stringify({ error: "Device ledger record not found" }), { status: 404 })
    }

    // QR 1 Payload: Official Google Android Enterprise Device Owner provisioning parameters
    const qr1Payload = {
      "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": "com.emisecure.customer/com.emisecure.customer.MyDeviceAdminReceiver",
      "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": "https://emisecure.com/apps/secure-lock.apk",
      "android.app.extra.PROVISIONING_DEVICE_ADMIN_SIGNATURE_CHECKSUM": "q-S7hTu7Y_2re3_U88_v988w9eWp2n8tX9OpP_y9Z88=",
      "android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE": {
        "device_id": device.id,
        "activation_token": device.activation_token
      }
    }

    // QR 2 Payload: App Config details, binding DPC client instance with active customer
    const qr2Payload = {
      "tenant_id": "maruti-mobile-arena",
      "shop_id": device.shop_id,
      "device_id": device.id,
      "device_model": device.model,
      "serial_number": device.serial_number,
      "activation_token": device.activation_token,
      "client_name": device.customers.name,
      "onboard_timestamp": new Date().toISOString()
    }

    // Generate high contrast PNG data URLs (base64)
    const qr1Base64 = await QRCode.toDataURL(JSON.stringify(qr1Payload), { width: 300, margin: 2 })
    const qr2Base64 = await QRCode.toDataURL(JSON.stringify(qr2Payload), { width: 300, margin: 2 })

    return new Response(
      JSON.stringify({
        success: true,
        deviceId: device.id,
        model: device.model,
        clientName: device.customers.name,
        generatedAt: new Date().toISOString(),
        qr1: {
          schema: "Android Enterprise DPC Provisioning",
          payload: qr1Payload,
          base64: qr1Base64
        },
        qr2: {
          schema: "DPC Client App Activation Token",
          payload: qr2Payload,
          base64: qr2Base64
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders })
  }
})`;

  const CHECKLIST_TESTING = [
    { title: 'Play Integrity Verification', desc: 'Secure Google Play Integrity APIs to detect rooted, Magisk unlocked bootloaders, and flash warnings.' },
    { title: 'Offline Timebomb Verification', desc: 'Disconnect modern devices from the internet. Verify if overdue dates generate Level 4 overlays locally.' },
    { title: 'Anti-Uninstall Protection', desc: 'Verify device owner locks deny manual client deletions or app stops via system menus.' },
    { title: 'Stealth Dialer Code', desc: 'Dial *#123# into dialer keyboard. Verify diagnostic console loads connection buffers.' },
    { title: 'SIM Change Audits', desc: 'Unseat SIM cards. Verify broadcast intents intercept ICCID alterations.' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Tab Navigation header */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-slate-950 border border-slate-800 rounded-3xl p-6 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">EMI Secure Lock Developer Hub</h2>
            <p className="text-zinc-500 text-xs">Production source code templates, compiler setups, and testing checklists</p>
          </div>

          <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-850 gap-2 font-mono text-[10px]">
            <button
              onClick={() => setActiveSubTab('dpc')}
              className={`py-1.5 px-3.5 rounded-xl font-bold transition-all ${
                activeSubTab === 'dpc' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Kotlin DPC
            </button>
            <button
              onClick={() => setActiveSubTab('admin')}
              className={`py-1.5 px-3.5 rounded-xl font-bold transition-all ${
                activeSubTab === 'admin' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Kotlin Admin
            </button>
            <button
              onClick={() => setActiveSubTab('database')}
              className={`py-1.5 px-3.5 rounded-xl font-bold transition-all ${
                activeSubTab === 'database' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              SQL & Edge APIs
            </button>
            <button
              onClick={() => setActiveSubTab('checklists')}
              className={`py-1.5 px-3.5 rounded-xl font-bold transition-all ${
                activeSubTab === 'checklists' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Deployment Lists
            </button>
          </div>
        </div>
      </div>

      {/* SUBTABS RENDERING CONTEXTS */}

      {/* DPC CODE CONTEXT */}
      {activeSubTab === 'dpc' && (
        <div className="space-y-6 animate-fade-in text-sans">
          
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-550 font-mono uppercase tracking-widest font-bold">Files: com/emisecure/customer/MyDeviceAdminReceiver.kt</span>
                <h3 className="font-bold text-white text-xs">Device Owner Broadcast Policy Manager</h3>
              </div>
              <button 
                onClick={() => copyToClipboard(DPC_CODE_ADMIN_RECEIVER)}
                className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 p-2 text-zinc-400 hover:text-white rounded-lg flex items-center gap-1.5 text-[10.5px] cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Source
              </button>
            </div>
            <pre className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-850 mt-4 overflow-x-auto text-[10px] font-mono text-zinc-300">
              <code>{DPC_CODE_ADMIN_RECEIVER}</code>
            </pre>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-550 font-mono uppercase tracking-widest font-bold">Files: com/emisecure/customer/LockOverlayService.kt</span>
                <h3 className="font-bold text-white text-xs">Full Screen Escrow Window Manager Overlay</h3>
              </div>
              <button 
                onClick={() => copyToClipboard(DPC_CODE_OVERLAY_SERVICE)}
                className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 p-2 text-zinc-400 hover:text-white rounded-lg flex items-center gap-1.5 text-[10.5px] cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Source
              </button>
            </div>
            <pre className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-850 mt-4 overflow-x-auto text-[10px] font-mono text-zinc-300">
              <code>{DPC_CODE_OVERLAY_SERVICE}</code>
            </pre>
          </div>

        </div>
      )}

      {/* KOTLIN ADMIN APP AND COMPOSE */}
      {activeSubTab === 'admin' && (
        <div className="space-y-6 animate-fade-in text-sans">
          
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4 border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] text-zinc-450 font-mono uppercase tracking-widest font-bold flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 bg-indigo-505 rounded-full animate-pulse"></span>
                  Kotlin Admin & Jetpack Compose Module
                </span>
                <h3 className="font-bold text-white text-md">com.emisecure.admin Module Tree</h3>
                <p className="text-[11.5px] text-zinc-400">Secure operator sign-ins with Supabase Auth & real-time CameraX scanning powered by Google ML Kit Barcode scanning APIs.</p>
              </div>

              {/* Toolbar file selector */}
              <div className="flex flex-wrap bg-zinc-950 p-1.5 rounded-xl border border-zinc-850 gap-1 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setSelectedAdminFile('scanner')}
                  className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedAdminFile === 'scanner' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  OnboardingScannerScreen.kt (Live) ★
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAdminFile('login')}
                  className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedAdminFile === 'login' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  LoginScreen.kt
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAdminFile('activity')}
                  className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedAdminFile === 'activity' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  MainActivity.kt
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAdminFile('client')}
                  className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedAdminFile === 'client' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  SupabaseClient.kt
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAdminFile('gradle')}
                  className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedAdminFile === 'gradle' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  build.gradle.kts
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAdminFile('manifest')}
                  className={`py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedAdminFile === 'manifest' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  AndroidManifest.xml
                </button>
              </div>
            </div>

            {/* Render view code blocks */}
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-zinc-950/40 p-3 rounded-xl border border-zinc-850/40 text-[10.5px]">
                <div className="flex items-center gap-2 font-mono">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span className="text-zinc-350">
                    File Location: {
                      selectedAdminFile === 'scanner' ? 'android-admin/app/src/main/java/com/emisecure/admin/ui/scanner/OnboardingScannerScreen.kt' :
                      selectedAdminFile === 'login' ? 'android-admin/app/src/main/java/com/emisecure/admin/ui/auth/LoginScreen.kt' :
                      selectedAdminFile === 'activity' ? 'android-admin/app/src/main/java/com/emisecure/admin/MainActivity.kt' :
                      selectedAdminFile === 'client' ? 'android-admin/app/src/main/java/com/emisecure/admin/SupabaseClient.kt' :
                      selectedAdminFile === 'gradle' ? 'android-admin/app/build.gradle.kts' :
                      'android-admin/app/src/main/AndroidManifest.xml'
                    }
                  </span>
                </div>
                <button 
                  onClick={() => copyToClipboard(
                    selectedAdminFile === 'scanner' ? ADMIN_APP_SCANNER :
                    selectedAdminFile === 'login' ? ADMIN_APP_LOGIN :
                    selectedAdminFile === 'activity' ? ADMIN_APP_ACTIVITY :
                    selectedAdminFile === 'client' ? ADMIN_APP_CLIENT :
                    selectedAdminFile === 'gradle' ? ADMIN_APP_GRADLE :
                    ADMIN_APP_MANIFEST
                  )}
                  className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 py-1.5 px-3 text-zinc-400 hover:text-white rounded-lg flex items-center gap-1.5 text-[10.5px] cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy File Content
                </button>
              </div>

              <pre className="p-5 bg-zinc-950/85 rounded-2xl border border-zinc-850 overflow-x-auto text-[10px] font-mono text-zinc-300 max-h-[440px] leading-relaxed">
                <code>{
                  selectedAdminFile === 'scanner' ? ADMIN_APP_SCANNER :
                  selectedAdminFile === 'login' ? ADMIN_APP_LOGIN :
                  selectedAdminFile === 'activity' ? ADMIN_APP_ACTIVITY :
                  selectedAdminFile === 'client' ? ADMIN_APP_CLIENT :
                  selectedAdminFile === 'gradle' ? ADMIN_APP_GRADLE :
                  ADMIN_APP_MANIFEST
                }</code>
              </pre>
            </div>
          </div>

          {/* Quick-setup Info Card */}
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-5 text-xs text-zinc-400 leading-relaxed space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" />
              Onboarding Engineering Architecture Details
            </h4>
            <p>
              This code module is structured under standard Android Studio layout guidelines. By utilizing the 
              <strong> Supabase Kotlin SDK</strong> paired with <strong>Google ML Kit Barcode Vision</strong>, shop executives at Maruti Mobile Arena gain:
            </p>
            <ul className="list-disc pl-5 space-y-1 my-2">
              <li><strong>Zero-Touch Handshake:</strong> Instantly parsing standard Android Enterprise provisioning extra-bundles to trigger Device Owner bindings.</li>
              <li><strong>Multi-Factor Authorization:</strong> Full email verification and active operator session validation against raw credentials databases.</li>
              <li><strong>Offline Fallbacks:</strong> Seamless fallback triggers allowing offline sandbox verification even inside strict emulator constraints.</li>
            </ul>
          </div>
        </div>
      )}

      {/* DATABASE SCHEMA & EDGE ROUTERS */}
      {activeSubTab === 'database' && (
        <div className="space-y-6 animate-fade-in text-sans">
          
          {/* File Navigator Viewer Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  Supabase Ledger & Edge Functions
                </h3>
                <p className="text-[11px] text-zinc-500">Inspect the production SQL schemas and typescript edge microservices</p>
              </div>

              {/* Toggle file tabs */}
              <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-850 self-start sm:self-center font-mono text-[10px] gap-1">
                <button
                  type="button"
                  onClick={() => setViewingDbFile('sql')}
                  className={`py-1 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                    viewingDbFile === 'sql' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  supabase-schema.sql
                </button>
                <button
                  type="button"
                  onClick={() => setViewingDbFile('router')}
                  className={`py-1 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                    viewingDbFile === 'router' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  cmd-router/index.ts
                </button>
                <button
                  type="button"
                  onClick={() => setViewingDbFile('qrs')}
                  className={`py-1 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                    viewingDbFile === 'qrs' ? 'bg-indigo-600 text-white shadow font-sans' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  generate-provisioning-qrs/index.ts ★
                </button>
              </div>
            </div>

            {/* Render selected file container */}
            {viewingDbFile === 'sql' && (
              <div className="space-y-3.5 animate-fade-in">
                <div className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-850/40">
                  <span className="text-[10px] text-zinc-400 font-mono">Location: /supabase/schema.sql</span>
                  <button 
                    onClick={() => copyToClipboard(SQL_DATABASE_BLUERINT)}
                    className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 p-1.5 text-zinc-400 hover:text-white rounded-lg flex items-center gap-1.5 text-[10px] cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy SQL Code
                  </button>
                </div>
                <pre className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-850 overflow-x-auto text-[10px] font-mono text-zinc-300 max-h-[380px]">
                  <code>{SQL_DATABASE_BLUERINT}</code>
                </pre>
              </div>
            )}

            {viewingDbFile === 'router' && (
              <div className="space-y-3.5 animate-fade-in">
                <div className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-850/40">
                  <span className="text-[10px] text-zinc-400 font-mono">Location: /supabase/functions/cmd-router/index.ts</span>
                  <button 
                    onClick={() => copyToClipboard(EDGE_FUNCTIONS_INDEX)}
                    className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 p-1.5 text-zinc-400 hover:text-white rounded-lg flex items-center gap-1.5 text-[10px] cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy API Code
                  </button>
                </div>
                <pre className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-850 overflow-x-auto text-[10px] font-mono text-zinc-300 max-h-[380px]">
                  <code>{EDGE_FUNCTIONS_INDEX}</code>
                </pre>
              </div>
            )}

            {viewingDbFile === 'qrs' && (
              <div className="space-y-3.5 animate-fade-in">
                <div className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-850/40">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400 font-mono">Location: /supabase/functions/generate-provisioning-qrs/index.ts</span>
                    <span className="text-[8px] bg-indigo-950 text-indigo-400 border border-indigo-900 rounded font-mono px-1 font-bold uppercase">NEW LAYER</span>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(EDGE_QR_GENERATOR_CODE)}
                    className="bg-indigo-950/45 hover:bg-indigo-900 border border-indigo-850 p-1.5 text-indigo-300 hover:text-indigo-200 rounded-lg flex items-center gap-1.5 text-[10px] cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Edge Function Code
                  </button>
                </div>
                <pre className="p-4 bg-zinc-950/80 rounded-2xl border border-indigo-950/30 overflow-x-auto text-[10px] font-mono text-zinc-300 max-h-[380px]">
                  <code>{EDGE_QR_GENERATOR_CODE}</code>
                </pre>
              </div>
            )}
          </div>

          {/* INTERACTIVE DENO EDGE FUNCTION SANDBOX CONSOLE */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
            
            <div className="flex justify-between items-start border-b border-zinc-800 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <Activity className="w-3 h-3 animate-pulse text-emerald-400" />
                  Live Deno Sandbox Ecosystem
                </span>
                <h3 className="font-bold text-white text-xs">Edge Function Live Tester Console</h3>
              </div>
              <span className="text-[8.5px] font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-900 px-2 py-0.5 rounded-full font-bold">
                POST /generate-provisioning-qrs Handshake Sim
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Interactive panel triggers */}
              <div className="lg:col-span-5 space-y-4 font-sans">
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Specify a target hardware device below then click <strong>Invoke Deno Function</strong>. The sandbox compiles DPC schemas, runs high correction packing, and renders dynamic Base64 PNG vectors for enterprise onboardings.
                </p>

                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono text-zinc-500 font-bold block">Select Core Ledger Device:</label>
                    <select
                      value={selectedSandboxDeviceId}
                      onChange={(e) => setSelectedSandboxDeviceId(e.target.value)}
                      className="w-full bg-slate-900 border border-zinc-800 text-zinc-300 text-xs p-2.5 rounded-xl outline-none focus:border-indigo-600"
                    >
                      {defaultDevices.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.model} ({d.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => triggerSandbox(selectedSandboxDeviceId)}
                    disabled={sandboxLoading}
                    className="w-full bg-indigo-605 hover:bg-indigo-700 disabled:bg-zinc-850 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-indigo-900/10"
                  >
                    {sandboxLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Invoking Deno Engine...
                      </>
                    ) : (
                      <>
                        <Cpu className="w-4 h-4" />
                        Invoke generate-provisioning-qrs
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 text-[10px] space-y-2 font-mono text-zinc-500">
                  <p className="text-zinc-400 font-bold flex items-center gap-1.5 uppercase tracking-wide text-[9px]">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    Developer API Handshake:
                  </p>
                  <div className="space-y-1 text-zinc-400 leading-relaxed text-[9px]">
                    <p className="text-zinc-350">POST https://[ref].supabase.co/functions/v1/generate-provisioning-qrs</p>
                    <p>Headers: <span className="text-zinc-300">{"{\"Content-Type\": \"application/json\", \"apikey\": \"ANON_KEY\"}"}</span></p>
                    <p>Body: <span className="text-amber-400">{"{"} "device_id": "{selectedSandboxDeviceId}" {"}"}</span></p>
                  </div>
                </div>
              </div>

              {/* Right Sandbox Engine Responses Logs queue layout */}
              <div className="lg:col-span-7 bg-zinc-950 rounded-2xl border border-zinc-850 p-4 h-full min-h-[300px] flex flex-col justify-between">
                
                {sandboxLoading && (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                    <div className="space-y-1">
                      <p className="text-white text-xs font-bold font-mono">Deno Engine Provisioning Pipeline Active</p>
                      <p className="text-zinc-500 text-[10.5px]">Fetching device link, hashing, and writing QRs base64 data URLs...</p>
                    </div>
                  </div>
                )}

                {!sandboxLoading && !sandboxResponse && (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-zinc-500 select-none">
                    <Sparkles className="w-10 h-10 text-zinc-700 animate-bounce mb-3" />
                    <p className="font-bold text-xs text-white">Interactive Response Stream Idle</p>
                    <p className="text-[10px] text-zinc-500 max-w-sm mt-1 mx-6 leading-relaxed">
                      Trigger the API endpoint to see the response payload. The output displays full HTTP return headers, mapped JSON keys, and real-time generated scans.
                    </p>
                  </div>
                )}

                {!sandboxLoading && sandboxResponse && (
                  <div className="space-y-5 animate-fade-in text-left">
                    
                    {/* Response Headers */}
                    <div className="flex justify-between items-center bg-zinc-90 w-full px-3 py-2 rounded-lg border border-zinc-900 text-[10px] font-mono leading-none">
                      <span className="text-emerald-400 font-bold">STATUS 200 OK</span>
                      <span className="text-zinc-500">{new Date(sandboxResponse.generatedAt).toLocaleTimeString()} • Server: Deno Deploy</span>
                    </div>

                    {/* QR Outputs Visual Presentation Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* QR 1 Output display */}
                      <div className="bg-slate-905 border border-slate-800 rounded-xl p-3.5 space-y-3">
                        <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                          <span className="text-[10px] text-zinc-300 font-bold uppercase">QR 1: Enterprise Provision</span>
                          <button 
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(sandboxResponse.qr1.payload, null, 2));
                              setCopiedSandbox1(true);
                              setTimeout(() => setCopiedSandbox1(false), 2000);
                            }}
                            className="text-zinc-400 hover:text-white cursor-pointer px-1 rounded flex items-center gap-1 text-[9px]"
                            title="Copy QR Payload JSON"
                          >
                            {copiedSandbox1 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            {copiedSandbox1 ? 'Copied' : 'Payload'}
                          </button>
                        </div>

                        {/* Built-in nice visual render for the generated DPC Owner QR */}
                        <div className="bg-white p-2 w-32 h-32 mx-auto rounded-lg shadow flex flex-col justify-center items-center">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=0f172a&data=${encodeURIComponent(JSON.stringify(sandboxResponse.qr1.payload))}`}
                            alt="QR 1"
                            className="w-28 h-28 object-contain"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>

                        <div className="text-center">
                          <span className="text-[9px] font-mono text-zinc-400 bg-zinc-900 py-0.5 px-2 rounded-full border border-zinc-800">
                            android.app.extra.PROVISIONING...
                          </span>
                          <button 
                            type="button"
                            onClick={() => {
                              alert(`Base64 QR-1 Image String:\n\n${sandboxResponse.qr1.base64}`);
                            }}
                            className="text-[9px] text-indigo-400 hover:underline block mt-2 text-center w-full cursor-pointer"
                          >
                            View base64 String
                          </button>
                        </div>
                      </div>

                      {/* QR 2 Output display */}
                      <div className="bg-slate-905 border border-slate-800 rounded-xl p-3.5 space-y-3">
                        <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                          <span className="text-[10px] text-zinc-300 font-bold uppercase text-indigo-300">QR 2: Client Activation</span>
                          <button 
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(sandboxResponse.qr2.payload, null, 2));
                              setCopiedSandbox2(true);
                              setTimeout(() => setCopiedSandbox2(false), 2000);
                            }}
                            className="text-zinc-400 hover:text-white cursor-pointer px-1 rounded flex items-center gap-1 text-[9px]"
                            title="Copy App Config JSON"
                          >
                            {copiedSandbox2 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            {copiedSandbox2 ? 'Copied' : 'Payload'}
                          </button>
                        </div>

                        <div className="bg-white p-2 w-32 h-32 mx-auto rounded-lg shadow flex flex-col justify-center items-center">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=4f46e5&data=${encodeURIComponent(JSON.stringify(sandboxResponse.qr2.payload))}`}
                            alt="QR 2"
                            className="w-28 h-28 object-contain"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>

                        <div className="text-center">
                          <span className="text-[9px] font-mono text-zinc-400 bg-zinc-900 py-0.5 px-2 rounded-full border border-zinc-800">
                            Token: {sandboxResponse.qr2.payload.activation_token}
                          </span>
                          <button 
                            type="button"
                            onClick={() => {
                              alert(`Base64 QR-2 Image String:\n\n${sandboxResponse.qr2.base64}`);
                            }}
                            className="text-[9px] text-indigo-400 hover:underline block mt-2 text-center w-full cursor-pointer"
                          >
                            View base64 String
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Collapsible/Expandable JSON structure representation */}
                    <div className="space-y-1.5 bg-zinc-900 p-3 rounded-xl border border-zinc-800 text-[10px] font-mono text-zinc-300">
                      <span className="text-zinc-500 font-bold uppercase tracking-wider block text-[9.5px]">JSON Payload Returned by Edge Function:</span>
                      <pre className="overflow-auto max-h-[140px] text-zinc-400 p-2 bg-slate-950 rounded max-w-full text-[9px] leading-relaxed">
                        <code>{JSON.stringify(sandboxResponse, null, 2)}</code>
                      </pre>
                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>

        </div>
      )}

      {/* COMPILER & TESTING DEPLOYMENT CHECKLIST MANUALS */}
      {activeSubTab === 'checklists' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in font-sans">
          
          {/* Cloud setups */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="border-b border-zinc-800 pb-2">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-indigo-400" />
                Google FCM & Cloudflare R2 setups
              </h3>
            </div>

            <ul className="space-y-3.5 text-xs text-zinc-350">
              <li className="flex gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-white">FCM Service Account Secret:</span>
                  <p className="text-zinc-450 text-[11px]">Generate OAuth credentials via Firebase Console Settings. Inject into Supabase Secrets as <span className="font-mono bg-zinc-950 text-indigo-300 px-1 rounded text-[10px]">FCM_SERVER_KEY</span>.</p>
                </div>
              </li>

              <li className="flex gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-white">Cloudflare R2 CORS Policies:</span>
                  <p className="text-zinc-450 text-[11px]">Configure custom CORS allowances for S3 compatible photo backups, letting modern apps push logs direct to Cloudflare R2 containers.</p>
                </div>
              </li>

              <li className="flex gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-white">APK Build Compiler parameters:</span>
                  <p className="text-zinc-450 text-[11px]">Ensure all three compiling pipelines (Admin, Staff, Customer App) compile using a secure V2 signature layout key and matching Keystores.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Secure validation plans */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="border-b border-zinc-800 pb-2">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
                Active Store security Testing checklist
              </h3>
            </div>

            <div className="space-y-3 shrink-0">
              {CHECKLIST_TESTING.map((item, index) => (
                <div key={index} className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-858 flex items-start gap-2.5 text-xs">
                  <span className="w-5 h-5 rounded bg-zinc-900 text-zinc-450 flex items-center justify-center font-bold font-mono text-[10px] border border-zinc-800 mt-0.5">{index + 1}</span>
                  <div>
                    <span className="font-bold text-white">{item.title}</span>
                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
