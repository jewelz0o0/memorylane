(() => {
  const config = window.MLY_CALENDAR;
  if (!config) return;

  const { recurringClass: cls, googleCalendarId } = config;
  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  let viewDate = new Date();
  viewDate.setDate(1);

  const pad = (n) => String(n).padStart(2, "0");

  const formatIcsDateLocal = (date) =>
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;

  const nextClassDate = (from = new Date()) => {
    const cursor = new Date(from);
    const candidate = new Date(cursor);
    candidate.setHours(cls.hour, cls.minute, 0, 0);

    const daysUntil = (cls.dayOfWeek - candidate.getDay() + 7) % 7;
    candidate.setDate(candidate.getDate() + daysUntil);

    if (candidate <= from) {
      candidate.setDate(candidate.getDate() + 7);
    }

    return candidate;
  };

  const classEndDate = (start) => {
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + cls.durationMinutes);
    return end;
  };

  const googleAddUrl = () => {
    const start = nextClassDate();
    const end = classEndDate(start);
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: cls.title,
      dates: `${formatIcsDateLocal(start)}/${formatIcsDateLocal(end)}`,
      details: cls.description,
      location: cls.location,
      recur: "RRULE:FREQ=WEEKLY;BYDAY=FR",
      ctz: cls.timezone,
    });
    return `https://calendar.google.com/calendar/render?${params}`;
  };

  const googleSubscribeUrl = () => {
    if (!googleCalendarId) return "";
    return `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(googleCalendarId)}`;
  };

  const icsSubscribeUrl = () => {
    if (!googleCalendarId) return "";
    return `webcal://calendar.google.com/calendar/ical/${encodeURIComponent(googleCalendarId)}/public/basic.ics`;
  };

  const buildIcs = () => {
    const start = nextClassDate();
    const end = classEndDate(start);
    const uid = `memory-lane-yoga-${start.getTime()}@memorylaneyoga.com`;
    const now = new Date();

    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Memory Lane Yoga//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${formatIcsDateLocal(now)}`,
      `DTSTART;TZID=${cls.timezone}:${formatIcsDateLocal(start)}`,
      `DTEND;TZID=${cls.timezone}:${formatIcsDateLocal(end)}`,
      `SUMMARY:${cls.title}`,
      `DESCRIPTION:${cls.description.replace(/\n/g, "\\n")}`,
      `LOCATION:${cls.location}`,
      "RRULE:FREQ=WEEKLY;BYDAY=FR",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
  };

  const downloadIcs = () => {
    const blob = new Blob([buildIcs()], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "memory-lane-yoga.ics";
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderMonth = () => {
    const grid = document.getElementById("calendar-grid");
    const label = document.getElementById("calendar-month-label");
    if (!grid || !label) return;

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    label.textContent = `${MONTHS[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    grid.innerHTML = "";

    WEEKDAYS.forEach((name) => {
      const head = document.createElement("div");
      head.className = "calendar__weekday";
      head.textContent = name;
      grid.appendChild(head);
    });

    for (let i = 0; i < firstDay; i += 1) {
      const empty = document.createElement("div");
      empty.className = "calendar__day calendar__day--empty";
      empty.setAttribute("aria-hidden", "true");
      grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const cellDate = new Date(year, month, day);
      const cell = document.createElement("div");
      cell.className = "calendar__day";
      cell.textContent = String(day);

      if (cellDate.getTime() === today.getTime()) {
        cell.classList.add("calendar__day--today");
      }

      grid.appendChild(cell);
    }
  };

  const renderEmbed = () => {
    const embed = document.getElementById("calendar-embed");
    const subscribeBlock = document.getElementById("calendar-subscribe");
    if (!embed || !subscribeBlock) return;

    if (googleCalendarId) {
      embed.hidden = false;
      embed.innerHTML = `<iframe
        title="Memory Lane Yoga Google Calendar"
        src="https://calendar.google.com/calendar/embed?src=${encodeURIComponent(googleCalendarId)}&ctz=${encodeURIComponent(cls.timezone)}&mode=AGENDA"
        loading="lazy"
      ></iframe>`;
      subscribeBlock.hidden = false;
    } else {
      embed.hidden = true;
      subscribeBlock.hidden = true;
    }
  };

  const renderSyncLinks = (container) => {
    if (!container) return;

    const subscribeUrl = googleSubscribeUrl();
    const icsUrl = icsSubscribeUrl();

    const hasLiveCalendar = Boolean(subscribeUrl);

    container.innerHTML = `
      <p class="calendar-sync__lede">${
        hasLiveCalendar
          ? "Subscribe to the Memory Lane Yoga calendar for when and where each class meets."
          : "Add weekly classes to your calendar."
      }</p>
      <div class="calendar-sync__actions">
        ${
          subscribeUrl
            ? `<a class="btn btn--calendar" href="${subscribeUrl}" target="_blank" rel="noopener noreferrer">Subscribe to Google Calendar</a>`
            : ""
        }
        ${
          icsUrl
            ? `<a class="btn btn--calendar btn--calendar-outline" href="${icsUrl}">Subscribe in Apple / Outlook</a>`
            : ""
        }
        ${
          !hasLiveCalendar
            ? `<a class="btn btn--calendar btn--calendar-outline" href="${googleAddUrl()}" target="_blank" rel="noopener noreferrer">Add to Google Calendar</a>
               <button type="button" class="btn btn--calendar btn--calendar-outline" id="calendar-download-ics">Download calendar file</button>`
            : ""
        }
      </div>
    `;

    container.querySelector("#calendar-download-ics")?.addEventListener("click", downloadIcs);
  };

  document.getElementById("calendar-prev")?.addEventListener("click", () => {
    viewDate.setMonth(viewDate.getMonth() - 1);
    renderMonth();
  });

  document.getElementById("calendar-next")?.addEventListener("click", () => {
    viewDate.setMonth(viewDate.getMonth() + 1);
    renderMonth();
  });

  renderMonth();
  renderEmbed();
  renderSyncLinks(document.getElementById("calendar-sync"));
  renderSyncLinks(document.getElementById("calendar-sync-signup"));

  window.MLY_showCalendarSync = () => {
    const signupSync = document.getElementById("calendar-sync-signup");
    if (signupSync) signupSync.hidden = false;
  };
})();
