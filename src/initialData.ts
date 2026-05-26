import { Shop, Profile, Customer, Device, Loan, Installment, Payment, SimChangeLog, IntegrityAlert, AuditLog } from './types';

export const defaultShops: Shop[] = [
  {
    id: 'shop-rajkot',
    name: 'Maruti Mobile Arena (Rajkot)',
    supportNumber: '+91 98765 43210',
    address: '102-105, Galaxy Commercial Center, Jawahar Road, Rajkot, Gujarat',
    themeColor: '#4f46e5', // INDIGO
    logoText: 'Maruti Secure',
    gstNumber: '24AAAAA1111A1Z1'
  },
  {
    id: 'shop-ahmedabad',
    name: 'Sai Mobile Point (Ahmedabad)',
    supportNumber: '+91 99000 88222',
    address: 'G-12, Titanium Plaza, Prahlad Nagar, Ahmedabad, Gujarat',
    themeColor: '#059669', // EMERALD
    logoText: 'Sai Lock',
    gstNumber: '24BBBBB2222B2Z2'
  }
];

export const defaultProfiles: Profile[] = [
  {
    id: 'user-jayesh',
    shopId: 'shop-rajkot',
    fullName: 'Jayeshbhai Patel',
    role: 'owner',
    email: 'owner.maruti@gmail.com'
  },
  {
    id: 'user-amit',
    shopId: 'shop-rajkot',
    fullName: 'Amit Goswami',
    role: 'staff',
    email: 'amit.staff@gmail.com'
  },
  {
    id: 'user-hardik',
    shopId: 'shop-ahmedabad',
    fullName: 'Hardik Shah',
    role: 'owner',
    email: 'owner.sai@gmail.com'
  }
];

export const defaultCustomers: Customer[] = [
  {
    id: 'cust-harshil',
    shopId: 'shop-rajkot',
    name: 'Harshil Vasoya',
    phone: '+91 94282 30190',
    email: 'harshil.v@gmail.com',
    address: 'Near Nana Mava Chowk, Kalawad Road, Rajkot',
    aadhaarPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    panPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Harshil',
    status: 'active'
  },
  {
    id: 'cust-manoj',
    shopId: 'shop-rajkot',
    name: 'Manoj Ghadiya',
    phone: '+91 97262 55891',
    email: 'manoj.ghadiya@outlook.com',
    address: 'Raiya Road, Patel Boarding Side, Rajkot',
    aadhaarPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    panPhoto: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
    avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Manoj',
    status: 'active' // This will be locked level 4!
  },
  {
    id: 'cust-parth',
    shopId: 'shop-rajkot',
    name: 'Parth Vachhani',
    phone: '+91 91041 40592',
    email: 'parth.vachhani@gmail.com',
    address: 'Kuvadva Road, Green Land Chokdi, Rajkot',
    aadhaarPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    panPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Parth',
    status: 'active' // This will be locked level 2! (Blocked social apps)
  },
  {
    id: 'cust-chirag',
    shopId: 'shop-ahmedabad',
    name: 'Chirag Parikh',
    phone: '+91 98980 12345',
    email: 'chirag.parikh@yahoo.co.in',
    address: 'Ankur Tenements, Solabhavan Road, Ghatlodiya, Ahmedabad',
    aadhaarPhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    panPhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Chirag',
    status: 'active'
  },
  {
    id: 'cust-anil',
    shopId: 'shop-ahmedabad',
    name: 'Anil Vyas',
    phone: '+91 95454 11223',
    email: 'anil.vyas@gmail.com',
    address: 'Satellite Road, Ahmedabad',
    aadhaarPhoto: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200',
    panPhoto: 'https://images.unsplash.com/photo-1489980508314-941910ded1f4?auto=format&fit=crop&q=80&w=200',
    avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Anil',
    status: 'completed'
  }
];

