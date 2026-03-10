/* ================================================================
   Mock Data — Thai locale, matches PRD domain model
   ================================================================ */

window.MockData = {

  // ─── Stats ───
  stats: {
    totalDevices: 127,
    activeDevices: 98,
    offlineDevices: 24,
    decommissioned: 5,
    totalTenants: 45,
    activeTenants: 42,
    suspendedTenants: 3,
    sessionsToday: 234,
    avgSessionMinutes: 8.5,
    tokensConsumedToday: 4521,
    tokensConsumedMonth: 128750,
    monthlyRevenue: 234500,
    pendingActivations: 12,
    activationRate: 92,
    selfActivateRatio: 68,
    kbUploadSuccess: 97,
    presetsCreated: 34,
    presetsActive: 28,
    subPlatforms: 2,
  },

  // ─── Device Models ───
  deviceModels: [
    { id: 'DM-001', name: 'AvatarRealfact Pro 55"',     size: '55"', resolution: '4K (3840x2160)',   spec: 'Intel i7, 32GB RAM, 512GB SSD', status: 'Active',       thumbnail: null, modifiedDate: '2026-01-10', modifiedBy: 'j.smith@realfact.ai' },
    { id: 'DM-002', name: 'AvatarRealfact Mini 32"',    size: '32"', resolution: '1080p (1920x1080)', spec: 'Intel i5, 16GB RAM, 256GB SSD', status: 'Active',       thumbnail: null, modifiedDate: '2026-01-10', modifiedBy: 'j.smith@realfact.ai' },
    { id: 'DM-003', name: 'AvatarRealfact Compact 27"', size: '27"', resolution: '1080p (1920x1080)', spec: 'Intel i5, 16GB RAM, 256GB SSD', status: 'Discontinued', thumbnail: null, modifiedDate: '2025-09-01', modifiedBy: 'super@realfact.ai' },
    { id: 'DM-004', name: 'AvatarRealfact Ultra 65"',   size: '65"', resolution: '4K (3840x2160)',   spec: 'Intel i9, 64GB RAM, 1TB SSD',  status: 'Active',       thumbnail: null, modifiedDate: '2026-02-05', modifiedBy: 'j.smith@realfact.ai' },
  ],

  // ─── Hardware Inventory (Devices) ───
  devices: [
    { sn: 'RF-2024-00001', macAddress: 'AC:DE:48:00:11:01', name: 'ตู้ล็อบบี้ ชั้น 1',       model: 'DM-001', modelName: 'Pro 55"',     registerCode: 'AV-X7K9M2', status: 'Activated',     soldTo: 'T-001', soldToName: 'ABC Corporation',     activatedBy: 'T-001', regDate: '2025-11-15', soldDate: '2025-12-01', activationDate: '2025-12-05', online: true,  modifiedDate: '2025-12-05', modifiedBy: 'admin@realfact.ai' },
    { sn: 'RF-2024-00002', macAddress: 'AC:DE:48:00:11:02', name: 'ตู้ต้อนรับ สาขาสยาม',     model: 'DM-002', modelName: 'Mini 32"',    registerCode: 'AV-B3P5Q8', status: 'Activated',     soldTo: 'T-001', soldToName: 'ABC Corporation',     activatedBy: 'T-001', regDate: '2025-11-15', soldDate: '2025-12-01', activationDate: '2025-12-08', online: true,  modifiedDate: '2025-12-08', modifiedBy: 'admin@realfact.ai' },
    { sn: 'RF-2024-00003', macAddress: 'AC:DE:48:00:11:03', name: 'Kiosk ชั้น 3 อาคาร A',    model: 'DM-001', modelName: 'Pro 55"',     registerCode: 'AV-D9H2L6', status: 'Activated',     soldTo: 'T-002', soldToName: 'XYZ Trading',         activatedBy: 'T-002', regDate: '2025-12-01', soldDate: '2025-12-15', activationDate: '2025-12-20', online: false, modifiedDate: '2025-12-20', modifiedBy: 'admin@realfact.ai' },
    { sn: 'RF-2024-00004', macAddress: 'AC:DE:48:00:11:04', name: 'ตู้หน้าสำนักงาน',         model: 'DM-004', modelName: 'Ultra 65"',   registerCode: 'AV-F4N7R3', status: 'Activated',     soldTo: 'T-003', soldToName: 'Thai Finance Group', activatedBy: 'T-003', regDate: '2025-12-10', soldDate: '2026-01-05', activationDate: '2026-01-10', online: true,  modifiedDate: '2026-01-10', modifiedBy: 'admin@realfact.ai' },
    { sn: 'RF-2024-00005', macAddress: 'AC:DE:48:00:11:05', name: 'Device #5',                model: 'DM-002', modelName: 'Mini 32"',    registerCode: 'AV-G8T2W5', status: 'Sold',          soldTo: 'T-004', soldToName: 'Bangkok Tech Co.',   activatedBy: null,    regDate: '2026-01-15', soldDate: '2026-02-01', activationDate: null,         online: false, modifiedDate: '2026-02-01', modifiedBy: 'admin@realfact.ai' },
    { sn: 'RF-2024-00006', macAddress: null,                 name: 'Device #6',                model: 'DM-001', modelName: 'Pro 55"',     registerCode: 'AV-J6Y9K4', status: 'Registered',    soldTo: null,    soldToName: null,                activatedBy: null,    regDate: '2026-02-20', soldDate: null,         activationDate: null,         online: false, modifiedDate: '2026-02-20', modifiedBy: 'admin@realfact.ai' },
    { sn: 'RF-2024-00007', macAddress: 'AC:DE:48:00:11:07', name: 'ตู้ทดสอบ QA',             model: 'DM-003', modelName: 'Compact 27"', registerCode: 'AV-M2C8V7', status: 'Decommissioned', soldTo: 'T-001', soldToName: 'ABC Corporation',   activatedBy: 'T-001', regDate: '2025-06-01', soldDate: '2025-07-01', activationDate: '2025-07-05', online: false, modifiedDate: '2026-01-15', modifiedBy: 'super@realfact.ai' },
    { sn: 'RF-2025-00008', macAddress: 'AC:DE:48:00:12:08', name: 'ตู้สาขาเชียงใหม่',        model: 'DM-002', modelName: 'Mini 32"',    registerCode: 'AV-P5E3A9', status: 'Activated',     soldTo: 'T-005', soldToName: 'Northern Star Hotel', activatedBy: 'T-005', regDate: '2026-01-20', soldDate: '2026-02-10', activationDate: '2026-02-15', online: true,  modifiedDate: '2026-02-15', modifiedBy: 'admin@realfact.ai' },
    { sn: 'RF-2025-00009', macAddress: 'AC:DE:48:00:12:09', name: 'ตู้ Reception Tower B',    model: 'DM-004', modelName: 'Ultra 65"',   registerCode: 'AV-S7U4Z1', status: 'Activated',     soldTo: 'T-003', soldToName: 'Thai Finance Group', activatedBy: 'T-003', regDate: '2026-02-01', soldDate: '2026-02-15', activationDate: '2026-02-20', online: true,  modifiedDate: '2026-02-20', modifiedBy: 'admin@realfact.ai' },
    { sn: 'RF-2025-00010', macAddress: 'AC:DE:48:00:12:10', name: 'Device #10',               model: 'DM-001', modelName: 'Pro 55"',     registerCode: 'AV-W3H6B8', status: 'Sold',          soldTo: 'T-006', soldToName: 'Phuket Resort & Spa', activatedBy: null,   regDate: '2026-02-25', soldDate: '2026-03-01', activationDate: null,         online: false, modifiedDate: '2026-03-01', modifiedBy: 'admin@realfact.ai' },
  ],

  // ─── Tenants ───
  tenants: [
    { id: 'T-001', name: 'ABC Corporation',    plan: 'Pro',     planPrice: 4990, members: 4, devices: 2, tokenBalance: 15420, bonusTokens: 800,  purchasedTokens: 14620, status: 'Active',    email: 'admin@abccorp.co.th',           phone: '02-123-4567', regDate: '2025-11-01', lastActive: '2026-03-02', modifiedDate: '2026-03-02', modifiedBy: 'admin@realfact.ai' },
    { id: 'T-002', name: 'XYZ Trading',        plan: 'Starter', planPrice: 990,  members: 2, devices: 1, tokenBalance: 3250,  bonusTokens: 500,  purchasedTokens: 2750,  status: 'Active',    email: 'contact@xyztrading.com',        phone: '02-234-5678', regDate: '2025-12-15', lastActive: '2026-03-01', modifiedDate: '2026-02-10', modifiedBy: 'admin@realfact.ai' },
    { id: 'T-003', name: 'Thai Finance Group', plan: 'Pro',     planPrice: 4990, members: 8, devices: 2, tokenBalance: 42800, bonusTokens: 1500, purchasedTokens: 41300, status: 'Active',    email: 'it@thaifinance.co.th',          phone: '02-345-6789', regDate: '2026-01-05', lastActive: '2026-03-02', modifiedDate: '2026-03-01', modifiedBy: 'admin@realfact.ai' },
    { id: 'T-004', name: 'Bangkok Tech Co.',   plan: 'Starter', planPrice: 990,  members: 3, devices: 0, tokenBalance: 1000,  bonusTokens: 1000, purchasedTokens: 0,     status: 'Active',    email: 'info@bkktech.co.th',            phone: '02-456-7890', regDate: '2026-02-01', lastActive: '2026-02-28', modifiedDate: '2026-02-01', modifiedBy: 'admin@realfact.ai' },
    { id: 'T-005', name: 'Northern Star Hotel',plan: 'Pro',     planPrice: 4990, members: 5, devices: 1, tokenBalance: 8900,  bonusTokens: 1200, purchasedTokens: 7700,  status: 'Active',    email: 'reception@northernstar.co.th',  phone: '053-123-456', regDate: '2026-01-20', lastActive: '2026-03-02', modifiedDate: '2026-02-15', modifiedBy: 'admin@realfact.ai' },
    { id: 'T-006', name: 'Phuket Resort & Spa',plan: 'Starter', planPrice: 990,  members: 2, devices: 0, tokenBalance: 1000,  bonusTokens: 1000, purchasedTokens: 0,     status: 'Active',    email: 'admin@phuketresort.com',        phone: '076-234-567', regDate: '2026-02-25', lastActive: '2026-03-01', modifiedDate: '2026-02-25', modifiedBy: 'admin@realfact.ai' },
    { id: 'T-007', name: 'Metro Hospital',     plan: 'Free',    planPrice: 0,    members: 1, devices: 0, tokenBalance: 100,   bonusTokens: 100,  purchasedTokens: 0,     status: 'Active',    email: 'it@metrohospital.co.th',        phone: '02-567-8901', regDate: '2026-02-28', lastActive: '2026-03-01', modifiedDate: '2026-02-28', modifiedBy: 'admin@realfact.ai' },
    { id: 'T-008', name: 'Sunrise Education',  plan: 'Starter', planPrice: 990,  members: 3, devices: 1, tokenBalance: 450,   bonusTokens: 0,    purchasedTokens: 450,   status: 'Suspended', email: 'admin@sunrise-edu.ac.th',       phone: '02-678-9012', regDate: '2025-10-15', lastActive: '2026-01-20', modifiedDate: '2026-01-21', modifiedBy: 'finance@realfact.ai' },
  ],

  // ─── Avatar Presets ───
  presets: [
    { id: 'P-001', name: 'คุณพิมพ์ใจ — ที่ปรึกษาการเงิน',  avatarName: 'Female Thai Professional', voiceName: 'Thai Female Warm',     agentPrompt: 'คุณคือผู้เชี่ยวชาญด้านการเงินการลงทุน พูดจาสุภาพ ใช้ภาษาที่เข้าใจง่าย',        kbId: 'KB-001', kbName: 'คู่มือผลิตภัณฑ์การเงิน',   assignedTenants: ['T-001', 'T-003'], compatibleModels: ['DM-001', 'DM-004'],        suggested: true,  status: 'Active', modifiedDate: '2026-02-28', modifiedBy: 'admin@realfact.ai' },
    { id: 'P-002', name: 'คุณสมชาย — พนักงานต้อนรับ',      avatarName: 'Male Thai Formal',         voiceName: 'Thai Male Standard',   agentPrompt: 'คุณคือพนักงานต้อนรับมืออาชีพ ให้ข้อมูลสถานที่ บริการ และแนะนำเส้นทาง',     kbId: 'KB-002', kbName: 'ข้อมูลอาคารและบริการ',   assignedTenants: ['T-002', 'T-005'], compatibleModels: ['DM-001', 'DM-002'],        suggested: false, status: 'Active', modifiedDate: '2026-02-20', modifiedBy: 'admin@realfact.ai' },
    { id: 'P-003', name: 'น้องมิว — ผู้ช่วยทั่วไป',        avatarName: 'Female Thai Casual',       voiceName: 'Thai Female Friendly', agentPrompt: 'คุณคือผู้ช่วยอัจฉริยะ ตอบคำถามทั่วไป พูดเป็นกันเอง สนุกสนาน',              kbId: null,     kbName: null,                       assignedTenants: [],                 compatibleModels: ['DM-001', 'DM-002', 'DM-004'], suggested: false, status: 'Active', isDefault: true, modifiedDate: '2026-01-15', modifiedBy: 'super@realfact.ai' },
    { id: 'P-004', name: 'Dr.มาย — ที่ปรึกษาสุขภาพ',      avatarName: 'Female Thai Medical',      voiceName: 'Thai Female Calm',     agentPrompt: 'คุณคือที่ปรึกษาด้านสุขภาพเบื้องต้น ให้คำแนะนำทั่วไป แนะนำพบแพทย์เมื่อจำเป็น', kbId: 'KB-003', kbName: 'คู่มือสุขภาพเบื้องต้น', assignedTenants: ['T-003'],           compatibleModels: ['DM-001', 'DM-004'],        suggested: false, status: 'Draft',  modifiedDate: '2026-03-01', modifiedBy: 'admin@realfact.ai' },
    { id: 'P-005', name: 'คุณณัฐ — Concierge โรงแรม',      avatarName: 'Male Thai Hospitality',    voiceName: 'Thai Male Warm',       agentPrompt: 'คุณคือ Concierge ระดับ 5 ดาว แนะนำร้านอาหาร สถานที่ท่องเที่ยว บริการโรงแรม', kbId: 'KB-004', kbName: 'ข้อมูลโรงแรมและท่องเที่ยว', assignedTenants: ['T-005', 'T-006'], compatibleModels: ['DM-002', 'DM-004'],        suggested: true,  status: 'Active', modifiedDate: '2026-03-01', modifiedBy: 'admin@realfact.ai' },
  ],

  // ─── Knowledge Bases ───
  knowledgeBases: [
    { id: 'KB-001', name: 'คู่มือผลิตภัณฑ์การเงิน',    tenantId: 'T-003', tenantName: 'Thai Finance Group',  documents: 12, chunks: 1547, embeddings: 1547, totalSize: '24.5 MB', status: 'Ready',      lastUpdated: '2026-02-28', presets: ['P-001'], modifiedDate: '2026-02-28', modifiedBy: 'admin@realfact.ai' },
    { id: 'KB-002', name: 'ข้อมูลอาคารและบริการ',       tenantId: 'T-002', tenantName: 'XYZ Trading',         documents: 5,  chunks: 423,  embeddings: 423,  totalSize: '8.2 MB',  status: 'Ready',      lastUpdated: '2026-02-20', presets: ['P-002'], modifiedDate: '2026-02-20', modifiedBy: 'admin@realfact.ai' },
    { id: 'KB-003', name: 'คู่มือสุขภาพเบื้องต้น',     tenantId: 'T-003', tenantName: 'Thai Finance Group',  documents: 8,  chunks: 956,  embeddings: 956,  totalSize: '15.8 MB', status: 'Ready',      lastUpdated: '2026-02-25', presets: ['P-004'], modifiedDate: '2026-02-25', modifiedBy: 'admin@realfact.ai' },
    { id: 'KB-004', name: 'ข้อมูลโรงแรมและท่องเที่ยว', tenantId: 'T-005', tenantName: 'Northern Star Hotel', documents: 15, chunks: 2103, embeddings: 2103, totalSize: '32.1 MB', status: 'Ready',      lastUpdated: '2026-03-01', presets: ['P-005'], modifiedDate: '2026-03-01', modifiedBy: 'admin@realfact.ai' },
    { id: 'KB-005', name: 'FAQ สินค้า ABC Corp',         tenantId: 'T-001', tenantName: 'ABC Corporation',    documents: 3,  chunks: 0,    embeddings: 0,    totalSize: '4.7 MB',  status: 'Processing', lastUpdated: '2026-03-02', presets: [],        modifiedDate: '2026-03-02', modifiedBy: 'admin@realfact.ai' },
  ],

  // ─── Sessions (Recent) ───
  sessions: [
    { id: 'S-001', subPlatform: 'avatar', deviceSn: 'RF-2024-00001', deviceName: 'ตู้ล็อบบี้ ชั้น 1', tenantId: 'T-001', tenantName: 'ABC Corporation', presetId: 'P-001', presetName: 'คุณพิมพ์ใจ', start: '2026-03-02 09:15', end: '2026-03-02 09:28', duration: 13, tokens: 13, status: 'Completed' },
    { id: 'S-002', subPlatform: 'avatar', deviceSn: 'RF-2024-00002', deviceName: 'ตู้ต้อนรับ สาขาสยาม', tenantId: 'T-001', tenantName: 'ABC Corporation', presetId: 'P-002', presetName: 'คุณสมชาย', start: '2026-03-02 09:30', end: '2026-03-02 09:35', duration: 5, tokens: 5, status: 'Completed' },
    { id: 'S-003', subPlatform: 'avatar', deviceSn: 'RF-2024-00004', deviceName: 'ตู้หน้าสำนักงาน', tenantId: 'T-003', tenantName: 'Thai Finance Group', presetId: 'P-001', presetName: 'คุณพิมพ์ใจ', start: '2026-03-02 10:00', end: null, duration: null, tokens: null, status: 'Active' },
    { id: 'S-004', subPlatform: 'avatar', deviceSn: 'RF-2025-00008', deviceName: 'ตู้สาขาเชียงใหม่', tenantId: 'T-005', tenantName: 'Northern Star Hotel', presetId: 'P-005', presetName: 'คุณณัฐ', start: '2026-03-02 08:45', end: '2026-03-02 09:12', duration: 27, tokens: 27, status: 'Completed' },
    { id: 'S-005', subPlatform: 'avatar', deviceSn: 'RF-2025-00009', deviceName: 'ตู้ Reception Tower B', tenantId: 'T-003', tenantName: 'Thai Finance Group', presetId: 'P-001', presetName: 'คุณพิมพ์ใจ', start: '2026-03-02 10:15', end: null, duration: null, tokens: null, status: 'Active' },
    { id: 'S-006', subPlatform: 'avatar', deviceSn: 'RF-2024-00001', deviceName: 'ตู้ล็อบบี้ ชั้น 1', tenantId: 'T-001', tenantName: 'ABC Corporation', presetId: 'P-001', presetName: 'คุณพิมพ์ใจ', start: '2026-03-02 10:30', end: null, duration: null, tokens: null, status: 'Active' },
    { id: 'S-007', subPlatform: 'avatar', deviceSn: 'RF-2024-00004', deviceName: 'ตู้หน้าสำนักงาน', tenantId: 'T-003', tenantName: 'Thai Finance Group', presetId: 'P-004', presetName: 'Dr.มาย', start: '2026-03-01 14:20', end: '2026-03-01 14:35', duration: 15, tokens: 15, status: 'Completed' },
    { id: 'S-008', subPlatform: 'avatar', deviceSn: 'RF-2024-00002', deviceName: 'ตู้ต้อนรับ สาขาสยาม', tenantId: 'T-001', tenantName: 'ABC Corporation', presetId: 'P-003', presetName: 'น้องมิว', start: '2026-03-01 16:00', end: '2026-03-01 16:22', duration: 22, tokens: 22, status: 'Completed' },
  ],

  // ─── Assign Log ───
  assignLogs: [
    { id: 'AL-001', timestamp: '2026-03-01 09:00', deviceSn: 'RF-2024-00001', deviceName: 'ตู้ล็อบบี้ ชั้น 1', newPreset: 'P-001', newPresetName: 'คุณพิมพ์ใจ', oldPreset: 'P-003', oldPresetName: 'น้องมิว', actor: 'admin@abccorp.co.th', tenantName: 'ABC Corporation' },
    { id: 'AL-002', timestamp: '2026-02-28 14:30', deviceSn: 'RF-2025-00008', deviceName: 'ตู้สาขาเชียงใหม่', newPreset: 'P-005', newPresetName: 'คุณณัฐ', oldPreset: 'P-003', oldPresetName: 'น้องมิว', actor: 'admin@northernstar.co.th', tenantName: 'Northern Star Hotel' },
    { id: 'AL-003', timestamp: '2026-02-25 10:15', deviceSn: 'RF-2025-00009', deviceName: 'ตู้ Reception Tower B', newPreset: 'P-001', newPresetName: 'คุณพิมพ์ใจ', oldPreset: null, oldPresetName: '(ไม่มี)', actor: 'Platform Admin', tenantName: 'Thai Finance Group' },
  ],

  // ─── Invoices ───
  invoices: [
    { id: 'INV-202603-00001', tenantId: 'T-001', tenantName: 'ABC Corporation',    subPlatform: 'Avatar', type: 'Subscription', description: 'Avatar Pro - March 2026',     amount: 4990, vat: 349.30, total: 5339.30, status: 'Paid',                 issuedDate: '2026-03-01', dueDate: '2026-03-15', paidDate: '2026-03-02', method: 'Card (2C2P)' },
    { id: 'INV-202603-00002', tenantId: 'T-003', tenantName: 'Thai Finance Group', subPlatform: 'Avatar', type: 'Subscription', description: 'Avatar Pro - March 2026',     amount: 4990, vat: 349.30, total: 5339.30, status: 'Paid',                 issuedDate: '2026-03-01', dueDate: '2026-03-15', paidDate: '2026-03-01', method: 'Card (2C2P)' },
    { id: 'INV-202603-00003', tenantId: 'T-002', tenantName: 'XYZ Trading',        subPlatform: 'Avatar', type: 'Subscription', description: 'Avatar Starter - March 2026', amount: 990,  vat: 69.30,  total: 1059.30, status: 'Issued',               issuedDate: '2026-03-01', dueDate: '2026-03-15', paidDate: null,         method: null },
    { id: 'INV-202603-00004', tenantId: 'T-005', tenantName: 'Northern Star Hotel', subPlatform: 'Avatar', type: 'Subscription', description: 'Avatar Pro - March 2026',     amount: 4990, vat: 349.30, total: 5339.30, status: 'Pending Verification', issuedDate: '2026-03-01', dueDate: '2026-03-15', paidDate: null,         method: 'Bank Transfer' },
    { id: 'INV-202602-00012', tenantId: 'T-001', tenantName: 'ABC Corporation',    subPlatform: 'Avatar', type: 'Token Top-up', description: 'Token Top-up (5,000 tokens)', amount: 2500, vat: 175.00, total: 2675.00, status: 'Paid',                 issuedDate: '2026-02-14', dueDate: '2026-02-28', paidDate: '2026-02-14', method: 'Card (2C2P)' },
    { id: 'INV-202602-00008', tenantId: 'T-008', tenantName: 'Sunrise Education',  subPlatform: 'Avatar', type: 'Subscription', description: 'Avatar Starter - Feb 2026',   amount: 990,  vat: 69.30,  total: 1059.30, status: 'Overdue',              issuedDate: '2026-02-01', dueDate: '2026-02-15', paidDate: null,         method: null },
    // ── Developer Portal — Credit Line Invoices ──
    { id: 'INV-DEV-202602-001', tenantId: 'T-DP-001', tenantName: 'FinTech Co., Ltd.',  subPlatform: 'Developer Portal', type: 'Credit Line', description: 'API Usage — Feb 2026',  amount: 38500, vat: 2695.00, total: 41195.00, status: 'Paid',    issuedDate: '2026-02-28', dueDate: '2026-03-30', paidDate: '2026-03-05', method: 'Bank Transfer' },
    { id: 'INV-DEV-202601-001', tenantId: 'T-DP-001', tenantName: 'FinTech Co., Ltd.',  subPlatform: 'Developer Portal', type: 'Credit Line', description: 'API Usage — Jan 2026',  amount: 31200, vat: 2184.00, total: 33384.00, status: 'Paid',    issuedDate: '2026-01-31', dueDate: '2026-03-02', paidDate: '2026-02-20', method: 'Bank Transfer' },
    { id: 'INV-DEV-202602-002', tenantId: 'T-DP-002', tenantName: 'DataDriven Ltd.',    subPlatform: 'Developer Portal', type: 'Credit Line', description: 'API Usage — Feb 2026',  amount: 15200, vat: 1064.00, total: 16264.00, status: 'Paid',    issuedDate: '2026-02-28', dueDate: '2026-03-30', paidDate: '2026-03-08', method: 'Bank Transfer' },
    { id: 'INV-DEV-202603-001', tenantId: 'T-DP-001', tenantName: 'FinTech Co., Ltd.',  subPlatform: 'Developer Portal', type: 'Credit Line', description: 'API Usage — Mar 2026',  amount: 42800, vat: 2996.00, total: 45796.00, status: 'Issued',  issuedDate: '2026-03-01', dueDate: '2026-03-31', paidDate: null,         method: null },
    { id: 'INV-DEV-202603-002', tenantId: 'T-DP-002', tenantName: 'DataDriven Ltd.',    subPlatform: 'Developer Portal', type: 'Credit Line', description: 'API Usage — Mar 2026',  amount: 18500, vat: 1295.00, total: 19795.00, status: 'Issued',  issuedDate: '2026-03-01', dueDate: '2026-03-31', paidDate: null,         method: null },
    { id: 'INV-DEV-202603-003', tenantId: 'T-DP-003', tenantName: 'SmartBot Inc.',      subPlatform: 'Developer Portal', type: 'Credit Line', description: 'API Usage — Mar 2026',  amount: 24800, vat: 1736.00, total: 26536.00, status: 'Issued',  issuedDate: '2026-03-01', dueDate: '2026-03-15', paidDate: null,         method: null },
  ],

  // ─── Purchase Log ───
  purchaseLog: [
    { date: '2026-03-02', tenantName: 'ABC Corporation', subPlatform: 'Avatar', type: 'Subscription', description: 'Avatar Pro - Monthly', method: 'Card (2C2P)', amount: 5339.30, status: 'Completed', ref: 'RF-2603-0001' },
    { date: '2026-03-01', tenantName: 'Thai Finance Group', subPlatform: 'Avatar', type: 'Subscription', description: 'Avatar Pro - Monthly', method: 'Card (2C2P)', amount: 5339.30, status: 'Completed', ref: 'RF-2603-0002' },
    { date: '2026-03-01', tenantName: 'Northern Star Hotel', subPlatform: 'Avatar', type: 'Subscription', description: 'Avatar Pro - Monthly', method: 'Bank Transfer', amount: 5339.30, status: 'Pending', ref: 'RF-2603-0004' },
    { date: '2026-03-01', tenantName: 'XYZ Trading', subPlatform: 'Avatar', type: 'Subscription', description: 'Avatar Starter - Monthly', method: '-', amount: 1059.30, status: 'Pending', ref: 'RF-2603-0003' },
    { date: '2026-02-14', tenantName: 'ABC Corporation', subPlatform: 'Avatar', type: 'Token Top-up', description: 'Token Top-up (5,000 tokens)', method: 'Card (2C2P)', amount: 2675.00, status: 'Completed', ref: 'RF-2602-0012' },
    { date: '2026-02-01', tenantName: 'Sunrise Education', subPlatform: 'Avatar', type: 'Subscription', description: 'Avatar Starter - Monthly', method: '-', amount: 1059.30, status: 'Overdue', ref: 'RF-2602-0008' },
    // ── Developer Portal — Credit Line Purchase Log ──
    { date: '2026-03-05', tenantName: 'FinTech Co., Ltd.',  subPlatform: 'Developer Portal', type: 'Credit Line', description: 'API Usage — Feb 2026',  method: 'Bank Transfer', amount: 41195.00, status: 'Completed', ref: 'RF-DEV-2603-0001' },
    { date: '2026-02-20', tenantName: 'FinTech Co., Ltd.',  subPlatform: 'Developer Portal', type: 'Credit Line', description: 'API Usage — Jan 2026',  method: 'Bank Transfer', amount: 33384.00, status: 'Completed', ref: 'RF-DEV-2602-0001' },
    { date: '2026-03-08', tenantName: 'DataDriven Ltd.',    subPlatform: 'Developer Portal', type: 'Credit Line', description: 'API Usage — Feb 2026',  method: 'Bank Transfer', amount: 16264.00, status: 'Completed', ref: 'RF-DEV-2603-0002' },
  ],

  // ─── Payment Verification Log (append-only) ───
  verificationLog: [
    { id: 'VL-001', invoiceId: 'INV-202602-00005', tenantId: 'T-002', tenantName: 'XYZ Trading',        amount: 1059.30, action: 'Approved', reason: null,                                         verifiedBy: 'finance@realfact.ai', verifiedDate: '2026-02-10', verifiedTime: '10:15' },
    { id: 'VL-002', invoiceId: 'INV-202602-00007', tenantId: 'T-005', tenantName: 'Northern Star Hotel', amount: 5339.30, action: 'Rejected', reason: 'สลิปไม่ชัดเจน ไม่สามารถอ่านข้อมูลได้', verifiedBy: 'finance@realfact.ai', verifiedDate: '2026-02-18', verifiedTime: '14:30' },
  ],

  // ─── Session Usage Logs (from AI Framework) ───
  // Each completed session reports which services it consumed
  // type: 'primary' → costPerUnit, 'input' → costPerUnit (input), 'output' → outputCostPerUnit
  sessionUsageLogs: [
    // S-001: 13 min Avatar session
    { sessionId: 'S-001', serviceCode: 'avatar-session',              type: 'primary', quantity: 13 },
    { sessionId: 'S-001', serviceCode: 'anthropic-claude-sonnet-4-6', type: 'input',   quantity: 3250 },
    { sessionId: 'S-001', serviceCode: 'anthropic-claude-sonnet-4-6', type: 'output',  quantity: 1100 },
    { sessionId: 'S-001', serviceCode: 'elevenlabs-turbo-v2-5',       type: 'primary', quantity: 26 },
    // S-002: 5 min Avatar session
    { sessionId: 'S-002', serviceCode: 'avatar-session',              type: 'primary', quantity: 5 },
    { sessionId: 'S-002', serviceCode: 'anthropic-claude-sonnet-4-6', type: 'input',   quantity: 1200 },
    { sessionId: 'S-002', serviceCode: 'anthropic-claude-sonnet-4-6', type: 'output',  quantity: 480 },
    { sessionId: 'S-002', serviceCode: 'elevenlabs-turbo-v2-5',       type: 'primary', quantity: 10 },
    // S-004: 27 min Avatar session (long session)
    { sessionId: 'S-004', serviceCode: 'avatar-session',              type: 'primary', quantity: 27 },
    { sessionId: 'S-004', serviceCode: 'anthropic-claude-sonnet-4-6', type: 'input',   quantity: 6750 },
    { sessionId: 'S-004', serviceCode: 'anthropic-claude-sonnet-4-6', type: 'output',  quantity: 2700 },
    { sessionId: 'S-004', serviceCode: 'elevenlabs-turbo-v2-5',       type: 'primary', quantity: 54 },
    { sessionId: 'S-004', serviceCode: 'openai-embedding-3-small',    type: 'input',   quantity: 1500 },
    // S-007: 15 min Avatar session
    { sessionId: 'S-007', serviceCode: 'avatar-session',              type: 'primary', quantity: 15 },
    { sessionId: 'S-007', serviceCode: 'anthropic-claude-sonnet-4-6', type: 'input',   quantity: 3800 },
    { sessionId: 'S-007', serviceCode: 'anthropic-claude-sonnet-4-6', type: 'output',  quantity: 1500 },
    { sessionId: 'S-007', serviceCode: 'elevenlabs-turbo-v2-5',       type: 'primary', quantity: 30 },
    { sessionId: 'S-007', serviceCode: 'openai-embedding-3-small',    type: 'input',   quantity: 800 },
    // S-008: 22 min Avatar session
    { sessionId: 'S-008', serviceCode: 'avatar-session',              type: 'primary', quantity: 22 },
    { sessionId: 'S-008', serviceCode: 'anthropic-claude-sonnet-4-6', type: 'input',   quantity: 5500 },
    { sessionId: 'S-008', serviceCode: 'anthropic-claude-sonnet-4-6', type: 'output',  quantity: 2200 },
    { sessionId: 'S-008', serviceCode: 'elevenlabs-turbo-v2-5',       type: 'primary', quantity: 44 },
  ],

  // ─── Sub-Platforms ───
  subPlatforms: [
    { id: 'SP-001', name: 'Avatar (Live Interact)', code: 'avatar',  domain: 'avatar.realfact.ai',  status: 'Active',     tenants: 45, revenue: 234500, tokenUsage: 128750, plans: ['Free', 'Starter', 'Pro'],     exchangeRateValue: 1, exchangeRateUnit: 'Minute',  exchangeRate: '1 Token = 1 Minute',  logo: null, primaryColor: '#f15b26', created: '2025-10-01', modifiedDate: '2026-02-01', modifiedBy: 'super@realfact.ai' },
    { id: 'SP-002', name: 'AI Booking',            code: 'booking', domain: 'booking.realfact.ai', status: 'Configured', tenants: 0,  revenue: 0,      tokenUsage: 0,      plans: ['Free', 'Basic', 'Premium'], exchangeRateValue: 1, exchangeRateUnit: 'Request', exchangeRate: '1 Token = 1 Request', logo: null, primaryColor: '#3b82f6', created: '2026-02-15', modifiedDate: '2026-02-15', modifiedBy: 'super@realfact.ai' },
  ],

  // ─── Subscription Plans ───
  plans: [
    { id: 'PL-001', name: 'Free',    subPlatform: 'avatar', price: 0,    bonusTokens: 100,  features: ['Basic Avatar', '1 Preset', 'Community Support'],                                         status: 'Active', modifiedDate: '2026-01-01', modifiedBy: 'super@realfact.ai' },
    { id: 'PL-002', name: 'Starter', subPlatform: 'avatar', price: 990,  bonusTokens: 1000, features: ['3 Avatars', '5 Presets', 'Knowledge Base', 'Email Support'],                            status: 'Active', modifiedDate: '2026-01-01', modifiedBy: 'super@realfact.ai' },
    { id: 'PL-003', name: 'Pro',     subPlatform: 'avatar', price: 4990, bonusTokens: 5000, features: ['Unlimited Avatars', 'Unlimited Presets', 'Priority KB', 'Custom Agent', 'Phone Support'], status: 'Active', modifiedDate: '2026-02-15', modifiedBy: 'super@realfact.ai' },
  ],

  // ─── Cost Config (Service Codes) ───
  costConfig: [
    // ── Platform ──
    { serviceCode: 'avatar-session',              name: 'Avatar Session',     provider: 'RealfactAI', model: '-',                     billingType: 'Per Minute',  costPerUnit: 0.5000,    currency: 'THB', effectiveDate: '2026-01-01', status: 'Active', modifiedDate: '2026-01-01', modifiedBy: 'super@realfact.ai' },
    // ── LLM ──
    { serviceCode: 'anthropic-claude-sonnet-4-6', name: 'Claude Sonnet 4.6', provider: 'Anthropic',  model: 'claude-sonnet-4-6',     billingType: 'Per Token',   costPerUnit: 0.0003,    outputCostPerUnit: 0.0015,  currency: 'THB', effectiveDate: '2026-01-01', status: 'Active', modifiedDate: '2026-01-01', modifiedBy: 'admin@realfact.ai' },
    { serviceCode: 'openai-gpt-4o',               name: 'GPT-4o',            provider: 'OpenAI',     model: 'gpt-4o',                billingType: 'Per Token',   costPerUnit: 0.00018,   outputCostPerUnit: 0.00054, currency: 'THB', effectiveDate: '2026-01-01', status: 'Active', modifiedDate: '2026-01-01', modifiedBy: 'admin@realfact.ai' },
    // ── TTS ──
    { serviceCode: 'elevenlabs-turbo-v2-5',       name: 'ElevenLabs Turbo',  provider: 'ElevenLabs', model: 'eleven_turbo_v2_5',     billingType: 'Per Request', costPerUnit: 0.0380,    currency: 'THB', effectiveDate: '2026-01-01', status: 'Active', modifiedDate: '2026-01-01', modifiedBy: 'admin@realfact.ai' },
    // ── Embedding ──
    { serviceCode: 'openai-embedding-3-small',    name: 'Embedding 3 Small', provider: 'OpenAI',     model: 'text-embedding-3-small', billingType: 'Per Token',  costPerUnit: 0.0000007, currency: 'THB', effectiveDate: '2026-01-01', status: 'Active', modifiedDate: '2026-01-01', modifiedBy: 'admin@realfact.ai' },
  ],

  // ─── Margin Config ───
  marginConfig: {
    global: 30,
    modifiedDate: '2026-02-01',
    modifiedBy: 'super@realfact.ai',
    providers: [
      { name: 'Anthropic',   margin: 35, modifiedDate: '2026-02-01', modifiedBy: 'super@realfact.ai' },
      { name: 'OpenAI',      margin: 30, modifiedDate: '2026-01-01', modifiedBy: 'super@realfact.ai' },
      { name: 'Google',      margin: 25, modifiedDate: '2026-01-01', modifiedBy: 'super@realfact.ai' },
      { name: 'ElevenLabs',  margin: 40, modifiedDate: '2026-01-01', modifiedBy: 'super@realfact.ai' },
      { name: 'RealfactAI',  margin: 45, modifiedDate: '2026-01-01', modifiedBy: 'super@realfact.ai' },
    ],
    serviceCodes: [
      { code: 'avatar-session',              margin: 50, modifiedDate: '2026-01-15 10:00', modifiedBy: 'j.smith@realfact.ai' },
      { code: 'anthropic-claude-sonnet-4-6', margin: 38, modifiedDate: '2026-02-10 14:30', modifiedBy: 'j.smith@realfact.ai' },
      { code: 'openai-embedding-3-small',    margin: 20, modifiedDate: '2026-01-14 16:45', modifiedBy: 'j.doe@realfact.ai'   },
    ],
  },

  // ─── Credit Lines (M-BE-07 FR71-77) ───
  creditLines: [
    { id: 'CL-001', tenantId: 'T-003', tenantName: 'Thai Finance Group', creditLimit: 100000, usedAmount: 42800,  availableCredit: 57200, billingCycle: 30, paymentTerms: 'Net 30', status: 'Active',    approvedDate: '2026-01-10', approvedBy: 'Finance Admin', lastInvoice: 'INV-202603-00002', modifiedDate: '2026-03-01', modifiedBy: 'finance@realfact.ai' },
    { id: 'CL-002', tenantId: 'T-001', tenantName: 'ABC Corporation',    creditLimit: 50000,  usedAmount: 15420,  availableCredit: 34580, billingCycle: 30, paymentTerms: 'Net 30', status: 'Active',    approvedDate: '2025-12-01', approvedBy: 'Finance Admin', lastInvoice: 'INV-202603-00001', modifiedDate: '2026-02-01', modifiedBy: 'finance@realfact.ai' },
    { id: 'CL-003', tenantId: 'T-008', tenantName: 'Sunrise Education',  creditLimit: 20000,  usedAmount: 1059.30,availableCredit: 0,     billingCycle: 30, paymentTerms: 'Net 30', status: 'Suspended', approvedDate: '2025-10-20', approvedBy: 'Finance Admin', lastInvoice: 'INV-202602-00008', modifiedDate: '2026-01-21', modifiedBy: 'finance@realfact.ai' },
    // ── Developer Portal Credit Lines ──
    { id: 'CL-DP-001', tenantId: 'T-DP-001', tenantName: 'FinTech Co., Ltd.',  source: 'Developer Portal', creditLimit: 100000, usedAmount: 42800,  availableCredit: 57200, billingCycle: 30, paymentTerms: 'Net 30', status: 'Active', approvedDate: '2025-11-20', approvedBy: 'Finance Admin', lastInvoice: 'INV-DEV-202603-001', modifiedDate: '2026-03-01', modifiedBy: 'finance@realfact.ai' },
    { id: 'CL-DP-002', tenantId: 'T-DP-002', tenantName: 'DataDriven Ltd.',    source: 'Developer Portal', creditLimit: 50000,  usedAmount: 18500,  availableCredit: 31500, billingCycle: 30, paymentTerms: 'Net 30', status: 'Active', approvedDate: '2026-01-15', approvedBy: 'Finance Admin', lastInvoice: 'INV-DEV-202603-002', modifiedDate: '2026-03-01', modifiedBy: 'finance@realfact.ai' },
    { id: 'CL-DP-003', tenantId: 'T-DP-003', tenantName: 'SmartBot Inc.',      source: 'Developer Portal', creditLimit: 30000,  usedAmount: 24800,  availableCredit: 5200,  billingCycle: 30, paymentTerms: 'Net 15', status: 'Active', approvedDate: '2026-02-05', approvedBy: 'Finance Admin', lastInvoice: 'INV-DEV-202603-003', modifiedDate: '2026-03-01', modifiedBy: 'finance@realfact.ai' },
    { id: 'CL-DP-004', tenantId: 'T-DP-004', tenantName: 'CloudNine Tech',     source: 'Developer Portal', creditLimit: 80000,  usedAmount: 0,      availableCredit: 80000, billingCycle: 60, paymentTerms: 'Net 60', status: 'Active', approvedDate: '2025-12-10', approvedBy: 'Finance Admin', lastInvoice: null,                 modifiedDate: '2025-12-10', modifiedBy: 'finance@realfact.ai' },
  ],

  // ─── Credit Line Requests ───
  creditLineRequests: [
    { id: 'CLR-001', tenantId: 'T-005', tenantName: 'Northern Star Hotel', requestedLimit: 80000, companyName: 'Northern Star Hotel Co., Ltd.', taxId: '0105565012345', documents: 2, status: 'Pending', requestDate: '2026-03-01', reviewedBy: null, modifiedDate: '2026-03-01', modifiedBy: 'finance@realfact.ai' },
  ],

  // ─── Credit Line Approval Log ───
  creditLineApprovalLog: [
    { id: 'CLOG-001', creditLineId: 'CL-001', tenantId: 'T-003', tenantName: 'Thai Finance Group',  action: 'Approved',       detail: 'อนุมัติวงเงิน ฿100,000 · รอบบิล 30 วัน · Net 30', actionBy: 'finance@realfact.ai', actionDate: '2026-01-10', actionTime: '09:30' },
    { id: 'CLOG-002', creditLineId: 'CL-002', tenantId: 'T-001', tenantName: 'ABC Corporation',     action: 'Approved',       detail: 'อนุมัติวงเงิน ฿50,000 · รอบบิล 30 วัน · Net 30',  actionBy: 'finance@realfact.ai', actionDate: '2025-12-01', actionTime: '14:20' },
    { id: 'CLOG-003', creditLineId: 'CL-003', tenantId: 'T-008', tenantName: 'Sunrise Education',   action: 'Approved',       detail: 'อนุมัติวงเงิน ฿20,000 · รอบบิล 30 วัน · Net 30',  actionBy: 'finance@realfact.ai', actionDate: '2025-10-20', actionTime: '11:00' },
    { id: 'CLOG-004', creditLineId: 'CL-003', tenantId: 'T-008', tenantName: 'Sunrise Education',   action: 'Suspended',      detail: 'ระงับวงเงินเครดิต — ค้างชำระเกินกำหนด',            actionBy: 'finance@realfact.ai', actionDate: '2026-01-21', actionTime: '16:45' },
    { id: 'CLOG-005', creditLineId: 'CL-DP-001', tenantId: 'T-DP-001', tenantName: 'FinTech Co., Ltd.',   action: 'Approved', detail: 'อนุมัติวงเงิน ฿100,000 · รอบบิล 30 วัน · Net 30', actionBy: 'finance@realfact.ai', actionDate: '2025-11-15', actionTime: '10:00' },
    { id: 'CLOG-006', creditLineId: 'CL-DP-002', tenantId: 'T-DP-002', tenantName: 'DataDriven Ltd.', action: 'Approved', detail: 'อนุมัติวงเงิน ฿50,000 · รอบบิล 30 วัน · Net 30',  actionBy: 'finance@realfact.ai', actionDate: '2025-12-01', actionTime: '13:15' },
    { id: 'CLOG-007', creditLineId: 'CL-DP-003', tenantId: 'T-DP-003', tenantName: 'EduSmart Platform',   action: 'Approved', detail: 'อนุมัติวงเงิน ฿30,000 · รอบบิล 30 วัน · Net 30',  actionBy: 'finance@realfact.ai', actionDate: '2026-01-05', actionTime: '09:45' },
    { id: 'CLOG-008', creditLineId: 'CL-DP-004', tenantId: 'T-DP-004', tenantName: 'RetailPOS Corp.',     action: 'Approved', detail: 'อนุมัติวงเงิน ฿200,000 · รอบบิล 30 วัน · Net 30', actionBy: 'finance@realfact.ai', actionDate: '2026-02-01', actionTime: '11:30' },
    { id: 'CLOG-009', creditLineId: 'CL-001', tenantId: 'T-003', tenantName: 'Thai Finance Group',  action: 'Edited',         detail: 'แก้ไขวงเงิน ฿80,000 → ฿100,000',                  actionBy: 'finance@realfact.ai', actionDate: '2026-03-01', actionTime: '15:10' },
  ],

  // ─── Cost Change Requests (M-BE-05 FR30-32) ───
  costChangeRequests: [
    { id: 'CCR-001', serviceCode: 'anthropic-claude-opus-4-5',  serviceName: 'Claude Opus 4.5',       currentCost: 0.0015,    newCost: 0.00125,   reason: 'Anthropic ประกาศลดราคา Claude Opus 4.5 รอบ Q2/2026', effectiveDate: '2026-04-01', status: 'Pending',  requestedBy: 'Platform Admin', requestDate: '2026-03-01', requestTime: '14:32', approvedBy: null,         modifiedDate: '2026-03-01', modifiedBy: 'admin@realfact.ai' },
    { id: 'CCR-002', serviceCode: 'google-cloud-tts',           serviceName: 'Google Cloud TTS',      currentCost: 0.0140,    newCost: 0.0120,    reason: 'Google ปรับลดราคา Cloud TTS Standard ทั่วโลก',      effectiveDate: '2026-04-01', status: 'Approved', requestedBy: 'Platform Admin', requestDate: '2026-02-20', requestTime: '09:15', approvedBy: 'Owner', modifiedDate: '2026-02-25', modifiedBy: 'super@realfact.ai' },
    { id: 'CCR-003', serviceCode: 'openai-gpt-4o-mini',         serviceName: 'GPT-4o Mini',           currentCost: 0.0000054, newCost: 0.0000045, reason: 'OpenAI ลดราคา gpt-4o-mini หลัง launch o3-mini',      effectiveDate: '2026-05-01', status: 'Pending',  requestedBy: 'Platform Admin', requestDate: '2026-03-02', requestTime: '11:48', approvedBy: null,         modifiedDate: '2026-03-02', modifiedBy: 'admin@realfact.ai' },
  ],

  // ─── Margin Change Requests (M-BE-06 FR37-38) ───
  marginChangeRequests: [
    { id: 'MCR-001', level: 'Service Code', target: 'anthropic-claude-opus-4-5', currentMargin: 35, newMargin: 40, reason: 'ปรับ margin Claude Opus 4.5 เพิ่มตามต้นทุนจริง', status: 'Pending', requestedBy: 'Platform Admin', requestDate: '2026-03-02', requestTime: '10:45', approvedBy: null, modifiedDate: '2026-03-02', modifiedBy: 'admin@realfact.ai' },
  ],

  // ─── Snapshots (M-BE-06 FR39-42) ───
  snapshots: [
    { id: 'SNAP-DEFAULT', name: 'Default Snapshot (Mar 2026)',  type: 'Default', createdDate: '2026-03-01', assignedCustomers: 40, isActive: true, data: { globalMargin: 30 }, modifiedDate: '2026-03-01', modifiedBy: 'super@realfact.ai' },
    { id: 'SNAP-001',     name: 'Thai Finance Group — Custom',  type: 'Custom',  createdDate: '2026-01-15', assignedCustomers: 1,  isActive: true, tenantId: 'T-003', data: { globalMargin: 25 }, modifiedDate: '2026-01-15', modifiedBy: 'super@realfact.ai' },
    { id: 'SNAP-002',     name: 'Hotel Group Bundle',           type: 'Custom',  createdDate: '2026-02-10', assignedCustomers: 2,  isActive: true, tenantId: null,    data: { globalMargin: 20 }, modifiedDate: '2026-02-10', modifiedBy: 'super@realfact.ai' },
  ],

  // ─── Price Locks (M-BE-06 FR43) ───
  priceLocks: [
    { id: 'PL-LOCK-001', tenantId: 'T-003', tenantName: 'Thai Finance Group', snapshotId: 'SNAP-001', startDate: '2026-01-15', endDate: '2026-07-15', daysRemaining: 134, status: 'Active', notified30d: false, modifiedDate: '2026-01-15', modifiedBy: 'super@realfact.ai' },
  ],

  // ─── Avatar Defaults (A-FR37-40) ───
  avatarDefaults: {
    welcomeBonusTokens: 200,
    welcomeBonusLastUpdated: '2026-02-15',
    welcomeBonusUpdatedBy: 'Owner',
    welcomeBonusHistory: [
      { date: '2026-02-15', oldValue: 100, newValue: 200, changedBy: 'Owner' },
      { date: '2025-11-01', oldValue: 0, newValue: 100, changedBy: 'Platform Admin' },
    ],
    systemDefaultPresetId: 'P-003',
    systemDefaultPresetName: 'น้องมิว — ผู้ช่วยทั่วไป',
    systemDefaultSetDate: '2025-11-01',
    systemDefaultSetBy: 'Owner',
  },

  // ─── Collection Notices (M-BE-07 FR78) ───
  collectionNotices: [
    { id: 'CN-001', tenantId: 'T-008', tenantName: 'Sunrise Education', invoiceId: 'INV-202602-00008', amount: 1059.30, sentDate: '2026-02-20', channel: 'Email + Telegram', cooldownUntil: '2026-02-27', status: 'Sent', modifiedDate: '2026-02-20', modifiedBy: 'finance@realfact.ai' },
  ],

  // ─── Refund Requests (M-BE-07 FR80) ───
  refundRequests: [
    { id: 'REF-001', tenantId: 'T-002', tenantName: 'XYZ Trading', invoiceId: 'INV-202602-00005', amount: 500, reason: 'Service downtime compensation', status: 'Pending Dual Approval', requestDate: '2026-03-01', superAdminApproved: false, financeApproved: true, modifiedDate: '2026-03-01', modifiedBy: 'finance@realfact.ai' },
  ],

  // ─── Developer Apps (M-BE-07 FR81-85) ───
  developerApps: [
    { id: 'APP-001', name: 'FinBot',      tenantId: 'T-003', tenantName: 'Thai Finance Group',  clientId: 'rf_client_abc123', status: 'Production',     rateLimit: '10,000 calls/day', createdDate: '2026-01-20', modifiedDate: '2026-02-10', modifiedBy: 'admin@realfact.ai' },
    { id: 'APP-002', name: 'HotelAssist', tenantId: 'T-005', tenantName: 'Northern Star Hotel', clientId: 'rf_client_xyz789', status: 'Sandbox',         rateLimit: '100 calls/day',    createdDate: '2026-02-25', modifiedDate: '2026-02-25', modifiedBy: 'admin@realfact.ai' },
    { id: 'APP-003', name: 'EduBot',      tenantId: 'T-004', tenantName: 'Bangkok Tech Co.',    clientId: 'rf_client_edu456', status: 'Pending Approval',rateLimit: '100 calls/day',    createdDate: '2026-03-01', modifiedDate: '2026-03-01', modifiedBy: 'admin@realfact.ai' },
  ],

  // ─── Aging Report ───
  agingReport: [
    { tenantId: 'T-008', tenantName: 'Sunrise Education', totalOverdue: 1059.30, daysOverdue: 16, invoiceCount: 1, lastNotice: '2026-02-20', creditStatus: 'Suspended', modifiedDate: '2026-02-20', modifiedBy: 'finance@realfact.ai' },
  ],

  // ─── Tenant Meta (contact person + billing info) ───
  tenantMeta: {
    'T-001': { contactPerson: 'นายสมชาย วงศ์ดี',           taxId: '0105558012345', branch: '00000', billingAddress: '123 ถ.สุขุมวิท แขวงคลองตัน เขตวัฒนา กรุงเทพฯ 10110',               companyType: 'corporation' },
    'T-002': { contactPerson: 'นางสาวสมหญิง รักดี',        taxId: '0105561023456', branch: '00000', billingAddress: '456 ถ.พระราม 4 แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',            companyType: 'corporation' },
    'T-003': { contactPerson: 'นายวิชัย การเงิน',           taxId: '0105542034567', branch: '00001', billingAddress: '789 ถ.สาทรใต้ แขวงยานนาวา เขตสาทร กรุงเทพฯ 10120',                companyType: 'corporation' },
    'T-004': { contactPerson: 'นายอนันต์ เทคโน',           taxId: '0105563045678', branch: '00000', billingAddress: '321 ถ.รัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400',             companyType: 'corporation' },
    'T-005': { contactPerson: 'นางสาวนภา โรงแรม',          taxId: '0505559056789', branch: '00000', billingAddress: '99 ถ.ช้างคลาน ต.ช้างคลาน อ.เมือง จ.เชียงใหม่ 50100',               companyType: 'corporation' },
    'T-006': { contactPerson: 'นายภูเก็ต รีสอร์ท',          taxId: '0835560067890', branch: '00000', billingAddress: '55/1 ถ.วิชิตสงคราม ต.วิชิต อ.เมือง จ.ภูเก็ต 83000',                companyType: 'corporation' },
    'T-007': { contactPerson: 'นายแพทย์มนัส โรงพยาบาล',    taxId: '0993000012345', branch: '00000', billingAddress: '88 ซ.เพชรบุรี 47 แขวงบางกะปิ เขตห้วยขวาง กรุงเทพฯ 10310',         companyType: 'corporation' },
    'T-008': { contactPerson: 'นางสาวรุ่งอรุณ การศึกษา',    taxId: '1101400567890', branch: '00000', billingAddress: '200 ถ.พหลโยธิน แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900',            companyType: 'individual' },
  },

  // ─── Tenant Subscriptions (Multi-tenancy: TenantID → Sub-Platforms) ───
  tenantSubscriptions: {
    'T-001': [
      { subPlatformCode: 'avatar',  label: 'avatar',  subPlatformName: 'Live Interact Avatar', plan: 'Pro',     price: 4990, status: 'Active',  renewDate: '2026-04-01' },
      { subPlatformCode: 'booking', label: 'booking', subPlatformName: 'AI Booking',           plan: 'Starter', price: 990,  status: 'Active',  renewDate: '2026-04-01' },
    ],
    'T-002': [
      { subPlatformCode: 'avatar',  label: 'avatar',  subPlatformName: 'Live Interact Avatar', plan: 'Starter', price: 990,  status: 'Active',  renewDate: '2026-03-15' },
    ],
    'T-003': [
      { subPlatformCode: 'avatar',  label: 'avatar',  subPlatformName: 'Live Interact Avatar', plan: 'Pro',     price: 4990, status: 'Active',  renewDate: '2026-04-05' },
    ],
    'T-004': [
      { subPlatformCode: 'avatar',  label: 'avatar',  subPlatformName: 'Live Interact Avatar', plan: 'Starter', price: 990,  status: 'Pending', renewDate: null },
    ],
    'T-005': [
      { subPlatformCode: 'avatar',  label: 'avatar',  subPlatformName: 'Live Interact Avatar', plan: 'Pro',     price: 4990, status: 'Active',  renewDate: '2026-03-20' },
    ],
    'T-006': [
      { subPlatformCode: 'avatar',  label: 'avatar',  subPlatformName: 'Live Interact Avatar', plan: 'Starter', price: 990,  status: 'Pending', renewDate: null },
      { subPlatformCode: 'booking', label: 'booking', subPlatformName: 'AI Booking',           plan: 'Starter', price: 990,  status: 'Pending', renewDate: null },
    ],
    'T-007': [
      { subPlatformCode: 'avatar',  label: 'avatar',  subPlatformName: 'Live Interact Avatar', plan: 'Free',    price: 0,    status: 'Active',  renewDate: null },
    ],
    'T-008': [
      { subPlatformCode: 'avatar',  label: 'avatar',  subPlatformName: 'Live Interact Avatar', plan: 'Starter', price: 990,  status: 'Suspended', renewDate: null },
    ],
  },

  // ─── Token Activities (per tenant, recent transactions) ───
  tokenActivities: {
    'T-001': [
      { date: '2026-03-01', type: 'subscription alloc', typeClass: 'chip-blue',   description: 'Avatar Pro - Monthly Allocation',    amount:  5000, balance: 15420 },
      { date: '2026-02-28', type: 'usage',              typeClass: 'chip-orange', description: 'Avatar Session (1,200 min)',         amount: -1200, balance: 10420 },
      { date: '2026-02-14', type: 'purchase',           typeClass: 'chip-green',  description: 'Token Top-up (5,000 tokens)',        amount:  5000, balance: 11620 },
    ],
    'T-002': [
      { date: '2026-03-01', type: 'subscription alloc', typeClass: 'chip-blue',   description: 'Avatar Starter - Monthly Allocation', amount:  1000, balance: 3250 },
      { date: '2026-02-28', type: 'usage',              typeClass: 'chip-orange', description: 'Avatar Session (300 min)',            amount:  -300, balance: 2250 },
    ],
    'T-003': [
      { date: '2026-03-01', type: 'subscription alloc', typeClass: 'chip-blue',   description: 'Avatar Pro - Monthly Allocation',    amount:  5000, balance: 42800 },
      { date: '2026-02-27', type: 'usage',              typeClass: 'chip-orange', description: 'Avatar Session (2,400 min)',         amount: -2400, balance: 37800 },
      { date: '2026-02-01', type: 'subscription alloc', typeClass: 'chip-blue',   description: 'Avatar Pro - Monthly Allocation',    amount:  5000, balance: 40200 },
    ],
    'T-004': [
      { date: '2026-02-01', type: 'welcome bonus',      typeClass: 'chip-yellow', description: 'Welcome Bonus Tokens (Avatar)',      amount:  1000, balance: 1000 },
    ],
    'T-005': [
      { date: '2026-03-01', type: 'subscription alloc', typeClass: 'chip-blue',   description: 'Avatar Pro - Monthly Allocation',    amount:  5000, balance: 8900 },
      { date: '2026-02-28', type: 'usage',              typeClass: 'chip-orange', description: 'Avatar Session (800 min)',           amount:  -800, balance: 3900 },
    ],
  },

  // ─── Token Packages (purchasable top-up bundles) ───
  tokenPackages: [
    { id: 'TP-001', name: '1,000 Tokens',  tokens: 1000,  price: 500,   pricePerToken: 0.50, bonus: 0,    subPlatform: 'avatar', popular: false, status: 'Active', modifiedDate: '2026-01-01', modifiedBy: 'super@realfact.ai' },
    { id: 'TP-002', name: '5,000 Tokens',  tokens: 5000,  price: 2000,  pricePerToken: 0.40, bonus: 250,  subPlatform: 'avatar', popular: true,  status: 'Active', modifiedDate: '2026-01-01', modifiedBy: 'super@realfact.ai' },
    { id: 'TP-003', name: '10,000 Tokens', tokens: 10000, price: 3500,  pricePerToken: 0.35, bonus: 500,  subPlatform: 'avatar', popular: false, status: 'Active', modifiedDate: '2026-02-01', modifiedBy: 'super@realfact.ai' },
    { id: 'TP-004', name: '50,000 Tokens', tokens: 50000, price: 15000, pricePerToken: 0.30, bonus: 2500, subPlatform: 'avatar', popular: false, status: 'Active', modifiedDate: '2026-02-01', modifiedBy: 'super@realfact.ai' },
  ],

  // ─── Bank Accounts (Payment Global Settings) ───
  bankAccounts: [
    { id: 'BA-001', bankCode: 'scb',   bankName: 'ธนาคารไทยพาณิชย์ (SCB)',  accountNumber: '111-2-33456-7', accountName: 'บริษัท เรียลแฟค จำกัด', branch: 'สาขาสีลม',  assignedSubPlatforms: ['avatar', 'booking'], isDefault: true,  status: 'Active',   modifiedDate: '2026-01-01', modifiedBy: 'finance@realfact.ai' },
    { id: 'BA-002', bankCode: 'kbank', bankName: 'ธนาคารกสิกรไทย (KBank)',   accountNumber: '088-1-23456-7', accountName: 'บริษัท เรียลแฟค จำกัด', branch: 'สาขาอโศก',  assignedSubPlatforms: ['avatar'],            isDefault: false, status: 'Active',   modifiedDate: '2026-01-15', modifiedBy: 'finance@realfact.ai' },
    { id: 'BA-003', bankCode: 'bbl',   bankName: 'ธนาคารกรุงเทพ (BBL)',      accountNumber: '155-0-12345-6', accountName: 'บริษัท เรียลแฟค จำกัด', branch: 'สาขาสาทร', assignedSubPlatforms: [],                    isDefault: false, status: 'Inactive', modifiedDate: '2025-12-01', modifiedBy: 'finance@realfact.ai' },
  ],

  // ─── PromptPay / QR Config ───
  promptPayConfig: [
    { id: 'PP-001', type: 'taxId', value: '0105560012345', label: 'Tax ID (นิติบุคคล)', qrNote: 'RealFact Co., Ltd.', assignedSubPlatforms: ['avatar', 'booking'], status: 'Active', modifiedDate: '2026-01-01', modifiedBy: 'finance@realfact.ai' },
  ],

  // ─── Payment Channels (per Sub-Platform) ───
  paymentChannels: {
    'avatar':  { card2c2p: true,  bankTransfer: true,  promptPay: true  },
    'booking': { card2c2p: false, bankTransfer: true,  promptPay: true  },
  },

  // ─── Analytics: Revenue Trend monthly (Sep 25 – Feb 26) ───
  revenueTrend: [
    { month: 'Sep 25', subscriptions: 10500, tokenTopups:     0 },
    { month: 'Oct 25', subscriptions: 14200, tokenTopups:  2100 },
    { month: 'Nov 25', subscriptions: 18900, tokenTopups:  5400 },
    { month: 'Dec 25', subscriptions: 24800, tokenTopups:  9700 },
    { month: 'Jan 26', subscriptions: 31500, tokenTopups: 14900 },
    { month: 'Feb 26', subscriptions: 38500, tokenTopups: 19200 },
  ],

  // ─── Analytics: Revenue by Sub-Platform monthly ───
  revenueBySubPlatform: [
    { month: 'Sep 25', avatar:  6500, booking:  4000, devportal:     0 },
    { month: 'Oct 25', avatar:  9200, booking:  5000, devportal:     0 },
    { month: 'Nov 25', avatar: 15600, booking:  3300, devportal:  3100 },
    { month: 'Dec 25', avatar: 19800, booking:  4700, devportal:  8400 },
    { month: 'Jan 26', avatar: 29200, booking:  2300, devportal: 31200 },
    { month: 'Feb 26', avatar: 44300, booking: 13400, devportal: 53700 },
  ],

  // ─── Analytics: Sub-Platform Revenue current period ───
  subPlatformRevenue: [
    { name: 'Live Interact',    code: 'avatar',    revenue: 20970 },
    { name: 'AI Booking',       code: 'booking',   revenue: 10580 },
    { name: 'Developer Portal', code: 'devportal', revenue: 86100 },
  ],

  // ─── Analytics: Daily Revenue Feb 2026 ───
  dailyRevenueFeb: [
    { date: '02-01', revenue: 31500 },
    { date: '02-03', revenue:  1200 },
    { date: '02-05', revenue:   980 },
    { date: '02-07', revenue:  1450 },
    { date: '02-09', revenue:   760 },
    { date: '02-11', revenue:  1180 },
    { date: '02-14', revenue: 18200 },
    { date: '02-15', revenue:   890 },
    { date: '02-17', revenue:  1320 },
    { date: '02-18', revenue:   990 },
  ],

  // ─── Analytics: Revenue by Plan Tier ───
  revenueByPlanTier: [
    { label: 'Live Interact — Enterprise', subs: 1, revenue: 14990, color: '#f15b26' },
    { label: 'AI Booking — Enterprise',    subs: 1, revenue:  9990, color: '#3b82f6' },
    { label: 'Live Interact — Pro',        subs: 1, revenue:  4990, color: '#f15b26' },
    { label: 'AI Booking — Pro',           subs: 2, revenue:  3960, color: '#3b82f6' },
    { label: 'Live Interact — Starter',    subs: 3, revenue:  2970, color: '#f15b26' },
  ],

  // ─── Analytics: Top Tenants by Spend ───
  topTenantsBySpend: [
    { rank: 1, name: 'FinTech Co., Ltd.',    subscriptions: 'Credit Line', revenue: 42800, source: 'devportal', revenueType: 'Credit Line' },
    { rank: 2, name: 'GHI Co',              subscriptions: 2, revenue: 24980 },
    { rank: 3, name: 'SmartBot Inc.',        subscriptions: 'Credit Line', revenue: 24800, source: 'devportal', revenueType: 'Credit Line' },
    { rank: 4, name: 'DataDriven Ltd.',      subscriptions: 'Credit Line', revenue: 18500, source: 'devportal', revenueType: 'Credit Line' },
    { rank: 5, name: 'ABC Corp',             subscriptions: 2, revenue:  5580 },
    { rank: 6, name: 'Thai Finance Group',   subscriptions: 1, revenue:  4990 },
    { rank: 7, name: 'Northern Star Hotel',  subscriptions: 1, revenue:  4990 },
    { rank: 8, name: 'XYZ Trading',          subscriptions: 1, revenue:  2970 },
  ],

  // ─── Analytics: Daily API Calls (last 7 days — F-A10.2) ───
  dailyApiCalls: [
    { date: '02-25', calls: 1842, inputTokens: 243000, outputTokens: 141000 },
    { date: '02-26', calls: 2105, inputTokens: 287600, outputTokens: 168400 },
    { date: '02-27', calls: 2384, inputTokens: 312400, outputTokens: 189200 },
    { date: '02-28', calls:  980, inputTokens: 128600, outputTokens:  74800 },
    { date: '03-01', calls: 2241, inputTokens: 298500, outputTokens: 175600 },
    { date: '03-02', calls: 2567, inputTokens: 341200, outputTokens: 204800 },
    { date: '03-03', calls: 1562, inputTokens: 198400, outputTokens: 117600 },
  ],

  // ─── Analytics: Top Customers by API Calls (F-A10.2) ───
  topCustomers: [
    { tenantName: 'FinTech Co., Ltd.',       apiCalls: 38500, source: 'devportal' },
    { tenantName: 'Thai Finance Group',      apiCalls: 12450 },
    { tenantName: 'ABC Corporation',         apiCalls:  9830 },
    { tenantName: 'SmartBot Inc.',           apiCalls:  8900, source: 'devportal' },
    { tenantName: 'Smart Retail Co.',        apiCalls:  8240 },
    { tenantName: 'Digital Agency Thailand', apiCalls:  6780 },
    { tenantName: 'FutureTech Solutions',    apiCalls:  5920 },
    { tenantName: 'Bangkok Hospitality',     apiCalls:  4830 },
    { tenantName: 'Thai E-Commerce Hub',     apiCalls:  3960 },
    { tenantName: 'DataDriven Ltd.',         apiCalls:  3400, source: 'devportal' },
    { tenantName: 'MediCare Thailand',       apiCalls:  3120 },
    { tenantName: 'EDU Platform Group',      apiCalls:  2480 },
    { tenantName: 'Logistics Pro Co.',       apiCalls:  1840 },
  ],

  // ─── Analytics: Service Categories (F-A10.3) ───
  serviceCategories: [
    { category: 'LLM',       count: 2 },
    { category: 'Platform',  count: 1 },
    { category: 'TTS',       count: 1 },
    { category: 'Embedding', count: 1 },
  ],

  // ─── Analytics: KPI Summary ───
  analyticsKPIs: {
    revenueYTD:           89293.50,
    apiCallsToday:        1562,
    apiCallsThisWeek:     4129,
    apiCallsThisMonth:    6370,
    totalTokensThisMonth: 1336100,
  },

  // ─── Developer Portal — API Presets ───
  apiPresets: [
    {
      id: 'AP-001', name: 'Customer Service Bundle', version: '2.1',
      description: 'ระบบ AI ให้บริการลูกค้าอัตโนมัติ รองรับ Chat, Escalation และ Summary',
      agents: [
        { name: 'Chat Agent', model: 'GPT-4o', role: 'Main conversation handler' },
        { name: 'Escalation Agent', model: 'Claude Sonnet', role: 'Handle complex issues' },
        { name: 'Summary Agent', model: 'GPT-4o-mini', role: 'Summarize conversations' },
      ],
      assignedTenants: ['T-DP-001', 'T-DP-002'],
      status: 'Active', lastUpdated: '2026-03-01', isDefault: false,
    },
    {
      id: 'AP-002', name: 'Sales Assistant', version: '1.0',
      description: 'AI ช่วยงานขาย ตอบคำถามสินค้า และคัดกรอง Lead อัตโนมัติ',
      agents: [
        { name: 'Sales Bot', model: 'GPT-4o', role: 'Product Q&A and recommendations' },
        { name: 'Lead Qualifier', model: 'GPT-4o-mini', role: 'Score and qualify leads' },
      ],
      assignedTenants: ['T-DP-001'],
      status: 'Active', lastUpdated: '2026-02-28', isDefault: false,
    },
    {
      id: 'AP-003', name: 'RAG Engine', version: '3.2',
      description: 'ค้นหาเอกสารด้วย AI แบบ Retrieval-Augmented Generation',
      agents: [
        { name: 'Document Search', model: 'Claude Sonnet', role: 'Search and retrieve documents' },
      ],
      assignedTenants: ['T-DP-002', 'T-DP-003'],
      status: 'Active', lastUpdated: '2026-02-25', isDefault: true,
    },
    {
      id: 'AP-004', name: 'Content Generator', version: '1.2',
      description: 'สร้างเนื้อหาอัตโนมัติ — บทความ, โพสต์, สรุปรายงาน',
      agents: [
        { name: 'Writer Agent', model: 'Claude Sonnet', role: 'Generate long-form content' },
        { name: 'Editor Agent', model: 'GPT-4o-mini', role: 'Proofread and refine text' },
        { name: 'SEO Agent', model: 'GPT-4o-mini', role: 'Optimize for search engines' },
      ],
      assignedTenants: [],
      status: 'Draft', lastUpdated: '2026-02-20', isDefault: false,
    },
    {
      id: 'AP-005', name: 'Data Analyst', version: '2.0',
      description: 'วิเคราะห์ข้อมูล สร้าง Insight และ Dashboard อัตโนมัติ',
      agents: [
        { name: 'Query Agent', model: 'GPT-4o', role: 'Generate and run SQL queries' },
        { name: 'Insight Agent', model: 'Claude Sonnet', role: 'Analyze results and generate insights' },
      ],
      assignedTenants: ['T-DP-001', 'T-DP-003'],
      status: 'Active', lastUpdated: '2026-03-02', isDefault: false,
    },
  ],

  // ─── Developer Portal — Tenants ───
  dpTenants: [
    {
      id: 'T-DP-001', name: 'FinTech Co., Ltd.', status: 'Active',
      email: 'dev@fintechco.com', phone: '02-111-2233',
      subscribedDate: '2025-11-15',
      modifiedDate: '2026-02-20', modifiedBy: 'admin@realfact.ai',
      assignedPresets: ['AP-001', 'AP-002', 'AP-005'],
      apiCallsToday: 1250, apiCallsMonth: 38500,
      creditLine: {
        creditLimit: 100000, usedAmount: 42800, availableCredit: 57200,
        billingCycle: 30, paymentTerms: 'Net 30', status: 'Active',
        approvedDate: '2025-11-20', approvedBy: 'Finance Admin',
      },
      invoices: [
        { id: 'INV-DEV-202602-001', amount: 38500, status: 'Paid', date: '2026-02-28' },
        { id: 'INV-DEV-202601-001', amount: 31200, status: 'Paid', date: '2026-01-31' },
      ],
    },
    {
      id: 'T-DP-002', name: 'DataDriven Ltd.', status: 'Active',
      email: 'admin@datadriven.io', phone: '02-333-4455',
      subscribedDate: '2026-01-10',
      modifiedDate: '2026-02-25', modifiedBy: 'finance@realfact.ai',
      assignedPresets: ['AP-001', 'AP-003'],
      apiCallsToday: 420, apiCallsMonth: 12800,
      creditLine: {
        creditLimit: 50000, usedAmount: 18500, availableCredit: 31500,
        billingCycle: 30, paymentTerms: 'Net 30', status: 'Active',
        approvedDate: '2026-01-15', approvedBy: 'Finance Admin',
      },
      invoices: [
        { id: 'INV-DEV-202602-002', amount: 15200, status: 'Paid', date: '2026-02-28' },
      ],
    },
    {
      id: 'T-DP-003', name: 'SmartBot Inc.', status: 'Active',
      email: 'tech@smartbot.co.th', phone: '02-555-6677',
      subscribedDate: '2026-02-01',
      modifiedDate: '2026-03-01', modifiedBy: 'admin@realfact.ai',
      assignedPresets: ['AP-003', 'AP-005'],
      apiCallsToday: 680, apiCallsMonth: 8900,
      creditLine: {
        creditLimit: 30000, usedAmount: 24800, availableCredit: 5200,
        billingCycle: 30, paymentTerms: 'Net 15', status: 'Active',
        approvedDate: '2026-02-05', approvedBy: 'Finance Admin',
      },
      invoices: [],
    },
    {
      id: 'T-DP-004', name: 'CloudNine Tech', status: 'Active',
      email: 'api@cloudnine.dev', phone: '02-777-8899',
      subscribedDate: '2025-12-01',
      modifiedDate: null, modifiedBy: null,
      assignedPresets: [],
      apiCallsToday: 0, apiCallsMonth: 0,
      creditLine: {
        creditLimit: 80000, usedAmount: 0, availableCredit: 80000,
        billingCycle: 60, paymentTerms: 'Net 60', status: 'Active',
        approvedDate: '2025-12-10', approvedBy: 'Finance Admin',
      },
      invoices: [],
    },
  ],

  // ─── Developer Portal — KPIs ───
  dpStats: {
    activeTenants: 4,
    totalApiPresets: 5,
    activeApiPresets: 4,
    totalAgents: 11,
    apiCallsToday: 2350,
    apiCallsMonth: 60200,
    totalCreditLimit: 260000,
    totalCreditUsed: 86100,
    totalCreditAvailable: 173900,
    tenantsNearLimit: 1,
  },

  // ─── Billing Terms Config (Credit Line only) ───
  billingTermsConfig: {
    platformDefault: {
      billingCycle: 30,
      paymentTerms: 'Net 30',
      autoGenerateInvoice: true,
      hardBlockAtZero: true,
      modifiedDate: '2026-01-01',
      modifiedBy: 'super@realfact.ai',
    },
    contexts: {
      devportal: {
        label: 'Developer Portal',
        icon: 'fa-code',
        billingCycle: 30,
        paymentTerms: 'Net 30',
        useDefault: true,
        modifiedDate: '2026-01-01',
        modifiedBy: 'super@realfact.ai',
      },
    },
  },

  // ─── Helpers ───
  resolveBillingTerms(context) {
    var cfg = this.billingTermsConfig;
    var ctx = cfg.contexts[context];
    if (ctx && !ctx.useDefault) {
      return { billingCycle: ctx.billingCycle, paymentTerms: ctx.paymentTerms };
    }
    return { billingCycle: cfg.platformDefault.billingCycle, paymentTerms: cfg.platformDefault.paymentTerms };
  },
  billingCyclesPaid(tenantId) {
    return this.invoices.filter(function(i) { return i.tenantId === tenantId && i.status === 'Paid'; }).length;
  },
  // ─── Lookup: resolve a field from any entity array by id ───
  // Usage: MockData.lookup('tenants', 'T-001', 'name') → 'ABC Corporation'
  lookup(entity, id, field) {
    var arr = this[entity];
    if (!arr) return null;
    var item = arr.find(function(x) { return x.id === id; });
    return item ? (field ? item[field] : item) : null;
  },
  formatNumber(n) {
    if (n == null) return '-';
    return n.toLocaleString('th-TH');
  },
  formatCurrency(n) {
    if (n == null) return '-';
    return n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' THB';
  },
  statusChip(status) {
    const map = {
      'Active': 'chip-green', 'Activated': 'chip-green', 'Ready': 'chip-green',
      'Paid': 'chip-green', 'Completed': 'chip-green', 'Online': 'chip-green',
      'Approved': 'chip-green', 'Production': 'chip-green',
      'Sold': 'chip-yellow', 'Pending': 'chip-yellow', 'Pending Verification': 'chip-yellow',
      'Processing': 'chip-yellow', 'Issued': 'chip-yellow', 'Configured': 'chip-yellow',
      'Pending Approval': 'chip-yellow', 'Pending Dual Approval': 'chip-yellow',
      'Sent': 'chip-blue', 'Sandbox': 'chip-blue',
      'Draft': 'chip-gray', 'Registered': 'chip-blue', 'Free': 'chip-gray',
      'Starter': 'chip-blue', 'Pro': 'chip-orange',
      'Edited': 'chip-orange',
      'Deprecated': 'chip-red', 'Rejected': 'chip-red',
      'Decommissioned': 'chip-red', 'Suspended': 'chip-red', 'Overdue': 'chip-red',
      'Offline': 'chip-red', 'Discontinued': 'chip-red', 'Retired': 'chip-red',
      'Invited': 'chip-blue',
    };
    const cls = map[status] || 'chip-gray';
    return `<span class="chip ${cls}">${status}</span>`;
  },

  // ═══════════════════════════════════════════════════════════════
  //  RBAC: Hierarchical Multi-Tenant + Custom Roles
  // ═══════════════════════════════════════════════════════════════

  // ─── Base Role Permissions (max capability per level) ───
  rolePermissions: {
    super_admin: {
      canEdit: true, canDelete: true, canApprove: true,
      canManageMembers: true, canManageTenants: true, canManageSubPlatforms: true,
      canViewBilling: true, canViewAnalytics: true,
      pages: '*',
    },
    tenant_admin: {
      canEdit: true, canDelete: false, canApprove: true,
      canManageMembers: true, canManageTenants: false, canManageSubPlatforms: true,
      canViewBilling: true, canViewAnalytics: true,
      pages: [
        'dashboard', 'tenants', 'sub-platforms',
        'plans-packages', 'plans-tokens', 'plans-bonus',
        'billing', 'billing-verify', 'billing-credit', 'billing-overdue',
        'cost-pricing', 'cost-margin', 'cost-snapshots', 'cost-change-requests',
        'payment-settings', 'platform-members',
        'analytics-revenue', 'analytics-usage', 'analytics-customers',
        'avatar-dashboard', 'avatar-tenants', 'hardware', 'devices',
        'service-builder', 'knowledge-base',
        'dp-dashboard', 'dp-tenants', 'dp-api-presets', 'dp-assign-endpoint',
      ],
    },
    subplatform_admin: {
      canEdit: true, canDelete: false, canApprove: false,
      canManageMembers: true, canManageTenants: false, canManageSubPlatforms: false,
      canViewBilling: false, canViewAnalytics: true,
      pages: [
        'avatar-dashboard', 'hardware', 'devices',
        'service-builder', 'knowledge-base',
        'analytics-usage', 'platform-members',
      ],
    },
    subplatform_member: {
      canEdit: false, canDelete: false, canApprove: false,
      canManageMembers: false, canManageTenants: false, canManageSubPlatforms: false,
      canViewBilling: false, canViewAnalytics: false,
      pages: ['avatar-dashboard', 'knowledge-base'],
    },
  },

  // ─── Users (identity only, no role) ───
  users: [
    { id: 'USR-001', email: 'admin@realfact.ai',      password: 'admin123',    name: 'สมชาย ใจดี',     initials: 'SA', avatar: null, status: 'Active',    lastLogin: '2026-03-05 09:12', createdDate: '2025-12-01' },
    { id: 'USR-002', email: 'somphon@realfact.ai',     password: 'tenant123',   name: 'สมพร วงศ์ดี',    initials: 'SP', avatar: null, status: 'Active',    lastLogin: '2026-03-04 14:30', createdDate: '2025-12-15' },
    { id: 'USR-003', email: 'wichai@realfact.ai',      password: 'spadmin123',   name: 'วิชัย การเงิน',   initials: 'WC', avatar: null, status: 'Active',    lastLogin: '2026-03-05 08:45', createdDate: '2026-01-10' },
    { id: 'USR-004', email: 'napa@realfact.ai',        password: 'member123',   name: 'นภา โรงแรม',     initials: 'NP', avatar: null, status: 'Active',    lastLogin: '2026-03-03 16:20', createdDate: '2026-02-01' },
    { id: 'USR-005', email: 'anant@realfact.ai',       password: 'viewer123',   name: 'อนันต์ เทคโน',   initials: 'AN', avatar: null, status: 'Active',    lastLogin: '2026-03-02 11:00', createdDate: '2026-02-10' },
    { id: 'USR-006', email: 'new.member@realfact.ai',  password: null,          name: 'New Member',      initials: 'NM', avatar: null, status: 'Invited',   lastLogin: null,               createdDate: '2026-03-04' },
    { id: 'USR-007', email: 'suspended@realfact.ai',   password: 'suspended1',  name: 'Suspended User',  initials: 'SU', avatar: null, status: 'Suspended', lastLogin: '2026-02-15 10:00', createdDate: '2026-01-20' },
  ],

  // ─── User Memberships (Role × Scope — many-to-many) ───
  userMemberships: [
    // ── Owner — global, no scope ──
    { id: 'MB-001', userId: 'USR-001', role: 'super_admin',       tenantId: null,    subPlatformId: null,     customRoleId: null,     status: 'Active', invitedBy: null,      createdDate: '2025-12-01' },

    // ── Tenant Admin — USR-002 manages T-001 and T-002 ──
    { id: 'MB-002', userId: 'USR-002', role: 'tenant_admin',      tenantId: 'T-001', subPlatformId: null,     customRoleId: 'CR-001', status: 'Active', invitedBy: 'USR-001', createdDate: '2025-12-15' },
    { id: 'MB-003', userId: 'USR-002', role: 'tenant_admin',      tenantId: 'T-002', subPlatformId: null,     customRoleId: 'CR-001', status: 'Active', invitedBy: 'USR-001', createdDate: '2026-01-10' },

    // ── Sub-Platform Admin — USR-003 manages Avatar (SP-001) under T-001 ──
    { id: 'MB-004', userId: 'USR-003', role: 'subplatform_admin', tenantId: 'T-001', subPlatformId: 'SP-001', customRoleId: 'CR-003', status: 'Active', invitedBy: 'USR-002', createdDate: '2026-01-20' },

    // ── Sub-Platform Members — USR-004 (editor), USR-005 (viewer) under SP-001 / T-001 ──
    { id: 'MB-005', userId: 'USR-004', role: 'subplatform_member', tenantId: 'T-001', subPlatformId: 'SP-001', customRoleId: 'CR-004', status: 'Active', invitedBy: 'USR-003', createdDate: '2026-02-01' },
    { id: 'MB-006', userId: 'USR-005', role: 'subplatform_member', tenantId: 'T-001', subPlatformId: 'SP-001', customRoleId: 'CR-005', status: 'Active', invitedBy: 'USR-003', createdDate: '2026-02-10' },

    // ── Invited user — pending SP member ──
    { id: 'MB-007', userId: 'USR-006', role: 'subplatform_member', tenantId: 'T-001', subPlatformId: 'SP-001', customRoleId: 'CR-005', status: 'Invited', invitedBy: 'USR-003', createdDate: '2026-03-04' },

    // ── Suspended — was tenant_admin of T-003 ──
    { id: 'MB-008', userId: 'USR-007', role: 'tenant_admin',      tenantId: 'T-003', subPlatformId: null,     customRoleId: 'CR-001', status: 'Suspended', invitedBy: 'USR-001', createdDate: '2026-01-20' },
  ],

  // ─── Custom Roles (created by higher-level admins for lower levels) ───
  customRoles: [
    // Owner → สร้างให้ Tenant Admin
    { id: 'CR-001', name: 'Full Control',   targetLevel: 'tenant_admin',       scopeType: 'global',      scopeId: null,     createdBy: 'USR-001', createdDate: '2025-12-01',
      permissions: { canEdit: true, canDelete: true, canApprove: true, canManageMembers: true, canViewBilling: true, canViewAnalytics: true,
        pages: ['dashboard', 'tenants', 'sub-platforms', 'plans-packages', 'plans-tokens', 'plans-bonus', 'billing', 'billing-verify', 'billing-credit', 'billing-overdue', 'cost-pricing', 'cost-margin', 'cost-snapshots', 'cost-change-requests', 'payment-settings', 'platform-members', 'analytics-revenue', 'analytics-usage', 'analytics-customers', 'avatar-dashboard', 'avatar-tenants', 'hardware', 'devices', 'service-builder', 'knowledge-base', 'dp-dashboard', 'dp-tenants', 'dp-api-presets', 'dp-assign-endpoint'] } },
    { id: 'CR-002', name: 'Billing Only',   targetLevel: 'tenant_admin',       scopeType: 'global',      scopeId: null,     createdBy: 'USR-001', createdDate: '2025-12-15',
      permissions: { canEdit: true, canDelete: false, canApprove: true, canManageMembers: false, canViewBilling: true, canViewAnalytics: true,
        pages: ['dashboard', 'billing', 'billing-verify', 'billing-credit', 'billing-overdue', 'cost-pricing', 'analytics-revenue'] } },

    // Tenant Admin → สร้างให้ Sub-Platform Admin (scoped to T-001)
    { id: 'CR-003', name: 'SP Manager',     targetLevel: 'subplatform_admin',  scopeType: 'tenant',      scopeId: 'T-001', createdBy: 'USR-002', createdDate: '2026-01-15',
      permissions: { canEdit: true, canDelete: false, canApprove: false, canManageMembers: true, canViewBilling: false, canViewAnalytics: true,
        pages: ['avatar-dashboard', 'hardware', 'devices', 'service-builder', 'knowledge-base', 'analytics-usage', 'platform-members'] } },

    // Sub-Platform Admin → สร้างให้ Sub-Platform Member (scoped to SP-001)
    { id: 'CR-004', name: 'Editor',         targetLevel: 'subplatform_member', scopeType: 'subplatform', scopeId: 'SP-001', createdBy: 'USR-003', createdDate: '2026-02-01',
      permissions: { canEdit: true, canDelete: false, canApprove: false, canManageMembers: false, canViewBilling: false, canViewAnalytics: false,
        pages: ['avatar-dashboard', 'hardware', 'devices', 'knowledge-base'] } },
    { id: 'CR-005', name: 'Viewer',         targetLevel: 'subplatform_member', scopeType: 'subplatform', scopeId: 'SP-001', createdBy: 'USR-003', createdDate: '2026-02-01',
      permissions: { canEdit: false, canDelete: false, canApprove: false, canManageMembers: false, canViewBilling: false, canViewAnalytics: false,
        pages: ['avatar-dashboard', 'knowledge-base'] } },
  ],

  // ─── [COMPAT] platformMembers — computed view for backward compatibility ───
  get platformMembers() {
    var self = this;
    return self.users.map(function (u) {
      var mb = self.userMemberships.find(function (m) { return m.userId === u.id; }) || {};
      return {
        id: u.id, email: u.email, password: u.password, name: u.name, initials: u.initials,
        role: mb.role || 'subplatform_member', status: u.status,
        lastLogin: u.lastLogin, createdDate: u.createdDate,
        invitedBy: mb.invitedBy ? ((self.users.find(function (x) { return x.id === mb.invitedBy; }) || {}).email || mb.invitedBy) : null,
        modifiedDate: u.createdDate, modifiedBy: 'system',
      };
    });
  },
};
