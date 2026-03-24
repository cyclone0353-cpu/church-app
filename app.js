import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAjzzpgDtYXvMZIqoFQ14qOgtRz_6YrgDw",
  authDomain: "onemind-church-dream.firebaseapp.com",
  projectId: "onemind-church-dream",
  storageBucket: "onemind-church-dream.firebasestorage.app",
  messagingSenderId: "478768693720",
  appId: "1:478768693720:web:2675bff9a9d1d44916f2ad",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const APP_DOC_REF = doc(db, "churchApps", "youthAttendance");

const CLASS_LIST = ["전체", "1반", "2반", "3반", "4반", "5반"];
const GRADE_LIST = ["중1", "중2", "중3", "고1", "고2", "고3"];
const STATUS_LIST = ["출석", "결석", "지각"];

const TEACHERS = [
  { id: "t1", name: "전체 관리자", role: "admin", className: "전체" },
  { id: "t2", name: "전정균 선생님", role: "teacher", className: "1반" },
  { id: "t3", name: "정승아 선생님", role: "teacher", className: "2반" },
  { id: "t4", name: "김미라 선생님", role: "teacher", className: "3반" },
  { id: "t5", name: "윤봉현 선생님", role: "teacher", className: "4반" },
  { id: "t6", name: "서재엽 선생님", role: "teacher", className: "5반" },
];

const DEFAULT_STUDENTS = [
  { id: "s1", name: "이예강", className: "1반", grade: "고3", phone: "", parentPhone: "", isNew: false, note: "" },
  { id: "s2", name: "전종성", className: "1반", grade: "고1", phone: "", parentPhone: "", isNew: false, note: "" },
  { id: "s3", name: "김동언", className: "1반", grade: "중2", phone: "", parentPhone: "", isNew: false, note: "" },
  { id: "s4", name: "김은율", className: "1반", grade: "중2", phone: "", parentPhone: "", isNew: false, note: "" },
  { id: "s5", name: "강윤하", className: "1반", grade: "중2", phone: "", parentPhone: "", isNew: false, note: "" },
  { id: "s6", name: "문지원", className: "1반", grade: "중2", phone: "", parentPhone: "", isNew: false, note: "" },

  { id: "s7", name: "이보나", className: "2반", grade: "고3", phone: "", parentPhone: "", isNew: false, note: "" },
  { id: "s8", name: "전수미", className: "2반", grade: "고3", phone: "", parentPhone: "", isNew: false, note: "" },
  { id: "s9", name: "정이안", className: "2반", grade: "고2", phone: "", parentPhone: "", isNew: false, note: "" },
  { id: "s10", name: "윤성현", className: "2반", grade: "중2", phone: "", parentPhone: "", isNew: false, note: "" },

  { id: "s11", name: "백민위", className: "3반", grade: "중3", phone: "", parentPhone: "", isNew: false, note: "" },
  { id: "s12", name: "박희윤", className: "3반", grade: "중3", phone: "", parentPhone: "", isNew: false, note: "" },
  { id: "s13", name: "이승리", className: "3반", grade: "중3", phone: "", parentPhone: "", isNew: false, note: "" },
  { id: "s14", name: "정소원", className: "3반", grade: "중1", phone: "", parentPhone: "", isNew: false, note: "" },

  { id: "s15", name: "김동제", className: "4반", grade: "중1", phone: "", parentPhone: "", isNew: false, note: "" },
  { id: "s16", name: "이영준", className: "4반", grade: "중1", phone: "", parentPhone: "", isNew: false, note: "" },
  { id: "s17", name: "천성현", className: "4반", grade: "중1", phone: "", parentPhone: "", isNew: false, note: "" },
  { id: "s18", name: "박건률", className: "4반", grade: "고2", phone: "", parentPhone: "", isNew: false, note: "" },

  { id: "s19", name: "이지훈", className: "5반", grade: "중3", phone: "", parentPhone: "", isNew: false, note: "" },
  { id: "s20", name: "이우혁", className: "5반", grade: "중3", phone: "", parentPhone: "", isNew: false, note: "" },
  { id: "s21", name: "이지현", className: "5반", grade: "중3", phone: "", parentPhone: "", isNew: false, note: "" },
  { id: "s22", name: "백건위", className: "5반", grade: "고2", phone: "", parentPhone: "", isNew: false, note: "" },
  { id: "s23", name: "이영웅", className: "5반", grade: "고1", phone: "", parentPhone: "", isNew: false, note: "" },
  { id: "s24", name: "이경민", className: "5반", grade: "중2", phone: "", parentPhone: "", isNew: false, note: "" },
];

