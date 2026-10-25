// URL'den book ID'yi al
const bookId = new URLSearchParams(window.location.search).get('id');

// -------------------------
// TAKVİM TOGGLE (header tıklanınca)
// -------------------------
let calendarOpen = false;

function toggleCalendarDays() {
  calendarOpen = !calendarOpen;
  const days     = document.getElementById('calendar-days');
  const weekdays = document.getElementById('cal-weekdays');
  const chevron  = document.getElementById('cal-chevron');
  const card     = document.getElementById('calendar-card');

  days.style.display     = calendarOpen ? 'grid' : 'none';
  weekdays.style.display = calendarOpen ? 'grid' : 'none';
  chevron.style.transform = calendarOpen ? 'rotate(180deg)' : 'rotate(0deg)';
  card.classList.toggle('active', calendarOpen);

  if (calendarOpen) renderCalendar();
}

// Kapak renkleri (browse-books ile aynı)
const COVER_COLORS = [
  'cover-red','cover-navy','cover-green','cover-teal',
  'cover-orange','cover-purple','cover-crimson','cover-dark'
];

// Meşgul tarih aralıkları (API'den gelecek)
let occupiedRanges = [];

// Seçilen tarihler
let selectedStart = null;
let selectedEnd   = null;

// Takvim için aktif ay/yıl
let calYear  = new Date().getFullYear();
let calMonth = new Date().getMonth(); // 0-indexed

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

// -------------------------
// SAYFA YÜKLENINCE
// -------------------------
document.addEventListener('DOMContentLoaded', async () => {
  if (!bookId) {
    document.getElementById('book-title').textContent = 'Book not found.';
    return;
  }

  try {
    // Kitap bilgisini çek
    const book = await api.getBookById(bookId);
    renderBookInfo(book);

    // Müsaitlik bilgisini çek (meşgul tarih aralıkları)
    const avail = await apiFetch(`/books/${bookId}/availability`);
    occupiedRanges = avail.occupiedDateRanges || [];

    renderCalendar();

  } catch (err) {
    document.getElementById('book-title').textContent = 'Yüklenemedi: ' + err.message;
  }
});

// -------------------------
// KİTAP BİLGİSİNİ DOLDUR
// -------------------------
function renderBookInfo(book) {
  const author = book.author?.name || 'Unknown Author';
  const birthYear = book.author?.birthYear ? ` · d. ${book.author.birthYear}` : '';
  const isAvailable = !book.borrowedBy;

  // Kapak: random renk yerine title hash'i ile belirli renk
  const colorIndex = book.title.length % COVER_COLORS.length;
  const cover = document.getElementById('book-cover');
  cover.className = `detail-cover ${COVER_COLORS[colorIndex]}`;

  document.getElementById('cover-title').textContent  = book.title;
  document.getElementById('cover-author').textContent = author;
  document.getElementById('book-title').textContent   = book.title;
  document.getElementById('book-subtitle').textContent = `${author}${birthYear}`;
  document.getElementById('book-author').textContent  = author;

  const statusEl = document.getElementById('book-status');
  if (isAvailable) {
    statusEl.textContent = 'In shelf, available';
    statusEl.className   = 'detail-meta-value available';
  } else {
    statusEl.textContent = 'Currently borrowed';
    statusEl.className   = 'detail-meta-value borrowed';
  }

  document.title = `${book.title} — CityLibrary`;
}