export const defaultDevices: Device[] = [
  {
    id: 'dev-harshil',
    customerId: 'cust-harshil',
    shopId: 'shop-rajkot',
    model: 'OnePlus Nord CE 3 (128GB)',
    imei1: '864521049981245',
    imei2: '864521049981252',
    serialNumber: 'SN9981245OP',
    activationToken: 'ACT-ESL-7741',
    isActive: true,
    isLocked: false,
    lockLevel: 1,
    offlineUnlockSecret: 'RJK-SEC-9201',
    batteryLevel: 82,
    internetConnected: true,
    lastOnline: '2026-05-26T07:15:00Z',
    androidVersion: '14.0 (OxygenOS)',
    liveLatitude: 22.3039,
    liveLongitude: 70.8022,
    usbTransferBlocked: true,
    factoryResetBlocked: true,
    cameraBlocked: false,
    kioskModeActive: false
  },
  {
    id: 'dev-manoj',
    customerId: 'cust-manoj',
    shopId: 'shop-rajkot',
    model: 'Samsung Galaxy M34 5G (128GB)',
    imei1: '358992011245991',
    imei2: '358992011245998',
    serialNumber: 'SN1245998SS',
    activationToken: 'ACT-ESL-3091',
    isActive: true,
    isLocked: true,
    lockLevel: 4, // Level 4: Full Lock
    offlineUnlockSecret: 'RJK-SEC-1049',
    batteryLevel: 48,
    internetConnected: true,
    lastOnline: '2026-05-26T07:22:00Z',
    androidVersion: '13.0 (OneUI)',
    liveLatitude: 22.2855,
    liveLongitude: 70.7933,
    usbTransferBlocked: true,
    factoryResetBlocked: true,
    cameraBlocked: true,
    kioskModeActive: true
  },
  {
    id: 'dev-parth',
    customerId: 'cust-parth',
    shopId: 'shop-rajkot',
    model: 'Redmi Note 13 Pro (256GB)',
    imei1: '863022149955401',
    imei2: '863022149955418',
    serialNumber: 'SN9955418XM',
    activationToken: 'ACT-ESL-1120',
    isActive: true,
    isLocked: true,
    lockLevel: 2, // Level 2: Social media blocked
    offlineUnlockSecret: 'RJK-SEC-9912',
    batteryLevel: 95,
    internetConnected: false,
    lastOnline: '2026-05-25T18:30:00Z',
    androidVersion: '14.0 (HyperOS)',
    liveLatitude: 22.3168,
    liveLongitude: 70.8194,
    usbTransferBlocked: true,
    factoryResetBlocked: true,
    cameraBlocked: false,
    kioskModeActive: false
  },
  {
    id: 'dev-chirag',
    customerId: 'cust-chirag',
    shopId: 'shop-ahmedabad',
    model: 'Vivo Y200 Care (128GB)',
    imei1: '861114059902341',
    imei2: '861114059902358',
    serialNumber: 'SN9902358VV',
    activationToken: 'ACT-ESL-8890',
    isActive: true,
    isLocked: false,
    lockLevel: 1,
    offlineUnlockSecret: 'AMD-SEC-4501',
    batteryLevel: 61,
    internetConnected: true,
    lastOnline: '2026-05-26T06:58:00Z',
    androidVersion: '13.0 (Funtouch)',
    liveLatitude: 23.0225,
    liveLongitude: 72.5714,
    usbTransferBlocked: true,
    factoryResetBlocked: true,
    cameraBlocked: false,
    kioskModeActive: false
  },
  {
    id: 'dev-anil',
    customerId: 'cust-anil',
    shopId: 'shop-ahmedabad',
    model: 'oppo A78 5G (128GB)',
    imei1: '862024159981140',
    imei2: '862024159981157',
    serialNumber: 'SN9981157OP',
    activationToken: 'ACT-ESL-2244',
    isActive: true,
    isLocked: false,
    lockLevel: 1,
    offlineUnlockSecret: 'AMD-SEC-6677',
    batteryLevel: 100,
    internetConnected: true,
    lastOnline: '2026-05-20T11:45:00Z',
    androidVersion: '13.0 (ColorOS)',
    liveLatitude: 23.0338,
    liveLongitude: 72.5521,
    usbTransferBlocked: false,
    factoryResetBlocked: false,
    cameraBlocked: false,
    kioskModeActive: false
  }
];