const appState = {
  user: null,
  students: [],
  attendanceByDate: {},
  selectedTeacherId: "t1",
  selectedDate: todayString(),
  selectedClass: "전체",
  search: "",
  activeTab: "attendance",
  isReady: false,
  isSaving: false,
  saveMessage: "연결 중...",
};

function todayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function currentTeacher() {
  return TEACHERS.find((t) => t.id === appState.selectedTeacherId) || TEACHERS[0];
}

function effectiveClass() {
  const teacher = currentTeacher();
  if (teacher.role === "teacher") return teacher.className;
  return appState.selectedClass;
}

function canEditStudent(student) {
  const teacher = currentTeacher();
  return teacher.role === "admin" || teacher.className === student.className;
}

function currentRecords() {
  return appState.attendanceByDate[appState.selectedDate] || {};
}

function visibleStudents() {
  const className = effectiveClass();
  return appState.students.filter((student) => {
    const classMatch = className === "전체" || student.className === className;
    const keyword = appState.search.trim();
    const hay = `${student.name} ${student.className} ${student.grade}`;
    const searchMatch = !keyword || hay.includes(keyword);
    return classMatch && searchMatch;
  });
}

function stats() {
  const rows = visibleStudents().map((student) => currentRecords()[student.id]).filter(Boolean);
  return {
    total: visibleStudents().length,
    checked: rows.length,
    present: rows.filter((r) => r.status === "출석").length,
    absent: rows.filter((r) => r.status === "결석").length,
    late: rows.filter((r) => r.status === "지각").length,
  };
}

function monthlySummary() {
  const prefix = appState.selectedDate.slice(0, 7);
  let total = 0;
  let present = 0;
  let absent = 0;
  let late = 0;

  Object.entries(appState.attendanceByDate).forEach(([date, records]) => {
    if (!date.startsWith(prefix)) return;
    visibleStudents().forEach((student) => {
      const row = records[student.id];
      if (!row) return;
      total += 1;
      if (row.status === "출석") present += 1;
      if (row.status === "결석") absent += 1;
      if (row.status === "지각") late += 1;
    });
  });

  return { total, present, absent, late };
}

async function saveAll() {
  appState.isSaving = true;
  appState.saveMessage = "저장 중...";
  render();

  try {
    await setDoc(APP_DOC_REF, {
      students: appState.students,
      attendanceByDate: appState.attendanceByDate,
      updatedAt: new Date().toISOString(),
    });
    appState.isSaving = false;
    appState.saveMessage = "저장 완료";
    render();
  } catch (error) {
    console.error(error);
    appState.isSaving = false;
    appState.saveMessage = "저장 실패";
    render();
    alert("저장에 실패했어요. Firebase 규칙과 Authentication 설정을 다시 확인해 주세요.");
  }
}

function debounceSave() {
  clearTimeout(window.__saveTimer);
  window.__saveTimer = setTimeout(() => {
    saveAll();
  }, 400);
}

function updateAttendance(studentId, patch) {
  const dateKey = appState.selectedDate;
  if (!appState.attendanceByDate[dateKey]) {
    appState.attendanceByDate[dateKey] = {};
  }

  const teacher = currentTeacher();

  appState.attendanceByDate[dateKey][studentId] = {
    studentId,
    status: "출석",
    reason: "",
    memo: "",
    checkedBy: teacher.name,
    checkedAt: new Date().toISOString(),
    ...(appState.attendanceByDate[dateKey][studentId] || {}),
    ...patch,
  };

  render();
  debounceSave();
}

