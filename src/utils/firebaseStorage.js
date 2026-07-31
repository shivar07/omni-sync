import { ref, onValue, set, push } from 'firebase/database';
import { db } from '../firebase';

/**
 * Real-time listener for Firebase node (e.g. 'calendar', 'pending', 'ideas', etc.)
 */
export const subscribeToFirebaseNode = (nodeName, callback) => {
  const nodeRef = ref(db, nodeName);
  return onValue(nodeRef, (snapshot) => {
    const val = snapshot.val();
    if (val === null || val === undefined) {
      callback([]);
    } else if (Array.isArray(val)) {
      callback(val.filter(Boolean));
    } else if (typeof val === 'object') {
      callback(Object.values(val));
    } else {
      callback([]);
    }
  }, (error) => {
    console.error(`Firebase Realtime Database error on [${nodeName}]:`, error);
  });
};

/**
 * Save array of objects under clean node name (e.g. 'calendar', 'pending', 'ideas', 'categories', 'pendingCategories')
 */
export const saveToFirebaseNode = async (nodeName, dataArray) => {
  try {
    const nodeRef = ref(db, nodeName);
    // Sanitize data array to avoid undefined values
    const cleanData = JSON.parse(JSON.stringify(dataArray || []));
    await set(nodeRef, cleanData);
  } catch (error) {
    console.error(`Failed to save to Firebase node [${nodeName}]:`, error);
  }
};

/**
 * Push test notification payload directly to pending_notifications node
 */
export const pushNotificationToFirebase = async (titleOrPayload, messageArg = "", typeArg = "", linkArg = "", notesArg = "") => {
  try {
    let payload = {};
    if (typeof titleOrPayload === 'object' && titleOrPayload !== null) {
      payload = {
        title: titleOrPayload.title || "OmniSync Alert",
        message: titleOrPayload.message || "",
        type: titleOrPayload.type || "",
        link: titleOrPayload.link || "",
        notes: titleOrPayload.notes || "",
        createdAt: new Date().toISOString()
      };
    } else {
      payload = {
        title: titleOrPayload || "OmniSync Alert",
        message: messageArg || "",
        type: typeArg || "",
        link: linkArg || "",
        notes: notesArg || "",
        createdAt: new Date().toISOString()
      };
    }

    const nodeRef = ref(db, 'pending_notifications');
    await push(nodeRef, payload);
  } catch (error) {
    console.error('Failed to push notification:', error);
    throw error;
  }
};

/**
 * Scoped subscriber for `/users/{uid}/{nodeName}`
 */
export const subscribeToUserNode = (uid, nodeName, callback) => {
  const nodeRef = ref(db, `users/${uid}/${nodeName}`);
  return onValue(nodeRef, (snapshot) => {
    const val = snapshot.val();
    if (val === null || val === undefined) {
      callback([]);
    } else if (Array.isArray(val)) {
      callback(val.filter(Boolean));
    } else if (typeof val === 'object') {
      callback(Object.values(val));
    } else {
      callback([]);
    }
  }, (error) => {
    console.error(`Firebase error on [users/${uid}/${nodeName}]:`, error);
  });
};

/**
 * Scoped saver for `/users/{uid}/{nodeName}`
 */
export const saveToUserNode = async (uid, nodeName, dataArray) => {
  try {
    const nodeRef = ref(db, `users/${uid}/${nodeName}`);
    const cleanData = JSON.parse(JSON.stringify(dataArray || []));
    await set(nodeRef, cleanData);
  } catch (error) {
    console.error(`Failed to save to users/${uid}/${nodeName}:`, error);
  }
};

/**
 * Push notification payload directly to `/users/{uid}/pending_notifications`
 */
export const pushNotificationToUserFirebase = async (uid, titleOrPayload, messageArg = "", typeArg = "", linkArg = "", notesArg = "") => {
  try {
    let payload = {};
    if (typeof titleOrPayload === 'object' && titleOrPayload !== null) {
      payload = {
        title: titleOrPayload.title || "OmniSync Alert",
        message: titleOrPayload.message || "",
        type: titleOrPayload.type || "",
        link: titleOrPayload.link || "",
        notes: titleOrPayload.notes || "",
        createdAt: new Date().toISOString()
      };
    } else {
      payload = {
        title: titleOrPayload || "OmniSync Alert",
        message: messageArg || "",
        type: typeArg || "",
        link: linkArg || "",
        notes: notesArg || "",
        createdAt: new Date().toISOString()
      };
    }

    const nodeRef = ref(db, `users/${uid}/pending_notifications`);
    await push(nodeRef, payload);
  } catch (error) {
    console.error(`Failed to push notification for user ${uid}:`, error);
    throw error;
  }
};