export const defaultLoans: Loan[] = [
  {
    id: 'loan-harshil',
    deviceId: 'dev-harshil',
    customerId: 'cust-harshil',
    shopId: 'shop-rajkot',
    totalAmount: 18000,
    downPayment: 5000,
    remainingAmount: 13000,
    tenureMonths: 6,
    interestRate: 12,
    nextDueDate: '2026-06-15',
    monthlyEmiAmount: 2300,
    status: 'active',
    gracePeriodDays: 3
  },
  {
    id: 'loan-manoj',
    deviceId: 'dev-manoj',
    customerId: 'cust-manoj',
    shopId: 'shop-rajkot',
    totalAmount: 15500,
    downPayment: 3500,
    remainingAmount: 12000,
    tenureMonths: 6,
    interestRate: 10,
    nextDueDate: '2026-05-20', // OVERDUE NOW (Today is 2026-05-26)
    monthlyEmiAmount: 2100,
    status: 'overdue',
    gracePeriodDays: 3
  },
  {
    id: 'loan-parth',
    deviceId: 'dev-parth',
    customerId: 'cust-parth',
    shopId: 'shop-rajkot',
    totalAmount: 21000,
    downPayment: 6000,
    remainingAmount: 15000,
    tenureMonths: 6,
    interestRate: 12,
    nextDueDate: '2026-05-22', // Overdue outside the 3-day grace period (22 + 3 = 25th overdue)
    monthlyEmiAmount: 2650,
    status: 'overdue',
    gracePeriodDays: 3
  },
  {
    id: 'loan-chirag',
    deviceId: 'dev-chirag',
    customerId: 'cust-chirag',
    shopId: 'shop-ahmedabad',
    totalAmount: 16200,
    downPayment: 4200,
    remainingAmount: 12000,
    tenureMonths: 6,
    interestRate: 14,
    nextDueDate: '2026-06-05',
    monthlyEmiAmount: 2150,
    status: 'active',
    gracePeriodDays: 3
  },
  {
    id: 'loan-anil',
    deviceId: 'dev-anil',
    customerId: 'cust-anil',
    shopId: 'shop-ahmedabad',
    totalAmount: 14000,
    downPayment: 4000,
    remainingAmount: 0,
    tenureMonths: 4,
    interestRate: 0,
    nextDueDate: '2450-01-01', // already paid fully
    monthlyEmiAmount: 2500,
    status: 'paid',
    gracePeriodDays: 3
  }
];

export const defaultInstallments: Installment[] = [
  // Harshil's installment: Paid 2 installments, upcoming 3rd
  { id: 'inst-h1', loanId: 'loan-harshil', installmentNo: 1, dueDate: '2026-04-15', amount: 2300, amountPaid: 2300, status: 'paid' },
  { id: 'inst-h2', loanId: 'loan-harshil', installmentNo: 2, dueDate: '2026-05-15', amount: 2300, amountPaid: 2300, status: 'paid' },
  { id: 'inst-h3', loanId: 'loan-harshil', installmentNo: 3, dueDate: '2026-06-15', amount: 2300, amountPaid: 0, status: 'pending' },

  // Manoj's installment: Paid installment 1, missed installment 2 on May 20
  { id: 'inst-m1', loanId: 'loan-manoj', installmentNo: 1, dueDate: '2026-04-20', amount: 2100, amountPaid: 2100, status: 'paid' },
  { id: 'inst-m2', loanId: 'loan-manoj', installmentNo: 2, dueDate: '2026-05-20', amount: 2100, amountPaid: 0, status: 'overdue' },

  // Parth's installment: Missed installment 1 on May 22
  { id: 'inst-p1', loanId: 'loan-parth', installmentNo: 1, dueDate: '2026-05-22', amount: 2650, amountPaid: 0, status: 'overdue' },

  // Chirag's installment: Paid 1, next on June 5
  { id: 'inst-c1', loanId: 'loan-chirag', installmentNo: 1, dueDate: '2026-05-05', amount: 2150, amountPaid: 2150, status: 'paid' },
  { id: 'inst-c2', loanId: 'loan-chirag', installmentNo: 2, dueDate: '2026-06-05', amount: 2150, amountPaid: 0, status: 'pending' },

  // Anil's installments: Paid all 4
  { id: 'inst-a1', loanId: 'loan-anil', installmentNo: 1, dueDate: '2026-02-05', amount: 2500, amountPaid: 2500, status: 'paid' },
  { id: 'inst-a2', loanId: 'loan-anil', installmentNo: 2, dueDate: '2026-03-05', amount: 2500, amountPaid: 2500, status: 'paid' },
  { id: 'inst-a3', loanId: 'loan-anil', installmentNo: 3, dueDate: '2026-04-05', amount: 2500, amountPaid: 2500, status: 'paid' },
  { id: 'inst-a4', loanId: 'loan-anil', installmentNo: 4, dueDate: '2026-05-05', amount: 2500, amountPaid: 2500, status: 'paid' }
];