function markAllPresent() {
  visibleStudents().forEach((student) => {
    if (!canEditStudent(student)) return;
    updateAttendance(student.id, { status: "출석" });
  });
}

function addNewFriendFromForm() {
  const name = document.getElementById("new-name").value.trim();
  const className = document.getElementById("new-class").value;
  const grade = document.getElementById("new-grade").value;
  const phone = document.getElementById("new-phone").value.trim();
  const parentPhone = document.getElementById("new-parent-phone").value.trim();
  const inviter = document.getElementById("new-inviter").value.trim();
  const note = document.getElementById("new-note").value.trim();

  if (!name) {
    alert("이름을 입력해 주세요.");
    return;
  }

  appState.students.push({
    id: uid("student"),
    name,
    className,
    grade,
    phone,
    parentPhone,
    inviter,
    note,
    isNew: true,
    registeredAt: todayString(),
  });

  appState.activeTab = "students";
  render();
  saveAll();
}

function deleteStudent(studentId) {
  const ok = confirm("이 학생을 삭제할까요?");
  if (!ok) return;

  appState.students = appState.students.filter((s) => s.id !== studentId);

  Object.keys(appState.attendanceByDate).forEach((dateKey) => {
    if (appState.attendanceByDate[dateKey]?.[studentId]) {
      delete appState.attendanceByDate[dateKey][studentId];
    }
  });

  render();
  saveAll();
}

function toggleSettled(studentId) {
  appState.students = appState.students.map((student) => {
    if (student.id !== studentId) return student;
    return { ...student, isNew: !student.isNew };
  });

  render();
  saveAll();
}

