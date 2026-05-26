package com.emisecure.admin.ui.scanner

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

/**
 * Modern Scanner screen providing Google MLKit automated image analysis and CameraX.
 * Decodes local Android Enterprise profiles (QR 1/QR 2) and coordinates remote device activations.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OnboardingScannerScreen(
    adminUsername: String,
    onLogout: () -> Unit
) {
    val context = LocalContext.current
    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED
        )
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasCameraPermission = isGranted
    }

    LaunchedEffect(key1 = true) {
        if (!hasCameraPermission) {
            permissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    var scannedPayload by remember { mutableStateOf<String?>(null) }
    var scannedDeviceModel by remember { mutableStateOf<String?>(null) }
    var scannedClientName by remember { mutableStateOf<String?>(null) }
    var parsedToken by remember { mutableStateOf<String?>(null) }
    var scanModeDetected by remember { mutableStateOf<String?>(null) } // "QR 1: Enterprise" or "QR 2: AppActivation"

    val handleBarcodeValue = { barcodeValue: String ->
        scannedPayload = barcodeValue
        try {
            // Attempt decoding JSON structure (Android Enterprise DPC Extra bundle structures or QR2 activation schemas)
            val jsonRoot = Json.parseToJsonElement(barcodeValue).jsonObject
            if (jsonRoot.containsKey("android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME") || jsonRoot.containsKey("device_id") && jsonRoot.containsKey("activation_token")) {
                scanModeDetected = "QR 1: Enterprise Provisioning Payload"
                val extras = jsonRoot["android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE"]?.jsonObject
                parsedToken = extras?.get("activation_token")?.toString()?.replace("\"", "") ?: "ACT-ESL-MOCKED"
                scannedDeviceModel = "Enterprise Managed DPC Handshake"
                scannedClientName = "Company Fleet Client"
            } else if (jsonRoot.containsKey("activation_token") && jsonRoot.containsKey("client_name")) {
                scanModeDetected = "QR 2: Over-The-Air Device Activation config"
                parsedToken = jsonRoot["activation_token"]?.toString()?.replace("\"", "")
                scannedDeviceModel = jsonRoot["device_model"]?.toString()?.replace("\"", "")
                scannedClientName = jsonRoot["client_name"]?.toString()?.replace("\"", "")
            } else {
                scanModeDetected = "Generic EMI Secure Config"
            }
        } catch (e: Exception) {
            // Fallback for flat unformatted string tokens
            scanModeDetected = "Flat Token Schema"
            parsedToken = barcodeValue
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Onboarding Console", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        Text("Active Agent: $adminUsername", fontSize = 10.sp, color = MaterialTheme.colorScheme.primary)
                    }
                },
                actions = {
                    Button(
                        onClick = onLogout,
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                        modifier = Modifier.padding(end = 8.dp)
                    ) {
                        Text("Logout", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(MaterialTheme.colorScheme.background)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            
            // Scanner Viewport Layout
            if (scannedPayload == null) {
                if (hasCameraPermission) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(320.dp)
                            .background(Color.Black)
                    ) {
                        CameraPreview(
                            onBarcodeDetected = { code ->
                                handleBarcodeValue(code)
                            }
                        )
                        
                        // Overlaid target crosshairs
                        Box(
                            modifier = Modifier
                                .size(200.dp)
                                .border(2.dp, MaterialTheme.colorScheme.primary, RoundedCornerShape(16.dp))
                                .align(Alignment.Center)
                        ) {
                            Spacer(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(1.5.dp)
                                    .background(MaterialTheme.colorScheme.primary)
                                    .align(Alignment.Center)
                            )
                        }

                        Text(
                            text = "Surface Live: Alignment viewport with DPC QR bounds",
                            fontSize = 10.sp,
                            color = Color.White.copy(alpha = 0.8f),
                            modifier = Modifier
                                .align(Alignment.BottomCenter)
                                .padding(12.dp)
                                .background(Color.Black.copy(alpha = 0.6f), RoundedCornerShape(6.dp))
                                .padding(horizontal = 10.dp, vertical = 4.dp),
                            fontFamily = FontFamily.Monospace
                        )
                    }
                } else {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(280.dp)
                            .background(Color(0xFFE2E8F0)),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Camera Hardware Permissions Required", fontSize = 12.sp, color = Color.Gray)
                            Button(
                                onClick = { permissionLauncher.launch(Manifest.permission.CAMERA) },
                                modifier = Modifier.padding(top = 12.dp)
                            ) {
                                Text("Grant Camera Access", fontSize = 11.sp)
                            }
                        }
                    }
                }
            } else {
                // Success Scan Details view
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp)
                        .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(20.dp))
                        .padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = "Success",
                        tint = Color(0xFF10B981),
                        modifier = Modifier.size(48.dp)
                    )
                    
                    Text(
                        text = "QR Payload Decoded!",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF10B981),
                        modifier = Modifier.padding(top = 8.dp)
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = scanModeDetected ?: "Generic Configuration",
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier
                            .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.08f), RoundedCornerShape(6.dp))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    )

                    // Specific Keys details
                    Spacer(modifier = Modifier.height(16.dp))
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        DetailRow("Onboard Client:", scannedClientName ?: "Unspecified Account")
                        DetailRow("Target Device:", scannedDeviceModel ?: "DPC General Fleet")
                        DetailRow("Activation token:", parsedToken ?: "Not Decoded")
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    Button(
                        onClick = {
                            scannedPayload = null
                            scannedDeviceModel = null
                            scannedClientName = null
                            parsedToken = null
                            scanModeDetected = null
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(imageVector = Icons.Default.Refresh, contentDescription = "Scan Again")
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Reset Camera for Next Customer Onboarding", fontSize = 12.sp)
                    }
                }
            }

            // Quick Diagnostic Simulator for Sandbox
            Spacer(modifier = Modifier.height(16.dp))
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 6.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "DEVELOPER EMULATOR SIMULATOR",
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = "Because Google CameraX won't operate correctly inside traditional flat Android Studio VM emulators without cameras, use these fallback triggers to model valid scans instantly.",
                        fontSize = 11.sp,
                        color = Color.Gray,
                        modifier = Modifier.padding(top = 4.dp)
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = {
                                val simulatedQR1 = """
                                    {
                                      "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": "com.emisecure.customer/com.emisecure.customer.MyDeviceAdminReceiver",
                                      "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": "https://emisecure.com/apps/secure-lock.apk",
                                      "android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE": {
                                        "device_id": "dev-manoj",
                                        "activation_token": "ACT-ESL-3091"
                                      }
                                    }
                                """.trimIndent()
                                handleBarcodeValue(simulatedQR1)
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 4.dp)
                        ) {
                            Icon(Icons.Default.PlayArrow, contentDescription = "QR1", modifier = Modifier.size(12.dp))
                            Text("Simulate QR1", fontSize = 10.sp)
                        }

                        Button(
                            onClick = {
                                val simulatedQR2 = """
                                    {
                                      "tenant_id": "maruti-mobile-arena",
                                      "shop_id": "shop-rajkot",
                                      "device_id": "dev-manoj",
                                      "device_model": "Samsung Galaxy M34 5G (128GB)",
                                      "activation_token": "ACT-ESL-3091",
                                      "client_name": "Manoj Ghadiya"
                                    }
                                """.trimIndent()
                                handleBarcodeValue(simulatedQR2)
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 4.dp)
                        ) {
                            Icon(Icons.Default.PlayArrow, contentDescription = "QR2", modifier = Modifier.size(12.dp))
                            Text("Simulate QR2", fontSize = 10.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun DetailRow(label: String, valText: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(10.dp))
            .background(Color(0xFFF8FAFC))
            .padding(10.dp),
        horizontalArrangement = Arrangement.Companion.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Color.Gray)
        Text(text = valText, fontSize = 11.5.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
    }
}

/**
 * Embeds CameraX preview with custom visual analysis triggers using the MLKit Barcode scanner client.
 */
