// Calendar View State
let calCurrentDate = new Date();

// Render Month Calendar Grid
function renderCalendar() {
  const gridCells = document.getElementById('calendar-grid-cells');
  const titleDisplay = document.getElementById('calendar-title');
  if (!gridCells || !titleDisplay) return;

  gridCells.innerHTML = '';
  
  const year = calCurrentDate.getFullYear();
  const month = calCurrentDate.getMonth();

  // Set Month Title
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  titleDisplay.textContent = `${monthNames[month]} ${year}`;

  // Calendar generation parameters
  const firstDayIndex = new Date(year, month, 1).getDay(); // Day of week 1st falls on
  const totalDays = new Date(year, month + 1, 0).getDate(); // Days in this month
  const prevMonthTotalDays = new Date(year, month, 0).getDate(); // Days in previous month

  const today = new Date();
  
  // Total cells to output in calendar grid (6 rows of 7 days = 42 cells)
  const totalCells = 42;

  let cellHTML = '';

  // 1. Render Previous Month's Ending Days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i;
    const cellDate = new Date(year, month - 1, dayNum);
    cellHTML += generateDayCellHTML(cellDate, true);
  }

  // 2. Render Current Month's Days
  for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
    const cellDate = new Date(year, month, dayNum);
    const isToday = cellDate.getDate() === today.getDate() &&
                    cellDate.getMonth() === today.getMonth() &&
                    cellDate.getFullYear() === today.getFullYear();
    
    cellHTML += generateDayCellHTML(cellDate, false, isToday);
  }

  // 3. Render Next Month's Beginning Days to Fill Grid
  const remainingCells = totalCells - (firstDayIndex + totalDays);
  for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
    const cellDate = new Date(year, month + 1, dayNum);
    cellHTML += generateDayCellHTML(cellDate, true);
  }

  gridCells.innerHTML = cellHTML;
  safeCreateIcons();
}

// Generate calendar cell HTML structure
function generateDayCellHTML(dateObj, isOtherMonth, isToday = false) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  const dateStr = `${y}-${m}-${d}`;
  const dayNum = dateObj.getDate();
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();

  // Find tasks corresponding to this date
  const dayTasks = tasks.filter(t => t.deadline && t.deadline.startsWith(dateStr));
  
  // Render task pills
  let eventPillsHTML = '';
  if (dayTasks.length > 0) {
    dayTasks.forEach(t => {
      let pillClass = 'event-safe';
      
      if (t.status === 'completed') {
        pillClass = 'event-completed';
      } else {
        const diff = new Date(t.deadline) - new Date();
        const hours = diff / (1000 * 60 * 60);
        if (hours < 0) {
          pillClass = 'event-critical'; // Overdue
        } else if (hours < 6) {
          pillClass = 'event-critical'; // Highly urgent
        } else if (hours < 24) {
          pillClass = 'event-warning'; // Warning
        }
      }

      const timeFormatted = new Date(t.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      eventPillsHTML += `
        <div class="calendar-event-pill ${pillClass}" title="${t.title} (${t.category})">
          ${timeFormatted} ${t.title}
        </div>
      `;
    });
  }

  return `
    <div class="calendar-day-cell ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}" 
         onclick="handleCalendarDayClick('${dateStr}')">
      <div class="calendar-day-num-row">
        <span class="calendar-day-number">${dayNum}</span>
      </div>
      <div class="calendar-cell-events">
        ${eventPillsHTML}
      </div>
    </div>
  `;
}

// Navigation
function changeMonth(direction) {
  calCurrentDate.setMonth(calCurrentDate.getMonth() + direction);
  renderCalendar();
}

// Click calendar day: Open task modal and pre-fill selected date
function handleCalendarDayClick(dateStr) {
  openTaskModal();
  
  // Pre-fill date input with the selected date (keeping current system hour/min)
  const now = new Date();
  const hrs = now.getHours().toString().padStart(2, '0');
  const mins = now.getMinutes().toString().padStart(2, '0');
  
  const formattedVal = `${dateStr}T${hrs}:${mins}`;
  document.getElementById('task-deadline-input').value = formattedVal;
}
