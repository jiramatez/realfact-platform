/* ================================================================
   Knowledge Base — RAG Management
   ================================================================ */

window.Pages = window.Pages || {};
window.Pages.knowledgeBase = {

  // ─── Helper: re-render page in place ───
  _rerender() {
    const ct = document.getElementById('content');
    if (ct) {
      ct.innerHTML = window.Pages.knowledgeBase.render();
      window.Pages.knowledgeBase.init();
    }
  },

  render() {
    const d = window.MockData;
    const kbs = d.knowledgeBases;
    const totalKBs = kbs.length;
    const totalDocs = kbs.reduce((sum, kb) => sum + kb.documents, 0);
    const totalChunks = kbs.reduce((sum, kb) => sum + kb.chunks, 0);
    const uploadRate = d.stats.kbUploadSuccess;
    const processingKBs = kbs.filter(kb => kb.status === 'Processing' || kb.status === 'Failed');

    // Initialise per-KB document store if not already present
    if (!window._kbDocs) {
      window._kbDocs = {
        'KB-001': [
          { id: 'doc-001-1', name: 'ผลิตภัณฑ์กองทุนรวม_2026.pdf',       type: 'PDF',  size: '4.2 MB',  chunks: 312, status: 'Ready' },
          { id: 'doc-001-2', name: 'คู่มือประกันชีวิต.pdf',              type: 'PDF',  size: '6.8 MB',  chunks: 487, status: 'Ready' },
          { id: 'doc-001-3', name: 'เงื่อนไขสินเชื่อ.pdf',              type: 'PDF',  size: '3.1 MB',  chunks: 198, status: 'Ready' },
          { id: 'doc-001-4', name: 'FAQ_การเงิน.docx',                   type: 'DOCX', size: '1.5 MB',  chunks: 145, status: 'Ready' },
          { id: 'doc-001-5', name: 'อัตราดอกเบี้ย_2026.csv',            type: 'CSV',  size: '8.9 MB',  chunks: 405, status: 'Ready' },
        ],
        'KB-002': [
          { id: 'doc-002-1', name: 'แผนผังอาคาร.pdf',                   type: 'PDF',  size: '2.4 MB',  chunks: 156, status: 'Ready' },
          { id: 'doc-002-2', name: 'บริการภายในอาคาร.docx',             type: 'DOCX', size: '1.8 MB',  chunks: 89,  status: 'Ready' },
          { id: 'doc-002-3', name: 'ระเบียบการใช้พื้นที่.pdf',          type: 'PDF',  size: '2.1 MB',  chunks: 102, status: 'Ready' },
          { id: 'doc-002-4', name: 'รายชื่อผู้ติดต่อ.txt',             type: 'TXT',  size: '0.3 MB',  chunks: 28,  status: 'Ready' },
          { id: 'doc-002-5', name: 'ข้อมูลที่จอดรถ.csv',               type: 'CSV',  size: '1.6 MB',  chunks: 48,  status: 'Ready' },
        ],
        'KB-003': [
          { id: 'doc-003-1', name: 'โรคทั่วไปเบื้องต้น.pdf',           type: 'PDF',  size: '5.2 MB',  chunks: 389, status: 'Ready' },
          { id: 'doc-003-2', name: 'โภชนาการเบื้องต้น.pdf',            type: 'PDF',  size: '3.8 MB',  chunks: 245, status: 'Ready' },
          { id: 'doc-003-3', name: 'ยาสามัญประจำบ้าน.docx',            type: 'DOCX', size: '2.1 MB',  chunks: 134, status: 'Ready' },
          { id: 'doc-003-4', name: 'การปฐมพยาบาล.pdf',                 type: 'PDF',  size: '4.7 MB',  chunks: 188, status: 'Ready' },
        ],
        'KB-004': [
          { id: 'doc-004-1', name: 'ข้อมูลโรงแรม.pdf',                 type: 'PDF',  size: '7.5 MB',  chunks: 512, status: 'Ready' },
          { id: 'doc-004-2', name: 'ร้านอาหารแนะนำ.docx',             type: 'DOCX', size: '3.2 MB',  chunks: 287, status: 'Ready' },
          { id: 'doc-004-3', name: 'สถานที่ท่องเที่ยว.pdf',            type: 'PDF',  size: '8.9 MB',  chunks: 634, status: 'Ready' },
          { id: 'doc-004-4', name: 'บริการสปา.txt',                    type: 'TXT',  size: '0.8 MB',  chunks: 45,  status: 'Ready' },
          { id: 'doc-004-5', name: 'โปรโมชั่น_มีนา_2026.csv',         type: 'CSV',  size: '11.7 MB', chunks: 625, status: 'Ready' },
        ],
        'KB-005': [
          { id: 'doc-005-1', name: 'FAQ_สินค้า_ABC.pdf',               type: 'PDF',  size: '2.1 MB',  chunks: 0, status: 'Processing' },
          { id: 'doc-005-2', name: 'คู่มือการใช้งาน.docx',            type: 'DOCX', size: '1.4 MB',  chunks: 0, status: 'Processing' },
          { id: 'doc-005-3', name: 'รายการสินค้า.csv',                 type: 'CSV',  size: '1.2 MB',  chunks: 0, status: 'Processing' },
        ],
      };
    }

    // Keep legacy window._kbMockDocs pointing to same store for any other code that might reference it
    window._kbMockDocs = window._kbDocs;

    function fileTypeIcon(type) {
      const map = { PDF: 'fa-file-pdf', DOCX: 'fa-file-word', CSV: 'fa-file-csv', TXT: 'fa-file-lines' };
      return map[type] || 'fa-file';
    }

    function kbDataAttrs(kb) {
      return `data-name="${kb.name.toLowerCase()}" data-tenant="${kb.tenantName.toLowerCase()}" data-status="${kb.status}"`;
    }

    function renderKBCard(kb) {
      const presetNames = kb.presets.map(pid => {
        const p = d.presets.find(pr => pr.id === pid);
        return p ? p.name : pid;
      });
      const isProcessingOrFailed = kb.status === 'Processing' || kb.status === 'Failed';

      return `
        <div class="card card-accent" data-kb-id="${kb.id}" ${kbDataAttrs(kb)}>
          <!-- Header -->
          <div class="flex items-start justify-between mb-12">
            <div class="flex-1">
              <div class="font-700 heading mb-4">${kb.name}</div>
              <div class="text-muted text-sm"><i class="fa-solid fa-building"></i> ${kb.tenantName}</div>
            </div>
            <div>${d.statusChip(kb.status)}</div>
          </div>

          ${isProcessingOrFailed ? `
          <div class="progress-bar mb-12">
            <div class="progress-fill" style="width:${kb.status === 'Failed' ? '0%' : '45%'};${kb.status === 'Processing' ? 'animation:pulse 1.5s ease-in-out infinite' : 'background:var(--danger)'}"></div>
          </div>` : ''}

          <!-- Stats Row -->
          <div class="flex gap-20 mb-14">
            <div>
              <div class="text-xs uppercase text-muted">เอกสาร</div>
              <div class="font-600 mono">${d.formatNumber(kb.documents)}</div>
            </div>
            <div>
              <div class="text-xs uppercase text-muted">CHUNKS</div>
              <div class="font-600 mono">${d.formatNumber(kb.chunks)}</div>
            </div>
            <div>
              <div class="text-xs uppercase text-muted">ขนาด</div>
              <div class="font-600 mono">${kb.totalSize}</div>
            </div>
          </div>

          <!-- Linked Presets -->
          <div class="mb-12">
            <div class="text-xs uppercase text-muted mb-6"><i class="fa-solid fa-link"></i> PRESET ที่เชื่อมต่อ</div>
            ${presetNames.length > 0
              ? presetNames.map(n => `<span class="chip chip-blue text-xs mb-4">${n}</span> `).join('')
              : '<span class="text-muted text-sm">ยังไม่มี Preset เชื่อมต่อ</span>'}
          </div>

          <!-- Last Updated / Modified -->
          <div class="text-xs text-muted mb-14">
            <i class="fa-solid fa-clock"></i> แก้ไขล่าสุด: <span class="mono">${kb.modifiedDate || kb.lastUpdated || '-'}</span>
            ${kb.modifiedBy ? `&nbsp;·&nbsp;<i class="fa-solid fa-user"></i> ${kb.modifiedBy.split('@')[0]}` : ''}
          </div>

          <!-- Footer -->
          <div class="divider mb-12"></div>
          <div class="flex justify-end gap-8 flex-wrap">
            ${(!window.Auth || Auth.hasPermission('canDelete')) ? `<button class="btn btn-sm btn-danger btn-delete-kb" data-kb-id="${kb.id}">
              <i class="fa-solid fa-trash"></i> ลบ KB
            </button>` : ''}
            ${isProcessingOrFailed ? `
            <button class="btn btn-sm btn-outline btn-retry-kb" data-kb-id="${kb.id}" style="color:var(--warning,#f59e0b);border-color:var(--warning,#f59e0b)">
              <i class="fa-solid fa-rotate-right"></i> Retry
            </button>` : ''}
            ${(!window.Auth || Auth.hasPermission('canEdit')) ? `<button class="btn btn-sm btn-ghost btn-edit-kb" data-kb-id="${kb.id}">
              <i class="fa-solid fa-pen"></i> แก้ไข
            </button>` : ''}
            <button class="btn btn-sm btn-outline btn-view-docs" data-kb-id="${kb.id}">
              <i class="fa-solid fa-folder-open"></i> ดูเอกสาร
            </button>
          </div>
        </div>`;
    }

    return `
      <div>
        <!-- Page Header -->
        <div class="page-header">
          <h2 class="heading">KNOWLEDGE BASE</h2>
          <div class="page-header-actions">
            ${(!window.Auth || Auth.hasPermission('canEdit')) ? `<button class="btn btn-primary" id="btn-create-kb">
              <i class="fa-solid fa-plus"></i> สร้าง KB
            </button>` : ''}
          </div>
        </div>

        <!-- Stats Row -->
        <div class="grid-4 gap-20 mb-24">
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-icon blue"><i class="fa-solid fa-database"></i></span>
            </div>
            <div class="stat-value mono">${d.formatNumber(totalKBs)}</div>
            <div class="stat-label uppercase">KNOWLEDGE BASE ทั้งหมด</div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-icon green"><i class="fa-solid fa-file-lines"></i></span>
            </div>
            <div class="stat-value mono">${d.formatNumber(totalDocs)}</div>
            <div class="stat-label uppercase">เอกสารทั้งหมด</div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-icon purple"><i class="fa-solid fa-puzzle-piece"></i></span>
            </div>
            <div class="stat-value mono">${d.formatNumber(totalChunks)}</div>
            <div class="stat-label uppercase">CHUNKS ทั้งหมด</div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-icon orange"><i class="fa-solid fa-cloud-arrow-up"></i></span>
            </div>
            <div class="stat-value mono">${uploadRate}<span class="text-sm font-600">%</span></div>
            <div class="stat-label uppercase">อัตราอัพโหลดสำเร็จ</div>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="flex items-center gap-12 mb-16">
          <div class="search-bar flex-1">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="kb-search" placeholder="ค้นหา KB / Tenant...">
          </div>
          <div class="form-group" style="margin:0;min-width:150px;">
            <select class="form-input" id="kb-status-filter">
              <option value="all">All Status</option>
              <option value="Ready">Ready</option>
              <option value="Processing">Processing</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        <!-- Processing / Failed Alert -->
        ${processingKBs.length > 0 ? `
        <div class="alert-warning mb-20">
          <i class="fa-solid fa-spinner fa-spin"></i>
          <span>กำลังประมวลผล: <strong>${processingKBs.map(kb => kb.name).join(', ')}</strong> — อาจใช้เวลาสักครู่</span>
        </div>` : ''}

        <!-- KB Grid -->
        <div class="grid-2 gap-20" id="kb-grid">
          ${kbs.map(kb => renderKBCard(kb)).join('')}
        </div>
      </div>`;
  },

  init() {
    const d = window.MockData;
    const kbs = d.knowledgeBases;
    const self = window.Pages.knowledgeBase;

    // ─── KB Filter/Search ───
    function filterKBCards() {
      const search = (document.getElementById('kb-search') || {}).value.trim().toLowerCase();
      const status = (document.getElementById('kb-status-filter') || {}).value;
      document.querySelectorAll('#kb-grid .card').forEach(card => {
        const name = card.dataset.name || '';
        const tenant = card.dataset.tenant || '';
        const cardStatus = card.dataset.status || '';
        const matchSearch = !search || name.includes(search) || tenant.includes(search);
        const matchStatus = status === 'all' || cardStatus === status;
        card.style.display = (matchSearch && matchStatus) ? '' : 'none';
      });
    }
    const kbSearchEl = document.getElementById('kb-search');
    const kbStatusEl = document.getElementById('kb-status-filter');
    if (kbSearchEl) kbSearchEl.addEventListener('input', filterKBCards);
    if (kbStatusEl) kbStatusEl.addEventListener('change', filterKBCards);

    // ─── Open View-Documents modal ───
    function openViewDocsModal(kbId) {
      const kb = kbs.find(k => k.id === kbId);
      if (!kb) return;

      const docs = (window._kbDocs && window._kbDocs[kbId]) || [];

      function fileTypeIcon(type) {
        const map = { PDF: 'fa-file-pdf', DOCX: 'fa-file-word', CSV: 'fa-file-csv', TXT: 'fa-file-lines' };
        return map[type] || 'fa-file';
      }

      function buildTableRows(docList) {
        if (!docList.length) {
          return `<tr><td colspan="6" class="text-muted text-sm" style="text-align:center;padding:20px">ยังไม่มีเอกสาร</td></tr>`;
        }
        return docList.map(doc => `
          <tr>
            <td><i class="fa-solid ${fileTypeIcon(doc.type)} text-primary"></i> ${doc.name}</td>
            <td><span class="chip chip-gray text-xs">${doc.type}</span></td>
            <td class="mono">${doc.size}</td>
            <td class="mono">${d.formatNumber(doc.chunks)}</td>
            <td>${d.statusChip(doc.status)}</td>
            <td>
              ${(!window.Auth || Auth.hasPermission('canDelete')) ? `<button class="btn btn-sm btn-ghost btn-delete-doc" data-doc-id="${doc.id}" data-kb-id="${kbId}"
                style="color:var(--danger);padding:4px 8px" title="ลบเอกสาร">
                <i class="fa-solid fa-trash"></i>
              </button>` : ''}
            </td>
          </tr>`).join('');
      }

      const modalHtml = `
        <div class="modal-content" style="max-width:760px;margin:5vh auto;background:var(--card-bg);border-radius:16px;padding:28px;position:relative;max-height:85vh;overflow-y:auto">
          <button class="btn btn-ghost modal-close-btn" style="position:absolute;top:12px;right:12px" onclick="App.closeModal()">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <div class="flex items-center gap-12 mb-6">
            <span class="stat-icon blue" style="min-width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:10px">
              <i class="fa-solid fa-database"></i>
            </span>
            <div>
              <h3 class="heading mb-4">${kb.name}</h3>
              <div class="text-muted text-sm">${kb.tenantName} &middot; <span class="mono">${kb.id}</span></div>
            </div>
          </div>

          <div class="flex gap-16 mb-16">
            ${d.statusChip(kb.status)}
            <span class="text-sm text-muted"><i class="fa-solid fa-puzzle-piece"></i> <span class="mono">${d.formatNumber(kb.chunks)}</span> Chunks</span>
            <span class="text-sm text-muted"><i class="fa-solid fa-hard-drive"></i> <span class="mono">${kb.totalSize}</span></span>
          </div>

          <div class="divider mb-16"></div>

          <div class="flex items-center justify-between mb-12">
            <div class="section-title uppercase"><i class="fa-solid fa-folder-open"></i> เอกสารทั้งหมด (<span class="mono" id="docs-count">${docs.length}</span>)</div>
            <button class="btn btn-primary btn-sm" id="btn-upload-doc-open">
              <i class="fa-solid fa-cloud-arrow-up"></i> อัปโหลดเอกสารใหม่
            </button>
          </div>

          <div class="table-wrap mb-20">
            <table id="docs-table">
              <thead>
                <tr>
                  <th>ชื่อไฟล์</th>
                  <th>ประเภท</th>
                  <th>ขนาด</th>
                  <th>CHUNKS</th>
                  <th>สถานะ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="docs-tbody">
                ${buildTableRows(docs)}
              </tbody>
            </table>
          </div>
        </div>`;

      window.App.showModal(modalHtml);

      setTimeout(() => {
        // ─── Delete document buttons ───
        function bindDeleteDocBtns() {
          document.querySelectorAll('.btn-delete-doc').forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const docId = btn.dataset.docId;
              const kId   = btn.dataset.kbId;
              const docList = window._kbDocs[kId];
              if (!docList) return;
              const docObj = docList.find(doc => doc.id === docId);
              if (!docObj) return;
              App.confirm(`ยืนยันการลบเอกสาร "${docObj.name}" หรือไม่?`, { title: 'ลบเอกสาร', confirmText: 'ลบ', cancelText: 'ยกเลิก', type: 'danger' }).then(ok => {
                if (!ok) return;

                const idx = docList.findIndex(doc => doc.id === docId);
                if (idx !== -1) {
                  const removed = docList.splice(idx, 1)[0];
                  // Update KB stats
                  const kbObj = kbs.find(k => k.id === kId);
                  if (kbObj) {
                    kbObj.documents = Math.max(0, kbObj.documents - 1);
                    kbObj.chunks    = Math.max(0, kbObj.chunks - (removed.chunks || 0));
                  }
                }

                // Refresh table in place
                const tbody = document.getElementById('docs-tbody');
                const countEl = document.getElementById('docs-count');
                if (tbody) tbody.innerHTML = buildTableRows(window._kbDocs[kId] || []);
                if (countEl) countEl.textContent = (window._kbDocs[kId] || []).length;
                bindDeleteDocBtns();

                App.toast(`ลบเอกสารสำเร็จ`, 'success');
                self._rerender(); // update card stats
                // Note: modal stays open since we only re-render the grid behind it
              });
            });
          });
        }
        bindDeleteDocBtns();

        // ─── Upload document button ───
        const uploadOpenBtn = document.getElementById('btn-upload-doc-open');
        if (uploadOpenBtn) {
          uploadOpenBtn.addEventListener('click', () => {
            openUploadDocModal(kbId, buildTableRows, kb);
          });
        }
      }, 50);
    }

    // ─── Upload Document to KB modal ───
    function openUploadDocModal(kbId, buildTableRowsFn, kb) {
      const uploadModalHtml = `
        <div class="modal-content" style="max-width:520px;margin:10vh auto;background:var(--card-bg);border-radius:16px;padding:28px;position:relative">
          <button class="btn btn-ghost" style="position:absolute;top:12px;right:12px" onclick="App.closeModal()">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <h3 class="heading mb-6"><i class="fa-solid fa-cloud-arrow-up"></i> อัปโหลดเอกสาร</h3>
          <div class="text-muted text-sm mb-20">${kb.name}</div>

          <div id="upload-drop-zone" style="border:2px dashed var(--border);border-radius:12px;padding:36px;text-align:center;cursor:pointer;transition:border-color 0.2s,background 0.2s">
            <i class="fa-solid fa-cloud-arrow-up" style="font-size:2.2rem;color:var(--text-muted);margin-bottom:12px;display:block"></i>
            <div class="font-600 mb-6">ลากไฟล์มาที่นี่ หรือคลิกเพื่อเลือก</div>
            <div class="text-muted text-sm">รองรับ PDF, DOCX, TXT, CSV</div>
            <input type="file" id="upload-file-input" multiple accept=".pdf,.docx,.txt,.csv" style="display:none">
          </div>

          <div id="upload-file-list" class="mt-12" style="max-height:160px;overflow-y:auto"></div>

          <div class="banner-info mt-16 mb-4" style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.25);border-radius:8px;padding:10px 14px;font-size:0.85rem">
            <i class="fa-solid fa-circle-info" style="color:#3b82f6"></i>
            <span style="margin-left:6px">ระบบจะ Chunk + Embed อัตโนมัติหลังอัปโหลด</span>
          </div>

          <div class="divider mt-16 mb-16"></div>
          <div class="flex justify-end gap-12">
            <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
            <button class="btn btn-primary" id="btn-confirm-upload" disabled>
              <i class="fa-solid fa-check"></i> อัปโหลด
            </button>
          </div>
        </div>`;

      window.App.showModal(uploadModalHtml);

      setTimeout(() => {
        const dropZone     = document.getElementById('upload-drop-zone');
        const fileInput    = document.getElementById('upload-file-input');
        const fileListEl   = document.getElementById('upload-file-list');
        const confirmBtn   = document.getElementById('btn-confirm-upload');
        let selectedFiles  = [];

        function renderFileList() {
          if (!selectedFiles.length) {
            fileListEl.innerHTML = '';
            confirmBtn.disabled = true;
            return;
          }
          confirmBtn.disabled = false;
          fileListEl.innerHTML = selectedFiles.map((f, i) => `
            <div class="flex items-center justify-between mb-6" style="background:var(--bg);border-radius:6px;padding:8px 12px;font-size:0.85rem">
              <span><i class="fa-solid fa-file text-primary"></i> ${f.name}</span>
              <button type="button" onclick="window._uploadRemoveFile(${i})" style="background:none;border:none;cursor:pointer;color:var(--danger)">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>`).join('');
        }

        window._uploadRemoveFile = function(idx) {
          selectedFiles.splice(idx, 1);
          renderFileList();
        };

        if (dropZone && fileInput) {
          dropZone.addEventListener('click', () => fileInput.click());
          dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--primary)';
            dropZone.style.background = 'rgba(var(--primary-rgb,241,91,38),0.06)';
          });
          dropZone.addEventListener('dragleave', () => {
            dropZone.style.borderColor = 'var(--border)';
            dropZone.style.background = '';
          });
          dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--border)';
            dropZone.style.background = '';
            const files = [...e.dataTransfer.files];
            selectedFiles = [...selectedFiles, ...files];
            renderFileList();
          });
          fileInput.addEventListener('change', () => {
            selectedFiles = [...selectedFiles, ...fileInput.files];
            renderFileList();
            fileInput.value = '';
          });
        }

        if (confirmBtn) {
          confirmBtn.addEventListener('click', () => {
            if (!selectedFiles.length) return;

            const docStore = window._kbDocs[kbId] || (window._kbDocs[kbId] = []);
            const kbObj    = kbs.find(k => k.id === kbId);
            const extMap   = { pdf: 'PDF', docx: 'DOCX', txt: 'TXT', csv: 'CSV' };

            selectedFiles.forEach((f, i) => {
              const ext    = f.name.split('.').pop().toLowerCase();
              const type   = extMap[ext] || 'PDF';
              const mockSz = (Math.random() * 5 + 0.5).toFixed(2) + ' MB';
              const newId  = `doc-${kbId}-upload-${Date.now()}-${i}`;
              const newDoc = { id: newId, name: f.name, type, size: mockSz, chunks: 0, status: 'Processing' };
              docStore.push(newDoc);
              if (kbObj) kbObj.documents = (kbObj.documents || 0) + 1;
            });

            App.closeModal();
            self._rerender();
            App.toast(`อัปโหลด ${selectedFiles.length} ไฟล์สำเร็จ — กำลังประมวลผล...`, 'success');

            // Simulate processing completion after 2s
            setTimeout(() => {
              const docStore2 = window._kbDocs[kbId] || [];
              docStore2.filter(doc => doc.status === 'Processing').forEach(doc => {
                const mockChunks = Math.floor(Math.random() * 200 + 50);
                doc.chunks = mockChunks;
                doc.status = 'Ready';
                const kbObj2 = kbs.find(k => k.id === kbId);
                if (kbObj2) kbObj2.chunks = (kbObj2.chunks || 0) + mockChunks;
              });
              self._rerender();
            }, 2000);
          });
        }
      }, 50);
    }

    // ─── View Documents Button ───
    document.querySelectorAll('.btn-view-docs').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openViewDocsModal(btn.dataset.kbId);
      });
    });

    // ─── Edit KB Button ───
    document.querySelectorAll('.btn-edit-kb').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const kbId = btn.dataset.kbId;
        const kb   = kbs.find(k => k.id === kbId);
        if (!kb) return;

        const tenantOptions = d.tenants.filter(t => t.status === 'Active').map(t =>
          `<option value="${t.id}" ${kb.tenantId === t.id ? 'selected' : ''}>${t.name}</option>`
        ).join('');

        const modalHtml = `
          <div class="modal-content" style="max-width:520px;margin:8vh auto;background:var(--card-bg);border-radius:16px;padding:28px;position:relative">
            <button class="btn btn-ghost" style="position:absolute;top:12px;right:12px" onclick="App.closeModal()">
              <i class="fa-solid fa-xmark"></i>
            </button>

            <h3 class="heading mb-20"><i class="fa-solid fa-pen"></i> แก้ไข Knowledge Base</h3>

            <div class="form-group mb-16">
              <label class="form-label uppercase">ชื่อ KB</label>
              <input type="text" class="form-input w-full" id="edit-kb-name" value="${kb.name}">
            </div>

            <div class="form-group mb-20">
              <label class="form-label uppercase">ผู้เช่า (TENANT)</label>
              <select class="form-input w-full" id="edit-kb-tenant">
                <option value="">เลือกผู้เช่า</option>
                ${tenantOptions}
              </select>
            </div>

            <div class="divider mb-16"></div>
            <div class="flex justify-end gap-12">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-primary" id="btn-save-kb-edit"><i class="fa-solid fa-check"></i> บันทึก</button>
            </div>
          </div>`;

        window.App.showModal(modalHtml);

        setTimeout(() => {
          const saveBtn = document.getElementById('btn-save-kb-edit');
          if (saveBtn) {
            saveBtn.addEventListener('click', () => {
              const newName = (document.getElementById('edit-kb-name') || {}).value || '';
              const tenantSel  = document.getElementById('edit-kb-tenant');
              const newTenantId = tenantSel ? tenantSel.value : '';

              if (!newName.trim()) { App.toast('กรุณาระบุชื่อ KB', 'error'); return; }

              const tenant = newTenantId ? d.tenants.find(t => t.id === newTenantId) : null;
              kb.name       = newName.trim();
              if (tenant) {
                kb.tenantId   = tenant.id;
                kb.tenantName = tenant.name;
              }

              App.closeModal();
              self._rerender();
              App.toast(`อัปเดต KB "${kb.name}" สำเร็จ`, 'success');
            });
          }
        }, 50);
      });
    });

    // ─── Delete KB Button ───
    document.querySelectorAll('.btn-delete-kb').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const kbId = btn.dataset.kbId;
        const kb   = kbs.find(k => k.id === kbId);
        if (!kb) return;

        // Find presets linked to this KB
        const linkedPresets = d.presets.filter(p => p.kbId === kbId);

        const confirmMsg = linkedPresets.length > 0
          ? `KB นี้ถูกเชื่อมต่อกับ Preset: ${linkedPresets.map(p => `"${p.name}"`).join(', ')}\n\nการลบจะยกเลิกการเชื่อมต่อ Preset ดังกล่าว ยืนยันหรือไม่?`
          : `ยืนยันการลบ KB "${kb.name}" หรือไม่?`;

        App.confirm(confirmMsg, { title: 'ลบ Knowledge Base', confirmText: 'ลบ', cancelText: 'ยกเลิก', type: 'danger' }).then(ok => {
          if (!ok) return;

          // Remove KB
          const idx = kbs.findIndex(k => k.id === kbId);
          if (idx !== -1) kbs.splice(idx, 1);

          // Unlink from presets
          linkedPresets.forEach(p => {
            p.kbId   = null;
            p.kbName = null;
          });

          // Remove from preset.presets arrays (reverse link)
          d.presets.forEach(p => {
            if (p.presets) p.presets = p.presets.filter(id => id !== kbId);
          });

          // Clean up doc store
          if (window._kbDocs) delete window._kbDocs[kbId];

          self._rerender();
          App.toast(`ลบ KB "${kb.name}" สำเร็จ`, 'success');
        });
      });
    });

    // ─── Retry KB Button ───
    document.querySelectorAll('.btn-retry-kb').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const kbId = btn.dataset.kbId;
        const kb   = kbs.find(k => k.id === kbId);
        if (!kb) return;
        kb.status = 'Processing';
        self._rerender();
        App.toast(`กำลัง Retry "${kb.name}" — รอสักครู่...`, 'warning');
      });
    });

    // ─── Create KB Button ───
    const createBtn = document.getElementById('btn-create-kb');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        const tenantOptions = d.tenants.filter(t => t.status === 'Active').map(t =>
          `<option value="${t.id}">${t.name}</option>`
        ).join('');

        const modalHtml = `
          <div class="modal-content" style="max-width:560px;margin:5vh auto;background:var(--card-bg);border-radius:16px;padding:28px;position:relative;max-height:85vh;overflow-y:auto">
            <button class="btn btn-ghost modal-close-btn" style="position:absolute;top:12px;right:12px" onclick="App.closeModal()">
              <i class="fa-solid fa-xmark"></i>
            </button>

            <h3 class="heading mb-20"><i class="fa-solid fa-plus"></i> สร้าง Knowledge Base ใหม่</h3>

            <div class="form-group mb-16">
              <label class="form-label uppercase">ชื่อ KB</label>
              <input type="text" class="form-input w-full" id="create-kb-name" placeholder="ระบุชื่อ Knowledge Base">
            </div>

            <div class="form-group mb-16">
              <label class="form-label uppercase">ผู้เช่า (TENANT)</label>
              <select class="form-input w-full" id="create-kb-tenant">
                <option value="">เลือกผู้เช่า</option>
                ${tenantOptions}
              </select>
            </div>

            <div class="form-group mb-16">
              <label class="form-label uppercase">อัพโหลดเอกสาร (เริ่มต้น)</label>
              <div id="kb-drop-zone" style="border:2px dashed var(--border);border-radius:12px;padding:32px;text-align:center;cursor:pointer;transition:border-color 0.2s,background 0.2s">
                <i class="fa-solid fa-cloud-arrow-up" style="font-size:2rem;color:var(--text-muted);margin-bottom:12px;display:block"></i>
                <div class="font-600 mb-6">ลากไฟล์มาที่นี่ หรือคลิกเพื่อเลือก</div>
                <div class="text-muted text-sm">รองรับ PDF, DOCX, TXT, CSV — ระบบจะ Chunk + Embed อัตโนมัติ</div>
                <input type="file" id="kb-file-input" multiple accept=".pdf,.docx,.txt,.csv" style="display:none">
              </div>
              <div id="kb-file-list" class="mt-10" style="max-height:120px;overflow-y:auto"></div>
            </div>

            <div class="banner-info mb-20">
              <span class="banner-icon"><i class="fa-solid fa-circle-info"></i></span>
              <span>รองรับ PDF, DOCX, TXT, CSV — ระบบจะ Chunk + Embed อัตโนมัติ</span>
            </div>

            <div class="divider mb-16"></div>

            <div class="flex justify-end gap-12">
              <button class="btn btn-outline" onclick="App.closeModal()">ยกเลิก</button>
              <button class="btn btn-primary" id="btn-save-kb"><i class="fa-solid fa-check"></i> สร้าง</button>
            </div>
          </div>`;

        window.App.showModal(modalHtml);

        setTimeout(() => {
          const dropZone   = document.getElementById('kb-drop-zone');
          const fileInput  = document.getElementById('kb-file-input');
          const fileListEl = document.getElementById('kb-file-list');
          let selectedFiles = [];

          function renderFileList() {
            if (!fileListEl) return;
            fileListEl.innerHTML = selectedFiles.map((f, i) => `
              <div class="flex items-center justify-between mb-6" style="background:var(--bg);border-radius:6px;padding:6px 10px;font-size:0.83rem">
                <span><i class="fa-solid fa-file text-primary"></i> ${f.name}</span>
                <button type="button" onclick="window._createKbRemoveFile(${i})" style="background:none;border:none;cursor:pointer;color:var(--danger)">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>`).join('');
          }

          window._createKbRemoveFile = function(idx) {
            selectedFiles.splice(idx, 1);
            renderFileList();
          };

          if (dropZone && fileInput) {
            dropZone.addEventListener('click', () => fileInput.click());
            dropZone.addEventListener('dragover', (e) => {
              e.preventDefault();
              dropZone.style.borderColor = 'var(--primary)';
              dropZone.style.background = 'rgba(var(--primary-rgb,241,91,38),0.06)';
            });
            dropZone.addEventListener('dragleave', () => {
              dropZone.style.borderColor = 'var(--border)';
              dropZone.style.background = '';
            });
            dropZone.addEventListener('drop', (e) => {
              e.preventDefault();
              dropZone.style.borderColor = 'var(--border)';
              dropZone.style.background = '';
              selectedFiles = [...selectedFiles, ...e.dataTransfer.files];
              renderFileList();
            });
            fileInput.addEventListener('change', () => {
              selectedFiles = [...selectedFiles, ...fileInput.files];
              renderFileList();
              fileInput.value = '';
            });
          }

          const saveBtn = document.getElementById('btn-save-kb');
          if (saveBtn) {
            saveBtn.addEventListener('click', () => {
              const name     = (document.getElementById('create-kb-name') || {}).value || '';
              const tenantSel = document.getElementById('create-kb-tenant');
              const tenantId  = tenantSel ? tenantSel.value : '';

              if (!name.trim()) { App.toast('กรุณาระบุชื่อ KB', 'error'); return; }
              if (!tenantId)    { App.toast('กรุณาเลือก Tenant', 'error'); return; }

              const tenant = d.tenants.find(t => t.id === tenantId);

              // Generate new ID
              const maxId = d.knowledgeBases.reduce((max, k) => {
                const n = parseInt(k.id.replace('KB-', ''), 10) || 0;
                return Math.max(max, n);
              }, 0);
              const newId = `KB-${String(maxId + 1).padStart(3, '0')}`;

              const extMap = { pdf: 'PDF', docx: 'DOCX', txt: 'TXT', csv: 'CSV' };
              const initDocs = selectedFiles.map((f, i) => {
                const ext  = f.name.split('.').pop().toLowerCase();
                const type = extMap[ext] || 'PDF';
                return { id: `doc-${newId}-${i}`, name: f.name, type, size: (Math.random() * 5 + 0.5).toFixed(2) + ' MB', chunks: 0, status: 'Processing' };
              });

              const newKB = {
                id:          newId,
                name:        name.trim(),
                tenantId:    tenant.id,
                tenantName:  tenant.name,
                documents:   initDocs.length,
                chunks:      0,
                embeddings:  0,
                totalSize:   initDocs.length ? (initDocs.length * 2.5).toFixed(2) + ' MB' : '0 MB',
                status:      initDocs.length ? 'Processing' : 'Ready',
                lastUpdated: new Date().toISOString().slice(0, 10),
                presets:     [],
                modifiedDate: new Date().toISOString().slice(0, 10),
                modifiedBy:   ((window.Auth && Auth.currentUser()) ? Auth.currentUser().email : 'system'),
              };

              d.knowledgeBases.push(newKB);
              if (!window._kbDocs) window._kbDocs = {};
              window._kbDocs[newId] = initDocs;

              App.closeModal();
              self._rerender();
              App.toast(`สร้าง KB "${newKB.name}" สำเร็จ${initDocs.length ? ' — กำลังประมวลผลเอกสาร...' : ''}`, 'success');

              // Simulate processing completion
              if (initDocs.length) {
                setTimeout(() => {
                  const kbObj = d.knowledgeBases.find(k => k.id === newId);
                  if (kbObj) {
                    let totalChunks = 0;
                    (window._kbDocs[newId] || []).forEach(doc => {
                      const mockChunks = Math.floor(Math.random() * 200 + 50);
                      doc.chunks = mockChunks;
                      doc.status = 'Ready';
                      totalChunks += mockChunks;
                    });
                    kbObj.chunks     = totalChunks;
                    kbObj.embeddings = totalChunks;
                    kbObj.status     = 'Ready';
                    self._rerender();
                  }
                }, 2500);
              }
            });
          }
        }, 50);
      });
    }
  }
};