@Composable
fun CameraPreview(
    onBarcodeDetected: (String) -> Unit
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val cameraExecutor: ExecutorService = remember { Executors.newSingleThreadExecutor() }
    
    val previewView = remember {
        PreviewView(context).apply {
            scaleType = PreviewView.ScaleType.FILL_CENTER
        }
    }

    LaunchedEffect(key1 = true) {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
        
        cameraProviderFuture.addListener({
            val cameraProvider = cameraProviderFuture.get()
            
            val preview = Preview.Builder().build().apply {
                setSurfaceProvider(previewView.surfaceProvider)
            }

            // Setup barcode detector options to scan QR CODES only for optimized frame rates
            val options = BarcodeScannerOptions.Builder()
                .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
                .build()
            val scanner = BarcodeScanning.getClient(options)

            val imageAnalysis = ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()

            var isScanned = false
            imageAnalysis.setAnalyzer(cameraExecutor) { imageProxy ->
                val mediaImage = imageProxy.image
                if (mediaImage != null && !isScanned) {
                    val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
                    
                    scanner.process(image)
                        .addOnSuccessListener { barcodes ->
                            for (barcode in barcodes) {
                                val rawValue = barcode.rawValue
                                if (rawValue != null && !isScanned) {
                                    isScanned = true
                                    onBarcodeDetected(rawValue)
                                    break
                                }
                            }
                        }
                        .addOnFailureListener {
                            Log.e("CameraPreview", "ML Kit process analysis failure: ", it)
                        }
                        .addOnCompleteListener {
                            imageProxy.close()
                        }
                } else {
                    imageProxy.close()
                }
            }

            val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

            try {
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(
                    lifecycleOwner,
                    cameraSelector,
                    preview,
                    imageAnalysis
                )
            } catch (exc: Exception) {
                Log.e("CameraPreview", "CameraX Use case binding configuration failure", exc)
            }
        }, ContextCompat.getMainExecutor(context))
    }

    // Return the preview viewport
    AndroidView(
        factory = { previewView },
        modifier = Modifier.fillMaxSize()
    )
}
