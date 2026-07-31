const https = require('https');

function httpReq(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: method,
      headers: body ? { 'Content-Type': 'application/json' } : {}
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data || '{}')));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  const uid = 'gjtP7IkTy2bC3LMD6Z2BAX7lcah2';
  const now = new Date();
  console.log("Current time:", now.toISOString());

  const meets = await httpReq(`https://omnisync-64ec6-default-rtdb.firebaseio.com/users/${uid}/meets.json`);
  console.log("Meets retrieved:", Object.keys(meets).length);

  for (const k of Object.keys(meets)) {
    const m = meets[k];
    if (m && m.startDate && !m.reminderTriggered) {
      const meetTime = new Date(`${m.startDate}+05:30`);
      console.log(`Checking "${m.title}" -> Scheduled: ${meetTime.toISOString()} | Now: ${now.toISOString()}`);
      
      if (now >= meetTime) {
        const payload = {
          title: `Google Meet Starting: ${m.title}`,
          message: `Your meeting "${m.title}" is scheduled now!`,
          type: "Google Meet",
          link: m.link || "",
          notes: m.notes || ""
        };

        console.log("Pushing pending notification payload to Firebase...");
        await httpReq(`https://omnisync-64ec6-default-rtdb.firebaseio.com/users/${uid}/pending_notifications.json`, 'POST', payload);
        await httpReq(`https://omnisync-64ec6-default-rtdb.firebaseio.com/users/${uid}/meets/${k}.json`, 'PATCH', { reminderTriggered: true });
        console.log(`SUCCESS! Notification pushed for meet "${m.title}".`);
      }
    }
  }
})();
