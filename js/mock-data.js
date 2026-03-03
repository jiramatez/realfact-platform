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
    { sn: 'RF-2024-00001', name: 'ตู้ล็อบบี้ ชั้น 1',       model: 'DM-001', modelName: 'Pro 55"',     registerCode: 'AV-X7K9M2', status: 'Activated',     soldTo: 'T-001', soldToName: 'ABC Corporation',     activatedBy: 'T-001', regDate: '2025-11-15', soldDate: '2025-12-01', activationDate: '2025-12-05', online: true,  modifiedDate: '2025-12-05', modifiedBy: 'admin@realfact.ai' },
    { sn: 'RF-2024-00002', name: 'ตู้ต้อนรับ สาขาสยาม',     model: 'DM-002', modelName: 'Mini 32"',    registerCode: 'AV-B3P5Q8', status: 'Activated',     soldTo: 'T-001', soldToName: 'ABC Corporation',     activatedBy: 'T-001', regDate: '2025-11-15', soldDate: '2025-12-01', activationDate: '2025-12-08', online: true,  modifiedDate: '2025-12-08', modifiedBy: 'admin@realfact.ai' },
    { sn: 'RF-2024-00003', name: 'Kiosk ชั้น 3 อาคาร A',    model: 'DM-001', modelName: 'Pro 55"',     registerCode: 'AV-D9H2L6', status: 'Activated',     soldTo: 'T-002', soldToName: 'XYZ Trading',         activatedBy: 'T-002', regDate: '2025-12-01', soldDate: '2025-12-15', activationDate: '2025-12-20', online: false, modifiedDate: '2025-12-20', modifiedBy: 'admin@realfact.ai' },
    { sn: 'RF-2024-00004', name: 'ตู้หน้าสำนักงาน',         model: 'DM-004', modelName: 'Ultra 65"',   registerCode: 'AV-F4N7R3', status: 'Activated',     soldTo: 'T-003', soldToName: 'Thai Finance Group', activatedBy: 'T-003', regDate: '2025-12-10', soldDate: '2026-01-05', activationDate: '2026-01-10', online: true,  modifiedDate: '2026-01-10', modifiedBy: 'admin@realfact.ai' },
    { sn: 'RF-2024-00005', name: 'Device #5',                model: 'DM-002', modelName: 'Mini 32"',    registerCode: 'AV-G8T2W5', status: 'Sold',          soldTo: 'T-004', soldToName: 'Bangkok Tech Co.',   activatedBy: null,    regDate: '2026-01-15', soldDate: '2026-02-01', activationDate: null,         online: false, modifiedDate: '2026-02-01', modifiedBy: 'admin@realfact.ai' },
    { sn: 'RF-2024-00006', name: 'Device #6',                model: 'DM-001', modelName: 'Pro 55"',     registerCode: 'AV-J6Y9K4', status: 'Registered',    soldTo: null,    soldToName: null,                activatedBy: null,    regDate: '2026-02-20', soldDate: null,         activationDate: null,         online: false, modifiedDate: '2026-02-20', modifiedBy: 'admin@realfact.ai' },
    { sn: 'RF-2024-00007', name: 'ตู้ทดสอบ QA',             model: 'DM-003', modelName: 'Compact 27"', registerCode: 'AV-M2C8V7', status: 'Decommissioned', soldTo: 'T-001', soldToName: 'ABC Corporation',   activatedBy: 'T-001', regDate: '2025-06-01', soldDate: '2025-07-01', activationDate: '2025-07-05', online: false, modifiedDate: '2026-01-15', modifiedBy: 'super@realfact.ai' },
    { sn: 'RF-2025-00008', name: 'ตู้สาขาเชียงใหม่',        model: 'DM-002', modelName: 'Mini 32"',    registerCode: 'AV-P5E3A9', status: 'Activated',     soldTo: 'T-005', soldToName: 'Northern Star Hotel', activatedBy: 'T-005', regDate: '2026-01-20', soldDate: '2026-02-10', activationDate: '2026-02-15', online: true,  modifiedDate: '2026-02-15', modifiedBy: 'admin@realfact.ai' },
    { sn: 'RF-2025-00009', name: 'ตู้ Reception Tower B',    model: 'DM-004', modelName: 'Ultra 65"',   registerCode: 'AV-S7U4Z1', status: 'Activated',     soldTo: 'T-003', soldToName: 'Thai Finance Group', activatedBy: 'T-003', regDate: '2026-02-01', soldDate: '2026-02-15', activationDate: '2026-02-20', online: true,  modifiedDate: '2026-02-20', modifiedBy: 'admin@realfact.ai' },
    { sn: 'RF-2025-00010', name: 'Device #10',               model: 'DM-001', modelName: 'Pro 55"',     registerCode: 'AV-W3H6B8', status: 'Sold',          soldTo: 'T-006', soldToName: 'Phuket Resort & Spa', activatedBy: null,   regDate: '2026-02-25', soldDate: '2026-03-01', activationDate: null,         online: false, modifiedDate: '2026-03-01', modifiedBy: 'admin@realfact.ai' },
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
    { id: 'S-001', deviceSn: 'RF-2024-00001', deviceName: 'ตู้ล็อบบี้ ชั้น 1', tenantId: 'T-001', tenantName: 'ABC Corporation', presetId: 'P-001', presetName: 'คุณพิมพ์ใจ', start: '2026-03-02 09:15', end: '2026-03-02 09:28', duration: 13, tokens: 13, status: 'completed' },
    { id: 'S-002', deviceSn: 'RF-2024-00002', deviceName: 'ตู้ต้อนรับ สาขาสยาม', tenantId: 'T-001', tenantName: 'ABC Corporation', presetId: 'P-002', presetName: 'คุณสมชาย', start: '2026-03-02 09:30', end: '2026-03-02 09:35', duration: 5, tokens: 5, status: 'completed' },
    { id: 'S-003', deviceSn: 'RF-2024-00004', deviceName: 'ตู้หน้าสำนักงาน', tenantId: 'T-003', tenantName: 'Thai Finance Group', presetId: 'P-001', presetName: 'คุณพิมพ์ใจ', start: '2026-03-02 10:00', end: null, duration: null, tokens: null, status: 'active' },
    { id: 'S-004', deviceSn: 'RF-2025-00008', deviceName: 'ตู้สาขาเชียงใหม่', tenantId: 'T-005', tenantName: 'Northern Star Hotel', presetId: 'P-005', presetName: 'คุณณัฐ', start: '2026-03-02 08:45', end: '2026-03-02 09:12', duration: 27, tokens: 27, status: 'completed' },
    { id: 'S-005', deviceSn: 'RF-2025-00009', deviceName: 'ตู้ Reception Tower B', tenantId: 'T-003', tenantName: 'Thai Finance Group', presetId: 'P-001', presetName: 'คุณพิมพ์ใจ', start: '2026-03-02 10:15', end: null, duration: null, tokens: null, status: 'active' },
    { id: 'S-006', deviceSn: 'RF-2024-00001', deviceName: 'ตู้ล็อบบี้ ชั้น 1', tenantId: 'T-001', tenantName: 'ABC Corporation', presetId: 'P-001', presetName: 'คุณพิมพ์ใจ', start: '2026-03-02 10:30', end: null, duration: null, tokens: null, status: 'active' },
    { id: 'S-007', deviceSn: 'RF-2024-00004', deviceName: 'ตู้หน้าสำนักงาน', tenantId: 'T-003', tenantName: 'Thai Finance Group', presetId: 'P-004', presetName: 'Dr.มาย', start: '2026-03-01 14:20', end: '2026-03-01 14:35', duration: 15, tokens: 15, status: 'completed' },
    { id: 'S-008', deviceSn: 'RF-2024-00002', deviceName: 'ตู้ต้อนรับ สาขาสยาม', tenantId: 'T-001', tenantName: 'ABC Corporation', presetId: 'P-003', presetName: 'น้องมิว', start: '2026-03-01 16:00', end: '2026-03-01 16:22', duration: 22, tokens: 22, status: 'completed' },
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
  ],

  // ─── Purchase Log ───
  purchaseLog: [
    { date: '2026-03-02', tenantName: 'ABC Corporation', subPlatform: 'Avatar', type: 'Subscription', description: 'Avatar Pro - Monthly', method: 'Card (2C2P)', amount: 5339.30, status: 'Completed', ref: 'RF-2603-0001' },
    { date: '2026-03-01', tenantName: 'Thai Finance Group', subPlatform: 'Avatar', type: 'Subscription', description: 'Avatar Pro - Monthly', method: 'Card (2C2P)', amount: 5339.30, status: 'Completed', ref: 'RF-2603-0002' },
    { date: '2026-03-01', tenantName: 'Northern Star Hotel', subPlatform: 'Avatar', type: 'Subscription', description: 'Avatar Pro - Monthly', method: 'Bank Transfer', amount: 5339.30, status: 'Pending', ref: 'RF-2603-0004' },
    { date: '2026-03-01', tenantName: 'XYZ Trading', subPlatform: 'Avatar', type: 'Subscription', description: 'Avatar Starter - Monthly', method: '-', amount: 1059.30, status: 'Pending', ref: 'RF-2603-0003' },
    { date: '2026-02-14', tenantName: 'ABC Corporation', subPlatform: 'Avatar', type: 'Token Top-up', description: 'Token Top-up (5,000 tokens)', method: 'Card (2C2P)', amount: 2675.00, status: 'Completed', ref: 'RF-2602-0012' },
    { date: '2026-02-01', tenantName: 'Sunrise Education', subPlatform: 'Avatar', type: 'Subscription', description: 'Avatar Starter - Monthly', method: '-', amount: 1059.30, status: 'Overdue', ref: 'RF-2602-0008' },
  ],

  // ─── Payment Verification Log (append-only) ───
  verificationLog: [
    { id: 'VL-001', invoiceId: 'INV-202602-00005', tenantId: 'T-002', tenantName: 'XYZ Trading',        amount: 1059.30, action: 'Approved', reason: null,                                         verifiedBy: 'finance@realfact.ai', verifiedDate: '2026-02-10', verifiedTime: '10:15' },
    { id: 'VL-002', invoiceId: 'INV-202602-00007', tenantId: 'T-005', tenantName: 'Northern Star Hotel', amount: 5339.30, action: 'Rejected', reason: 'สลิปไม่ชัดเจน ไม่สามารถอ่านข้อมูลได้', verifiedBy: 'finance@realfact.ai', verifiedDate: '2026-02-18', verifiedTime: '14:30' },
  ],

  // ─── Sub-Platforms ───
  subPlatforms: [
    { id: 'SP-001', name: 'Avatar (Live Interact)', code: 'avatar',  domain: 'avatar.realfact.ai',  status: 'Active',     tenants: 45, revenue: 234500, tokenUsage: 128750, plans: ['Free', 'Starter', 'Pro'],     exchangeRate: '1 Token = 1 Minute',  logo: null, primaryColor: '#f15b26', created: '2025-10-01', modifiedDate: '2026-02-01', modifiedBy: 'super@realfact.ai' },
    { id: 'SP-002', name: 'AI Booking',            code: 'booking', domain: 'booking.realfact.ai', status: 'Configured', tenants: 0,  revenue: 0,      tokenUsage: 0,      plans: ['Free', 'Basic', 'Premium'], exchangeRate: '1 Token = 1 Request', logo: null, primaryColor: '#3b82f6', created: '2026-02-15', modifiedDate: '2026-02-15', modifiedBy: 'super@realfact.ai' },
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
  ],

  // ─── Credit Line Requests ───
  creditLineRequests: [
    { id: 'CLR-001', tenantId: 'T-005', tenantName: 'Northern Star Hotel', requestedLimit: 80000, companyName: 'Northern Star Hotel Co., Ltd.', taxId: '0105565012345', documents: 2, status: 'Pending', requestDate: '2026-03-01', reviewedBy: null, modifiedDate: '2026-03-01', modifiedBy: 'finance@realfact.ai' },
  ],

  // ─── Cost Change Requests (M-BE-05 FR30-32) ───
  costChangeRequests: [
    { id: 'CCR-001', serviceCode: 'anthropic-claude-opus-4-5',  serviceName: 'Claude Opus 4.5',       currentCost: 0.0015,    newCost: 0.00125,   reason: 'Anthropic ประกาศลดราคา Claude Opus 4.5 รอบ Q2/2026', effectiveDate: '2026-04-01', status: 'Pending',  requestedBy: 'Platform Admin', requestDate: '2026-03-01', requestTime: '14:32', approvedBy: null,         modifiedDate: '2026-03-01', modifiedBy: 'admin@realfact.ai' },
    { id: 'CCR-002', serviceCode: 'google-cloud-tts',           serviceName: 'Google Cloud TTS',      currentCost: 0.0140,    newCost: 0.0120,    reason: 'Google ปรับลดราคา Cloud TTS Standard ทั่วโลก',      effectiveDate: '2026-04-01', status: 'Approved', requestedBy: 'Platform Admin', requestDate: '2026-02-20', requestTime: '09:15', approvedBy: 'Super Admin', modifiedDate: '2026-02-25', modifiedBy: 'super@realfact.ai' },
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
    welcomeBonusUpdatedBy: 'Super Admin',
    welcomeBonusHistory: [
      { date: '2026-02-15', oldValue: 100, newValue: 200, changedBy: 'Super Admin' },
      { date: '2025-11-01', oldValue: 0, newValue: 100, changedBy: 'Platform Admin' },
    ],
    systemDefaultPresetId: 'P-003',
    systemDefaultPresetName: 'น้องมิว — ผู้ช่วยทั่วไป',
    systemDefaultSetDate: '2025-11-01',
    systemDefaultSetBy: 'Super Admin',
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

  // ─── Tenant Meta (contact person) ───
  tenantMeta: {
    'T-001': { contactPerson: 'นายสมชาย วงศ์ดี' },
    'T-002': { contactPerson: 'นางสาวสมหญิง รักดี' },
    'T-003': { contactPerson: 'นายวิชัย การเงิน' },
    'T-004': { contactPerson: 'นายอนันต์ เทคโน' },
    'T-005': { contactPerson: 'นางสาวนภา โรงแรม' },
    'T-006': { contactPerson: 'นายภูเก็ต รีสอร์ท' },
    'T-007': { contactPerson: 'นายแพทย์มนัส โรงพยาบาล' },
    'T-008': { contactPerson: 'นางสาวรุ่งอรุณ การศึกษา' },
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
    { month: 'Sep 25', avatar:  6500, booking:  4000 },
    { month: 'Oct 25', avatar:  9200, booking:  5000 },
    { month: 'Nov 25', avatar: 15600, booking:  3300 },
    { month: 'Dec 25', avatar: 19800, booking:  4700 },
    { month: 'Jan 26', avatar: 29200, booking:  2300 },
    { month: 'Feb 26', avatar: 44300, booking: 13400 },
  ],

  // ─── Analytics: Sub-Platform Revenue current period ───
  subPlatformRevenue: [
    { name: 'Live Interact', code: 'avatar',  revenue: 20970 },
    { name: 'AI Booking',    code: 'booking', revenue: 10580 },
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
    { rank: 1, name: 'GHI Co',              subscriptions: 2, revenue: 24980 },
    { rank: 2, name: 'ABC Corp',             subscriptions: 2, revenue:  5580 },
    { rank: 3, name: 'Thai Finance Group',   subscriptions: 1, revenue:  4990 },
    { rank: 4, name: 'Northern Star Hotel',  subscriptions: 1, revenue:  4990 },
    { rank: 5, name: 'XYZ Trading',          subscriptions: 1, revenue:  2970 },
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
    { tenantName: 'Thai Finance Group',      apiCalls: 12450 },
    { tenantName: 'ABC Corporation',         apiCalls:  9830 },
    { tenantName: 'Smart Retail Co.',        apiCalls:  8240 },
    { tenantName: 'Digital Agency Thailand', apiCalls:  6780 },
    { tenantName: 'FutureTech Solutions',    apiCalls:  5920 },
    { tenantName: 'Bangkok Hospitality',     apiCalls:  4830 },
    { tenantName: 'Thai E-Commerce Hub',     apiCalls:  3960 },
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

  // ─── Helpers ───
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
      'Sold': 'chip-yellow', 'Pending': 'chip-yellow', 'Pending Verification': 'chip-yellow',
      'Processing': 'chip-yellow', 'Issued': 'chip-yellow', 'Configured': 'chip-yellow',
      'Draft': 'chip-gray', 'Registered': 'chip-blue', 'Free': 'chip-gray',
      'Starter': 'chip-blue', 'Pro': 'chip-orange',
      'Decommissioned': 'chip-red', 'Suspended': 'chip-red', 'Overdue': 'chip-red',
      'Offline': 'chip-red', 'Discontinued': 'chip-red', 'Retired': 'chip-red',
    };
    const cls = map[status] || 'chip-gray';
    return `<span class="chip ${cls}">${status}</span>`;
  },
};