// -------------------------
// TAKVİM RENDER
// -------------------------
function renderCalendar() {
  document.getElementById('calendar-month-label').textContent =
    `${MONTHS[calMonth]} ${calYear}`;

  const days      = document.getElementById('calendar-days');
  const today     = new Date();
  today.setHours(0,0,0,0);

  // Ayın ilk günü hangi haftanın günü (Pazartesi=0 bazlı)
  const firstDay = new Date(calYear, calMonth, 1);
  let startOffset = firstDay.getDay() - 1; // Pzt bazlı
  if (startOffset < 0) startOffset = 6;

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  let html = '';

  // Boş hücreler
  for (let i = 0; i < startOffset; i++) {
    html += `<button class="cal-day empty" disabled></button>`;
  }

  // Günler
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(calYear, calMonth, d);
    date.setHours(0,0,0,0);

    const isPast     = date < today;
    const isOccupied = isDateOccupied(date);
    const isSelected = isDateSelected(date);
    const isInRange  = isDateInRange(date);

    let cls = 'cal-day';
    if (isPast)     cls += ' past';
    if (isOccupied) cls += ' occupied';
    if (isSelected) cls += ' selected';
    if (isInRange)  cls += ' in-range';

    const disabled = isPast || isOccupied;

    html += `<button class="${cls}" ${disabled ? 'disabled' : ''} onclick="selectDay(${calYear},${calMonth},${d})">${d}</button>`;
  }

  days.innerHTML = html;
}

// Tarih meşgul mu?
function isDateOccupied(date) {
  return occupiedRanges.some(range => {
    const start = new Date(range.requestedStartDate);
    const end   = new Date(range.endDate);
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);
    return date >= start && date <= end;
  });
}

// Tarih seçili mi?
function isDateSelected(date) {
  const t = date.getTime();
  return (selectedStart && selectedStart.getTime() === t) ||
         (selectedEnd   && selectedEnd.getTime()   === t);
}

// Tarih seçim aralığında mı?
function isDateInRange(date) {
  if (!selectedStart || !selectedEnd) return false;
  return date > selectedStart && date < selectedEnd;
}

// -------------------------
// GÜN SEÇİMİ
// İlk tıklama: başlangıç, ikinci tıklama: bitiş
// -------------------------
function selectDay(y, m, d) {
  const clicked = new Date(y, m, d);
  clicked.setHours(0,0,0,0);

  if (!selectedStart || (selectedStart && selectedEnd)) {
    // Yeni seçim başlat
    selectedStart = clicked;
    selectedEnd   = null;
    document.getElementById('selection-info').textContent = 'Now select an end date';
    document.getElementById('create-loan-btn').disabled = true;
  } else {
    if (clicked <= selectedStart) {
      selectedStart = clicked;
      selectedEnd   = null;
      document.getElementById('selection-info').textContent = 'Now select an end date';
    } else if (rangeHasOccupied(selectedStart, clicked)) {
      document.getElementById('selection-info').textContent = '⚠️ Selected range contains occupied dates.';
      return;
    } else {
      selectedEnd = clicked;
      const s = formatDate(selectedStart);
      const e = formatDate(selectedEnd);
      document.getElementById('selection-info').textContent = `${s} → ${e}`;
      document.getElementById('create-loan-btn').disabled = false;
    }
  }

  renderCalendar();
}

// Aralıkta meşgul gün var mı?
function rangeHasOccupied(start, end) {
  let cur = new Date(start);
  cur.setDate(cur.getDate() + 1);
  while (cur < end) {
    if (isDateOccupied(cur)) return true;
    cur.setDate(cur.getDate() + 1);
  }
  return false;
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { day:'numeric', month:'long', year:'numeric' });
}

// -------------------------
// AY GEZİNME
// -------------------------
function prevMonth() {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
}

function nextMonth() {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar();
}

// -------------------------
// LOAN OLUŞTUR
// -------------------------
async function createLoan() {
  const user = getUser();
  if (!user) { window.location.href = '/auth.html'; return; }

  const btn = document.getElementById('create-loan-btn');
  btn.disabled = true;
  btn.textContent = 'Creating...';

  try {
    await api.createLoan(user.id, bookId, selectedStart.toISOString(), selectedEnd.toISOString());
    document.getElementById('selection-info').textContent = '✅ Loan created successfully!';
    btn.textContent = 'Loan Created';
  } catch (err) {
    document.getElementById('selection-info').textContent = '❌ ' + err.message;
    btn.disabled = false;
    btn.textContent = 'Create Loan';
  }
}

