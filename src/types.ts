export interface Shop {
  id: string;
  name: string;
  supportNumber: string;
  address: string;
  themeColor: string;
  logoText: string;
  gstNumber: string;
}

export interface Profile {
  id: string;
  shopId: string;
  fullName: string;
  role: 'owner' | 'staff';
  email: string;
}

export interface Customer {
  id: string;
  shopId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  aadhaarPhoto: string;
  panPhoto: string;
  avatarUrl: string;
  status: 'active' | 'blacklist' | 'completed';
}

export interface Device {
  id: string;
  customerId: string;
  shopId: string;
  model: string;
  imei1: string;
  imei2: string;
  serialNumber: string;
  activationToken: string;
  isActive: boolean;
  isLocked: boolean;
  lockLevel: 1 | 2 | 3 | 4; // 1: Reminder, 2: Social Apps Blocked, 3: UPI/Calls Allowed, 4: Full Lock
  offlineUnlockSecret: string;
  batteryLevel: number;
  internetConnected: boolean;
  lastOnline: string;
  androidVersion: string;
  liveLatitude: number;
  liveLongitude: number;
  usbTransferBlocked: boolean;
  factoryResetBlocked: boolean;
  cameraBlocked: boolean;
  kioskModeActive: boolean;
}

export interface Loan {
  id: string;
  deviceId: string;
  customerId: string;
  shopId: string;
  totalAmount: number;
  downPayment: number;
  remainingAmount: number;
  tenureMonths: number;
  interestRate: number;
  nextDueDate: string;
  monthlyEmiAmount: number;
  status: 'active' | 'overdue' | 'paid' | 'grace_period';
  gracePeriodDays: number;
}

export interface Installment {
  id: string;
  loanId: string;
  installmentNo: number;
  dueDate: string;
  amount: number;
  amountPaid: number;
  status: 'pending' | 'partially_paid' | 'paid' | 'overdue';
}

export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  paymentDate: string;
  recordedBy: string;
  paymentMethod: 'cash' | 'upi' | 'bank_transfer';
  status: 'cleared' | 'pending_verification';
  screenshotUrl?: string;
  receiptNumber: string;
}

export interface DeviceCommand {
  id: string;
  deviceId: string;
  commandType:
    | 'LOCK_DEVICE'
    | 'UNLOCK_DEVICE'
    | 'BLOCK_SOCIAL_APPS'
    | 'UNBLOCK_SOCIAL_APPS'
    | 'GET_LOCATION'
    | 'LOCK_USB_TRANSFER'
    | 'UNLOCK_USB_TRANSFER'
    | 'DISABLE_FACTORY_RESET'
    | 'ENABLE_FACTORY_RESET'
    | 'DISABLE_CAMERA'
    | 'ENABLE_CAMERA'
    | 'SET_WALLPAPER'
    | 'REMOVE_WALLPAPER'
    | 'EMI_SCREEN_REMINDER'
    | 'EMI_AUDIO_REMINDER'
    | 'ENABLE_KIOSK_MODE'
    | 'DISABLE_KIOSK_MODE';
  status: 'pending' | 'sent' | 'executed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface SimChangeLog {
  id: string;
  deviceId: string;
  oldIccid: string;
  newIccid: string;
  oldNumber: string;
  newNumber: string;
  alertedAt: string;
}

export interface IntegrityAlert {
  id: string;
  deviceId: string;
  type: 'root' | 'magisk' | 'bootloader_unlock' | 'usb_debugging' | 'fake_gps' | 'safe_mode';
  description: string;
  detectedAt: string;
  autoLocked: boolean;
}

export interface AuditLog {
  id: string;
  shopId: string;
  userId: string;
  userEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  timestamp: string;
}