export const defaultPayments: Payment[] = [
  { id: 'pmt-1', loanId: 'loan-harshil', amount: 5000, paymentDate: '2026-03-15T11:20:00Z', recordedBy: 'Jayeshbhai Patel', paymentMethod: 'cash', status: 'cleared', receiptNumber: 'REC-MR-44109' },
  { id: 'pmt-2', loanId: 'loan-harshil', amount: 2300, paymentDate: '2026-04-14T15:30:00Z', recordedBy: 'Amit Goswami', paymentMethod: 'upi', status: 'cleared', receiptNumber: 'REC-MR-45091' },
  { id: 'pmt-3', loanId: 'loan-harshil', amount: 2300, paymentDate: '2026-05-15T09:44:00Z', recordedBy: 'Jayeshbhai Patel', paymentMethod: 'upi', status: 'cleared', receiptNumber: 'REC-MR-45812' },
  { id: 'pmt-4', loanId: 'loan-manoj', amount: 3500, paymentDate: '2026-03-20T12:00:00Z', recordedBy: 'Jayeshbhai Patel', paymentMethod: 'cash', status: 'cleared', receiptNumber: 'REC-MR-44122' },
  { id: 'pmt-5', loanId: 'loan-manoj', amount: 2100, paymentDate: '2026-04-19T18:12:00Z', recordedBy: 'Amit Goswami', paymentMethod: 'upi', status: 'cleared', receiptNumber: 'REC-MR-45210' }
];

export const defaultSimChangeLogs: SimChangeLog[] = [
  {
    id: 'sim-1',
    deviceId: 'dev-manoj',
    oldIccid: '8991440902123512344',
    newIccid: '8991440902551049921',
    oldNumber: '+91 97262 55891',
    newNumber: '+91 91234 56789',
    alertedAt: '2026-05-24T14:15:00Z'
  }
];

export const defaultIntegrityAlerts: IntegrityAlert[] = [
  {
    id: 'int-1',
    deviceId: 'dev-manoj',
    type: 'usb_debugging',
    description: 'Developer Options and USB Debugging was enabled by customer.',
    detectedAt: '2026-05-25T11:02:00Z',
    autoLocked: true
  },
  {
    id: 'int-2',
    deviceId: 'dev-parth',
    type: 'fake_gps',
    description: 'Mock location app detected (GPS JoyStick active).',
    detectedAt: '2026-05-25T16:45:00Z',
    autoLocked: false
  }
];

export const defaultAuditLogs: AuditLog[] = [
  {
    id: 'aud-1',
    shopId: 'shop-rajkot',
    userId: 'user-jayesh',
    userEmail: 'owner.maruti@gmail.com',
    action: 'REGISTER_CUSTOMER',
    targetType: 'customer',
    targetId: 'cust-harshil',
    timestamp: '2026-03-15T11:15:00Z'
  },
  {
    id: 'aud-2',
    shopId: 'shop-rajkot',
    userId: 'user-jayesh',
    userEmail: 'owner.maruti@gmail.com',
    action: 'DEVICE_COMMAND_LOCK_LEVEL4',
    targetType: 'device',
    targetId: 'dev-manoj',
    timestamp: '2026-05-25T12:00:00Z'
  },
  {
    id: 'aud-3',
    shopId: 'shop-rajkot',
    userId: 'user-amit',
    userEmail: 'amit.staff@gmail.com',
    action: 'DEVICE_COMMAND_BLOCK_SOCIAL',
    targetType: 'device',
    targetId: 'dev-parth',
    timestamp: '2026-05-25T18:40:00Z'
  }
];