function exportJson() {
  const blob = new Blob(
    [JSON.stringify({ students: appState.students, attendanceByDate: appState.attendanceByDate }, null, 2)],
    { type: "application/json" }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `church-attendance-${appState.selectedDate}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function render() {
  const root = document.getElementById("app");
  const teacher = currentTeacher();
  const className = effectiveClass();
  const rows = visibleStudents();
  const current = currentRecords();
  const s = stats();
  const monthly = monthlySummary();
  const absentees = rows
    .map((student) => ({ student, record: current[student.id] }))
    .filter((item) => item.record?.status === "결석");
  const recentNewFriends = appState.students.filter((s) => s.isNew).slice().reverse().slice(0, 5);

  root.innerHTML = `
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        background: #f8fafc;
        color: #0f172a;
      }
      .wrap {
        max-width: 1280px;
        margin: 0 auto;
        padding: 20px;
      }
      .card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 16px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      }
      .title {
        font-size: 32px;
        font-weight: 800;
        margin: 0 0 8px;
      }
      .muted {
        color: #64748b;
      }
      .toolbar, .grid4, .grid2, .tabbar, .list {
        display: grid;
        gap: 12px;
      }
      .toolbar {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        margin-top: 16px;
      }
      .grid4 {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }
      .grid2 {
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      }
      .tabbar {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      }
      .stat-number {
        font-size: 30px;
        font-weight: 800;
        margin-top: 8px;
      }
      .label {
        font-size: 13px;
        margin-bottom: 6px;
        color: #334155;
      }
      input, select, textarea, button {
        font: inherit;
      }
      input, select, textarea {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        background: white;
      }
      textarea {
        min-height: 100px;
        resize: vertical;
      }
      button {
        padding: 10px 14px;
        border-radius: 10px;
        border: 1px solid #2563eb;
        background: #2563eb;
        color: white;
        cursor: pointer;
        font-weight: 700;
      }
      button.secondary {
        background: white;
        color: #0f172a;
        border-color: #cbd5e1;
      }
      button.tab {
        background: ${"#fff"};
        color: #0f172a;
        border-color: #cbd5e1;
      }
      button.tab.active {
        background: #dbeafe;
        border-color: #2563eb;
      }
      .header-card {
        margin-bottom: 16px;
      }
      .badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 999px;
        background: #eef2ff;
        color: #3730a3;
        font-size: 12px;
        margin-right: 6px;
      }
      .student-row {
        display: grid;
        grid-template-columns: minmax(220px, 1.2fr) minmax(120px, 150px) 1fr 1fr;
        gap: 12px;
        align-items: start;
      }
      .section-title {
        font-size: 24px;
        font-weight: 800;
        margin: 0 0 6px;
      }
      .stack {
        display: grid;
        gap: 12px;
      }
      .actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .split {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
      }
      .small {
        font-size: 12px;
        color: #64748b;
      }
      .notice {
        border: 1px solid #bfdbfe;
        background: #eff6ff;
      }
      .danger {
        color: #b91c1c;
      }
      @media (max-width: 900px) {
        .student-row {
          grid-template-columns: 1fr;
        }
      }
    </style>

    <div class="wrap">
      <div class="card header-card">
        <h1 class="title">중고등부 출석부</h1>
        <div class="muted">여러 선생님이 함께 쓰는 출석 · 결석 · 새친구 등록 앱</div>

        <div class="toolbar">
          <div>
            <div class="label">접속 사용자</div>
            <select id="teacher-select">
              ${TEACHERS.map(t => `
                <option value="${t.id}" ${t.id === appState.selectedTeacherId ? "selected" : ""}>
                  ${escapeHtml(t.name)} · ${escapeHtml(t.role === "admin" ? "전체" : t.className)}
                </option>
              `).join("")}
            </select>
          </div>

          <div>
            <div class="label">날짜</div>
            <input id="date-input" type="date" value="${escapeHtml(appState.selectedDate)}" />
          </div>

          <div>
            <div class="label">반 선택</div>
            <select id="class-select" ${teacher.role === "teacher" ? "disabled" : ""}>
              ${CLASS_LIST.map(c => `
                <option value="${c}" ${c === appState.selectedClass ? "selected" : ""}>${c}</option>
              `).join("")}
            </select>
          </div>

          <div>
            <div class="label">검색</div>
            <input id="search-input" value="${escapeHtml(appState.search)}" placeholder="이름, 반, 학년 검색" />
          </div>
        </div>

        <div style="margin-top:14px;" class="small">
          로그인 상태: ${appState.user ? "연결됨" : "연결 중"} ·
          현재 반: ${escapeHtml(className)} ·
          저장 상태: ${escapeHtml(appState.saveMessage)}
        </div>
      </div>

      <div class="grid4" style="margin-bottom:16px;">
        <div class="card">
          <div class="muted">현재 반 인원</div>
          <div class="stat-number">${s.total}</div>
          <div class="small">선택한 반 / 검색 기준</div>
        </div>
        <div class="card">
          <div class="muted">체크 완료</div>
          <div class="stat-number">${s.checked}</div>
          <div class="small">${s.total ? Math.round((s.checked / s.total) * 100) : 0}% 입력</div>
        </div>
        <div class="card">
          <div class="muted">출석 / 지각</div>
          <div class="stat-number">${s.present} / ${s.late}</div>
          <div class="small">오늘 예배 현황</div>
        </div>
        <div class="card">
          <div class="muted">결석</div>
          <div class="stat-number">${s.absent}</div>
          <div class="small">사유 기록 가능</div>
        </div>
      </div>

      <div class="tabbar" style="margin-bottom:16px;">
        <button class="tab ${appState.activeTab === "attendance" ? "active" : ""}" data-tab="attendance">출석</button>
        <button class="tab ${appState.activeTab === "newfriend" ? "active" : ""}" data-tab="newfriend">새친구</button>
        <button class="tab ${appState.activeTab === "students" ? "active" : ""}" data-tab="students">학생관리</button>
        <button class="tab ${appState.activeTab === "summary" ? "active" : ""}" data-tab="summary">요약</button>
      </div>

      ${
        appState.activeTab === "attendance" ? `
          <div class="stack">
            <div class="card">
              <div class="split">
                <div>
                  <div class="section-title">출석 체크</div>
                  <div class="muted">출석, 결석, 지각을 기록하고 결석 이유를 적을 수 있어요.</div>
                </div>
                <div class="actions">
                  <button id="mark-all-present">현재 목록 전체 출석 처리</button>
                  <button id="export-json" class="secondary">내보내기</button>
                </div>
              </div>

              <div class="list" style="margin-top:16px;">
                ${rows.map(student => {
                  const record = current[student.id] || { status: "출석", reason: "", memo: "" };
                  const editable = canEditStudent(student);

                  return `
                    <div class="card">
                      <div class="student-row">
                        <div>
                          <div style="font-size:20px;font-weight:800;">${escapeHtml(student.name)}</div>
                          <div style="margin-top:8px;">
                            <span class="badge">${escapeHtml(student.className)}</span>
                            <span class="badge">${escapeHtml(student.grade)}</span>
                            ${student.isNew ? `<span class="badge">새친구</span>` : ""}
                          </div>
                          <div class="small" style="margin-top:8px;">
                            ${escapeHtml(student.phone || "학생 연락처 미등록")}
                            ${student.parentPhone ? ` · 보호자 ${escapeHtml(student.parentPhone)}` : ""}
                          </div>
                          ${record.checkedBy ? `<div class="small" style="margin-top:6px;">마지막 입력: ${escapeHtml(record.checkedBy)}</div>` : ""}
                        </div>

                        <div>
                          <div class="label">상태</div>
                          <select data-role="status" data-student-id="${student.id}" ${editable ? "" : "disabled"}>
                            ${STATUS_LIST.map(status => `
                              <option value="${status}" ${record.status === status ? "selected" : ""}>${status}</option>
                            `).join("")}
                          </select>
                        </div>

                        <div>
                          <div class="label">결석 이유</div>
                          <input
                            data-role="reason"
                            data-student-id="${student.id}"
                            value="${escapeHtml(record.reason || "")}"
                            ${editable && record.status === "결석" ? "" : "disabled"}
                            placeholder="예: 학원, 아픔, 가족 일정"
                          />
                        </div>

                        <div>
                          <div class="label">메모</div>
                          <input
                            data-role="memo"
                            data-student-id="${student.id}"
                            value="${escapeHtml(record.memo || "")}"
                            ${editable ? "" : "disabled"}
                            placeholder="추가 메모"
                          />
                        </div>
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>

            <div class="card">
              <div class="section-title">오늘의 결석자</div>
              <div class="muted">결석 이유를 한 번에 확인할 수 있어요.</div>
              <div class="list" style="margin-top:16px;">
                ${
                  absentees.length === 0
                    ? `<div class="small">현재 선택된 조건에서 결석자가 없습니다.</div>`
                    : absentees.map(({ student, record }) => `
                        <div class="card">
                          <div style="font-weight:800;">${escapeHtml(student.name)} · ${escapeHtml(student.className)}</div>
                          <div class="small" style="margin-top:6px;">사유: ${escapeHtml(record.reason || "미기재")}</div>
                          ${record.memo ? `<div class="small" style="margin-top:4px;">메모: ${escapeHtml(record.memo)}</div>` : ""}
                        </div>
                      `).join("")
                }
              </div>
            </div>
          </div>
        ` : ""
      }

      ${
        appState.activeTab === "newfriend" ? `
          <div class="stack">
            <div class="card">
              <div class="section-title">새친구 등록</div>
              <div class="muted">새로 온 학생을 등록하고 반과 학년을 지정할 수 있어요.</div>

              <div class="grid2" style="margin-top:16px;">
                <div>
                  <div class="label">이름</div>
                  <input id="new-name" placeholder="이름" />
                </div>
                <div>
                  <div class="label">반</div>
                  <select id="new-class">
                    ${CLASS_LIST.filter(c => c !== "전체").map(c => `
                      <option value="${c}" ${teacher.role === "teacher" && teacher.className === c ? "selected" : ""}>${c}</option>
                    `).join("")}
                  </select>
                </div>
                <div>
                  <div class="label">학년</div>
                  <select id="new-grade">
                    ${GRADE_LIST.map(g => `<option value="${g}">${g}</option>`).join("")}
                  </select>
                </div>
                <div>
                  <div class="label">학생 연락처</div>
                  <input id="new-phone" placeholder="010-..." />
                </div>
                <div>
                  <div class="label">보호자 연락처</div>
                  <input id="new-parent-phone" placeholder="010-..." />
                </div>
                <div>
                  <div class="label">인도자</div>
                  <input id="new-inviter" placeholder="인도자 이름" />
                </div>
                <div style="grid-column:1 / -1;">
                  <div class="label">비고</div>
                  <textarea id="new-note" placeholder="메모"></textarea>
                </div>
              </div>

              <div style="margin-top:16px;">
                <button id="add-new-friend">새친구 등록하기</button>
              </div>
            </div>

            <div class="card">
              <div class="section-title">최근 새친구</div>
              <div class="list" style="margin-top:16px;">
                ${
                  recentNewFriends.length === 0
                    ? `<div class="small">현재 새친구 표시된 학생이 없습니다.</div>`
                    : recentNewFriends.map(student => `
                        <div class="card">
                          <div class="split">
                            <div>
                              <div style="font-weight:800;">${escapeHtml(student.name)} · ${escapeHtml(student.className)} · ${escapeHtml(student.grade)}</div>
                              <div class="small" style="margin-top:6px;">
                                등록일 ${escapeHtml(student.registeredAt || "-")}
                                ${student.inviter ? ` · 인도자 ${escapeHtml(student.inviter)}` : ""}
                              </div>
                            </div>
                            <div>
                              <button class="secondary" data-role="toggle-new" data-student-id="${student.id}">
                                ${student.isNew ? "정착 완료 처리" : "새친구로 다시 표시"}
                              </button>
                            </div>
                          </div>
                        </div>
                      `).join("")
                }
              </div>
            </div>
          </div>
        ` : ""
      }

      ${
        appState.activeTab === "students" ? `
          <div class="card">
            <div class="section-title">학생 관리</div>
            <div class="muted">학생 목록과 연락처를 확인할 수 있어요.</div>

            <div class="list" style="margin-top:16px;">
              ${
                appState.students
                  .filter(student => teacher.role === "admin" || student.className === teacher.className)
                  .map(student => `
                    <div class="card">
                      <div class="split">
                        <div>
                          <div style="font-weight:800;font-size:18px;">${escapeHtml(student.name)}</div>
                          <div style="margin-top:8px;">
                            <span class="badge">${escapeHtml(student.className)}</span>
                            <span class="badge">${escapeHtml(student.grade)}</span>
                            ${student.isNew ? `<span class="badge">새친구</span>` : ""}
                          </div>
                          <div class="small" style="margin-top:8px;">
                            학생 ${escapeHtml(student.phone || "-")} · 보호자 ${escapeHtml(student.parentPhone || "-")}
                          </div>
                          ${student.note ? `<div class="small" style="margin-top:4px;">비고: ${escapeHtml(student.note)}</div>` : ""}
                        </div>
                        <div class="actions">
                          ${teacher.role === "admin" ? `<button class="secondary" data-role="delete-student" data-student-id="${student.id}">삭제</button>` : ""}
                        </div>
                      </div>
                    </div>
                  `).join("")
              }
            </div>
          </div>
        ` : ""
      }

      ${
        appState.activeTab === "summary" ? `
          <div class="grid2">
            <div class="card">
              <div class="section-title">월간 요약</div>
              <div class="muted">${escapeHtml(appState.selectedDate.slice(0, 7))} 기준</div>

              <div class="list" style="margin-top:16px;">
                <div class="card split"><span>총 체크 수</span><strong>${monthly.total}</strong></div>
                <div class="card split"><span>출석</span><strong>${monthly.present}</strong></div>
                <div class="card split"><span>지각</span><strong>${monthly.late}</strong></div>
                <div class="card split"><span>결석</span><strong>${monthly.absent}</strong></div>
              </div>
            </div>

            <div class="card notice">
              <div class="section-title">현재 앱 상태</div>
              <div class="muted">
                이 앱은 Firebase에 저장돼서 여러 선생님이 같은 주소로 접속하면 같은 데이터를 보게 됩니다.
                저장이 안 되면 Firestore 규칙과 Anonymous 인증을 다시 확인해 주세요.
              </div>
            </div>
          </div>
        ` : ""
      }
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  document.getElementById("teacher-select")?.addEventListener("change", (e) => {
    appState.selectedTeacherId = e.target.value;
    const teacher = currentTeacher();
    if (teacher.role === "teacher") {
      appState.selectedClass = teacher.className;
    }
    render();
  });

  document.getElementById("date-input")?.addEventListener("change", (e) => {
    appState.selectedDate = e.target.value;
    render();
  });

  document.getElementById("class-select")?.addEventListener("change", (e) => {
    appState.selectedClass = e.target.value;
    render();
  });

  document.getElementById("search-input")?.addEventListener("input", (e) => {
    appState.search = e.target.value;
    render();
  });

  document.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      appState.activeTab = btn.dataset.tab;
      render();
    });
  });

  document.getElementById("mark-all-present")?.addEventListener("click", markAllPresent);
  document.getElementById("export-json")?.addEventListener("click", exportJson);
  document.getElementById("add-new-friend")?.addEventListener("click", addNewFriendFromForm);

  document.querySelectorAll("[data-role='status']").forEach((el) => {
    el.addEventListener("change", (e) => {
      updateAttendance(e.target.dataset.studentId, { status: e.target.value });
    });
  });

  document.querySelectorAll("[data-role='reason']").forEach((el) => {
    el.addEventListener("input", (e) => {
      updateAttendance(e.target.dataset.studentId, { reason: e.target.value });
    });
  });

  document.querySelectorAll("[data-role='memo']").forEach((el) => {
    el.addEventListener("input", (e) => {
      updateAttendance(e.target.dataset.studentId, { memo: e.target.value });
    });
  });

  document.querySelectorAll("[data-role='delete-student']").forEach((el) => {
    el.addEventListener("click", () => {
      deleteStudent(el.dataset.studentId);
    });
  });

  document.querySelectorAll("[data-role='toggle-new']").forEach((el) => {
    el.addEventListener("click", () => {
      toggleSettled(el.dataset.studentId);
    });
  });
}

async function bootstrap() {
  document.getElementById("app").innerHTML = `
    <div style="font-family:Arial,sans-serif;padding:24px;">
      Firebase 연결 중...
    </div>
  `;

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      await signInAnonymously(auth);
      return;
    }

    appState.user = user;

    const snapshot = await getDoc(APP_DOC_REF);

    if (!snapshot.exists()) {
      await setDoc(APP_DOC_REF, {
        students: DEFAULT_STUDENTS,
        attendanceByDate: {},
        updatedAt: new Date().toISOString(),
      });
    }

    onSnapshot(APP_DOC_REF, (docSnap) => {
      const data = docSnap.data();
      appState.students = Array.isArray(data?.students) ? data.students : DEFAULT_STUDENTS;
      appState.attendanceByDate = data?.attendanceByDate || {};
      appState.isReady = true;
      appState.saveMessage = "동기화 완료";
      render();
    });
  });
}

document.getElementById("app").innerHTML = `<div style="font-family:Arial,sans-serif;padding:24px;">앱 시작 중...</div>`;
bootstrap();
