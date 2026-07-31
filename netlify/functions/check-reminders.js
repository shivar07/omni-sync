const parseScheduledDate = (dateStr) => {
  if (!dateStr) return null;
  if (typeof dateStr !== 'string') return new Date(dateStr);
  if (dateStr.endsWith('Z') || dateStr.includes('+') || (dateStr.includes('-') && dateStr.length > 19)) {
    return new Date(dateStr);
  }
  return new Date(`${dateStr}+05:30`);
};

export default async (req, context) => {
  const usersUrl = "https://guru-201bf-default-rtdb.firebaseio.com/users.json";

  try {
    const response = await fetch(usersUrl);
    if (!response.ok) {
      return new Response(`Failed to fetch users database: ${response.statusText}`, { status: 500 });
    }

    const usersData = await response.json();
    if (!usersData) {
      return new Response("No users found in database.", { status: 200 });
    }

    const now = new Date();
    const triggeredAlerts = [];

    // Loop through each user ID
    for (const uid of Object.keys(usersData)) {
      const userData = usersData[uid];
      if (!userData) continue;

      // 1. Check Applications
      if (userData.applications) {
        const appsList = Array.isArray(userData.applications)
          ? userData.applications.map((val, idx) => val ? { ...val, key: idx.toString() } : null).filter(x => x !== null)
          : Object.keys(userData.applications).map(key => ({ ...userData.applications[key], key }));

        for (const app of appsList) {
          if (app.reminderDate && !app.reminderTriggered) {
            const reminderTime = parseScheduledDate(app.reminderDate);
            if (reminderTime && now >= reminderTime) {
              const payload = {
                title: `OmniSync Application Reminder`,
                message: `Your reminder for "${app.title}" is due now!`,
                type: "Application",
                link: app.link || "",
                notes: app.notes || ""
              };
              if (await sendAlert(uid, payload)) {
                await markTriggered(uid, `applications/${app.key}`);
                triggeredAlerts.push(`[App] ${app.title}`);
              }
            }
          }
        }
      }

      // 2. Check Google Meets
      if (userData.meets) {
        const meetsList = Array.isArray(userData.meets)
          ? userData.meets.map((val, idx) => val ? { ...val, key: idx.toString() } : null).filter(x => x !== null)
          : Object.keys(userData.meets).map(key => ({ ...userData.meets[key], key }));

        for (const meet of meetsList) {
          if (meet.startDate && !meet.reminderTriggered) {
            const meetTime = parseScheduledDate(meet.startDate);
            if (meetTime && now >= meetTime) {
              const payload = {
                title: `Google Meet Starting: ${meet.title}`,
                message: `Your meeting "${meet.title}" is scheduled now!`,
                type: "Google Meet",
                link: meet.link || "",
                notes: meet.notes || ""
              };
              if (await sendAlert(uid, payload)) {
                await markTriggered(uid, `meets/${meet.key}`);
                triggeredAlerts.push(`[Google Meet] ${meet.title}`);
              }
            }
          }
        }
      }

      // 3. Check General Meets & Events
      if (userData.generalMeets) {
        const genMeetsList = Array.isArray(userData.generalMeets)
          ? userData.generalMeets.map((val, idx) => val ? { ...val, key: idx.toString() } : null).filter(x => x !== null)
          : Object.keys(userData.generalMeets).map(key => ({ ...userData.generalMeets[key], key }));

        for (const meet of genMeetsList) {
          if (meet.startDate && !meet.reminderTriggered) {
            const meetTime = parseScheduledDate(meet.startDate);
            if (meetTime && now >= meetTime) {
              const payload = {
                title: `Event Starting: ${meet.title}`,
                message: `Your event "${meet.title}" is scheduled now!`,
                type: "General Meet",
                link: meet.link || "",
                notes: meet.notes || ""
              };
              if (await sendAlert(uid, payload)) {
                await markTriggered(uid, `generalMeets/${meet.key}`);
                triggeredAlerts.push(`[General Event] ${meet.title}`);
              }
            }
          }
        }
      }

      // 4. Check Calendar Events
      if (userData.calendar) {
        const eventsList = Array.isArray(userData.calendar)
          ? userData.calendar.map((val, idx) => val ? { ...val, key: idx.toString() } : null).filter(x => x !== null)
          : Object.keys(userData.calendar).map(key => ({ ...userData.calendar[key], key }));

        for (const evt of eventsList) {
          if (evt.startDate && !evt.reminderTriggered) {
            const eventTime = parseScheduledDate(evt.startDate);
            if (eventTime && now >= eventTime) {
              const payload = {
                title: `Calendar Event: ${evt.title}`,
                message: `Event "${evt.title}" is starting now!`,
                type: "Calendar Event",
                link: evt.link || "",
                notes: evt.notes || ""
              };
              if (await sendAlert(uid, payload)) {
                await markTriggered(uid, `calendar/${evt.key}`);
                triggeredAlerts.push(`[Calendar] ${evt.title}`);
              }
            }
          }
        }
      }

      // 5. Check Pending Work Tasks
      if (userData.pending) {
        const pendingList = Array.isArray(userData.pending)
          ? userData.pending.map((val, idx) => val ? { ...val, key: idx.toString() } : null).filter(x => x !== null)
          : Object.keys(userData.pending).map(key => ({ ...userData.pending[key], key }));

        for (const task of pendingList) {
          const taskDate = task.dueDate || task.deadline;
          if (taskDate && !task.reminderTriggered && task.status !== 'Completed') {
            const taskTime = parseScheduledDate(taskDate.includes('T') ? taskDate : `${taskDate}T09:00`);
            if (taskTime && now >= taskTime) {
              const payload = {
                title: `Pending Task Due: ${task.title}`,
                message: `Don't forget to complete "${task.title}"!`,
                type: "Pending Task",
                link: task.link || "",
                notes: task.notes || ""
              };
              if (await sendAlert(uid, payload)) {
                await markTriggered(uid, `pending/${task.key}`);
                triggeredAlerts.push(`[Pending] ${task.title}`);
              }
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({
      message: "Check completed.",
      triggered: triggeredAlerts
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

async function sendAlert(uid, payload) {
  const pendingUrl = `https://guru-201bf-default-rtdb.firebaseio.com/users/${uid}/pending_notifications.json`;
  const res = await fetch(pendingUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.ok;
}

async function markTriggered(uid, itemPath) {
  const patchUrl = `https://guru-201bf-default-rtdb.firebaseio.com/users/${uid}/${itemPath}.json`;
  await fetch(patchUrl, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reminderTriggered: true })
  });
}

export const config = {
  schedule: "*/15 * * * *"
};
