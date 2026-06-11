const CALENDAR_ID =
  "aadc50edaf0dfa5c2f2436d253a3e869f807fd0f843db8f519bf6b29379ed24b@group.calendar.google.com";

const ICS_URL = `https://calendar.google.com/calendar/ical/${encodeURIComponent(CALENDAR_ID)}/public/full.ics`;

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const { pathname } = new URL(event.request.url);
  if (pathname !== "/calendar-feed.ics") return;

  event.respondWith(
    fetch(ICS_URL, { cache: "no-cache" }).then((response) => {
      if (!response.ok) {
        throw new Error("Google Calendar feed unavailable");
      }
      return new Response(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "text/calendar; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    })
  );
});
