import { db, isFirebaseActive } from "./firebaseConfig";
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  collection,
  deleteDoc
} from "firebase/firestore";
import { DEFAULT_QUESTIONS } from "../data/defaultQuestions";
import { hashPassword } from "../utils/crypto";

// Broadcast Channel for multi-tab / local simulation
const syncChannel = typeof window !== 'undefined' && window.BroadcastChannel 
  ? new BroadcastChannel("quiz_fest_channel") 
  : null;

export const INITIAL_GAME_STATE = {
  status: "LOBBY",
  currentQuestionIndex: 0,
  activeQuestionId: "q-1",
  timerStartedAt: null,
  timerDuration: 30,
  timeRemaining: 30,
  showAudiencePoll: false,
  isTimerRunning: false,
  revealOption: false,
  updatedAt: Date.now()
};

// ─── Admin Password ───
// The canonical password. Only the SHA-256 hash is stored.
// Bump CURRENT_PW_VERSION whenever DEFAULT_ADMIN_PASS changes
// to force automatic migration on all clients & Firestore.
const DEFAULT_ADMIN_PASS = "josephest";
const CURRENT_PW_VERSION = 3;

const KEYS = {
  GAME_STATE: "quiz_local_game_state",
  QUESTIONS: "quiz_local_questions",
  USERS: "quiz_local_users",
  RESPONSES: "quiz_local_responses",
  ADMIN_PASSWORD_HASH: "quiz_local_admin_pw_hash",
  ADMIN_PW_VERSION: "quiz_local_admin_pw_version"
};

function getLocal(key, defaultValue) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function setLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    if (syncChannel) {
      syncChannel.postMessage({ type: "LOCAL_SYNC", key, value });
    }
  } catch (e) {
    console.error("Local storage set error", e);
  }
}

// Initial storage setup
if (!localStorage.getItem(KEYS.QUESTIONS)) {
  localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(DEFAULT_QUESTIONS));
}
if (!localStorage.getItem(KEYS.GAME_STATE)) {
  localStorage.setItem(KEYS.GAME_STATE, JSON.stringify(INITIAL_GAME_STATE));
}

// ─── Seed / Migrate admin password hash on boot ───
(async function seedAdminPasswordHash() {
  const existingVersion = getLocal(KEYS.ADMIN_PW_VERSION, 0);
  if (existingVersion < CURRENT_PW_VERSION) {
    const hash = await hashPassword(DEFAULT_ADMIN_PASS);
    setLocal(KEYS.ADMIN_PASSWORD_HASH, hash);
    setLocal(KEYS.ADMIN_PW_VERSION, CURRENT_PW_VERSION);

    if (isFirebaseActive && db) {
      try {
        await setDoc(doc(db, "kbc_system", "settings"), {
          adminPasswordHash: hash,
          adminPwVersion: CURRENT_PW_VERSION
        }, { merge: true });
        console.log("Admin password hash migrated to version", CURRENT_PW_VERSION);
      } catch (e) {
        console.warn("Failed to migrate admin password hash in Firestore:", e);
      }
    }
  }
})();

// -------------------------------------------------------------
// 1. ADMIN PASSWORD HASH (Read-only from client)
// -------------------------------------------------------------
export function subscribeAdminPasswordHash(callback) {
  if (isFirebaseActive && db) {
    const unsub = onSnapshot(doc(db, "kbc_system", "settings"), async (docSnap) => {
      const data = docSnap.exists() ? docSnap.data() : {};

      if (data.adminPwVersion === CURRENT_PW_VERSION && data.adminPasswordHash) {
        // Hash is current
        callback(data.adminPasswordHash);
      } else {
        // Version mismatch or missing — migrate
        const hash = await hashPassword(DEFAULT_ADMIN_PASS);
        await setDoc(doc(db, "kbc_system", "settings"), {
          adminPasswordHash: hash,
          adminPwVersion: CURRENT_PW_VERSION
        }, { merge: true });
        callback(hash);
      }
    }, async (err) => {
      console.warn("Firestore admin settings snapshot error:", err);
      // Fallback to local
      const existingVersion = getLocal(KEYS.ADMIN_PW_VERSION, 0);
      if (existingVersion < CURRENT_PW_VERSION) {
        const hash = await hashPassword(DEFAULT_ADMIN_PASS);
        setLocal(KEYS.ADMIN_PASSWORD_HASH, hash);
        setLocal(KEYS.ADMIN_PW_VERSION, CURRENT_PW_VERSION);
        callback(hash);
      } else {
        callback(getLocal(KEYS.ADMIN_PASSWORD_HASH, null));
      }
    });
    return unsub;
  } else {
    // Local-only mode
    (async () => {
      const existingVersion = getLocal(KEYS.ADMIN_PW_VERSION, 0);
      if (existingVersion < CURRENT_PW_VERSION) {
        const hash = await hashPassword(DEFAULT_ADMIN_PASS);
        setLocal(KEYS.ADMIN_PASSWORD_HASH, hash);
        setLocal(KEYS.ADMIN_PW_VERSION, CURRENT_PW_VERSION);
        callback(hash);
      } else {
        callback(getLocal(KEYS.ADMIN_PASSWORD_HASH, null));
      }
    })();

    const handleMessage = (e) => {
      if (e.data && e.data.type === "LOCAL_SYNC" && e.data.key === KEYS.ADMIN_PASSWORD_HASH) {
        callback(e.data.value);
      }
    };
    if (syncChannel) syncChannel.addEventListener("message", handleMessage);
    return () => {
      if (syncChannel) syncChannel.removeEventListener("message", handleMessage);
    };
  }
}

// -------------------------------------------------------------
// 2. GAME STATE SUBSCRIPTION & UPDATES
// -------------------------------------------------------------
export function subscribeGameState(callback) {
  if (isFirebaseActive && db) {
    const unsub = onSnapshot(doc(db, "kbc_system", "gameState"), (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      } else {
        setDoc(doc(db, "kbc_system", "gameState"), INITIAL_GAME_STATE);
        callback(INITIAL_GAME_STATE);
      }
    }, (err) => {
      console.warn("Firestore gameState snapshot error, falling back to local:", err);
      fallbackGameStateSync(callback);
    });
    return unsub;
  } else {
    return fallbackGameStateSync(callback);
  }
}

function fallbackGameStateSync(callback) {
  callback(getLocal(KEYS.GAME_STATE, INITIAL_GAME_STATE));

  const handleMessage = (e) => {
    if (e.data && e.data.type === "LOCAL_SYNC" && e.data.key === KEYS.GAME_STATE) {
      callback(e.data.value);
    }
  };

  const handleStorage = (e) => {
    if (e.key === KEYS.GAME_STATE && e.newValue) {
      callback(JSON.parse(e.newValue));
    }
  };

  if (syncChannel) syncChannel.addEventListener("message", handleMessage);
  window.addEventListener("storage", handleStorage);

  return () => {
    if (syncChannel) syncChannel.removeEventListener("message", handleMessage);
    window.removeEventListener("storage", handleStorage);
  };
}

export async function updateGameState(partialState) {
  const current = getLocal(KEYS.GAME_STATE, INITIAL_GAME_STATE);
  const updated = { ...current, ...partialState, updatedAt: Date.now() };

  setLocal(KEYS.GAME_STATE, updated);

  if (isFirebaseActive && db) {
    try {
      await setDoc(doc(db, "kbc_system", "gameState"), updated, { merge: true });
    } catch (err) {
      console.error("Firestore updateGameState error:", err);
    }
  }
}

// -------------------------------------------------------------
// 3. QUESTIONS SUBSCRIPTION & MANAGEMENT
// -------------------------------------------------------------
export function subscribeQuestions(callback) {
  if (isFirebaseActive && db) {
    const unsub = onSnapshot(doc(db, "kbc_system", "questions"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().items) {
        callback(docSnap.data().items);
      } else {
        setDoc(doc(db, "kbc_system", "questions"), { items: DEFAULT_QUESTIONS });
        callback(DEFAULT_QUESTIONS);
      }
    }, (err) => {
      console.warn("Firestore questions snapshot error:", err);
      fallbackQuestionsSync(callback);
    });
    return unsub;
  } else {
    return fallbackQuestionsSync(callback);
  }
}

function fallbackQuestionsSync(callback) {
  callback(getLocal(KEYS.QUESTIONS, DEFAULT_QUESTIONS));

  const handleMessage = (e) => {
    if (e.data && e.data.type === "LOCAL_SYNC" && e.data.key === KEYS.QUESTIONS) {
      callback(e.data.value);
    }
  };

  if (syncChannel) syncChannel.addEventListener("message", handleMessage);
  return () => {
    if (syncChannel) syncChannel.removeEventListener("message", handleMessage);
  };
}

export async function saveQuestions(questionsList) {
  setLocal(KEYS.QUESTIONS, questionsList);
  if (isFirebaseActive && db) {
    try {
      await setDoc(doc(db, "kbc_system", "questions"), { items: questionsList });
    } catch (err) {
      console.error("Firestore saveQuestions error:", err);
    }
  }
}

// -------------------------------------------------------------
// 4. TEAM PARTICIPANTS
// -------------------------------------------------------------
export function subscribeParticipants(callback) {
  if (isFirebaseActive && db) {
    const unsub = onSnapshot(collection(db, "kbc_users"), (querySnapshot) => {
      const users = [];
      querySnapshot.forEach((d) => users.push(d.data()));
      callback(users);
    }, (err) => {
      console.warn("Firestore participants snapshot error:", err);
      fallbackUsersSync(callback);
    });
    return unsub;
  } else {
    return fallbackUsersSync(callback);
  }
}

function fallbackUsersSync(callback) {
  callback(getLocal(KEYS.USERS, []));

  const handleMessage = (e) => {
    if (e.data && e.data.type === "LOCAL_SYNC" && e.data.key === KEYS.USERS) {
      callback(e.data.value);
    }
  };

  const handleStorage = (e) => {
    if (e.key === KEYS.USERS && e.newValue) {
      callback(JSON.parse(e.newValue));
    }
  };

  if (syncChannel) syncChannel.addEventListener("message", handleMessage);
  window.addEventListener("storage", handleStorage);

  return () => {
    if (syncChannel) syncChannel.removeEventListener("message", handleMessage);
    window.removeEventListener("storage", handleStorage);
  };
}

export async function registerOrUpdateUser(user) {
  const users = getLocal(KEYS.USERS, []);
  const usernameClean = user.username.trim().toLowerCase();
  const idx = users.findIndex(u => u.username.toLowerCase() === usernameClean);

  const userData = {
    username: usernameClean,
    password: user.password,
    displayName: user.displayName || user.username,
    college: user.college || "College Fest",
    score: user.score || 0,
    currentLevel: user.currentLevel || 1,
    lifelines: user.lifelines || { fiftyFifty: false, audiencePoll: false, flip: false },
    isEliminated: user.isEliminated || false,
    createdAt: Date.now()
  };

  let updatedUsers;
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...userData };
    updatedUsers = [...users];
  } else {
    updatedUsers = [...users, userData];
  }

  setLocal(KEYS.USERS, updatedUsers);

  if (isFirebaseActive && db) {
    try {
      await setDoc(doc(db, "kbc_users", usernameClean), userData, { merge: true });
    } catch (err) {
      console.error("Firestore registerOrUpdateUser error:", err);
    }
  }

  return userData;
}

export async function bulkRegisterUsers(newUsersList) {
  const currentUsers = getLocal(KEYS.USERS, []);
  const userMap = new Map();
  currentUsers.forEach(u => userMap.set(u.username.toLowerCase(), u));

  newUsersList.forEach(u => {
    const usernameClean = u.username.trim().toLowerCase();
    const formatted = {
      username: usernameClean,
      password: u.password,
      displayName: u.displayName || u.username,
      college: u.college || "College Fest",
      score: 0,
      currentLevel: 1,
      lifelines: { fiftyFifty: false, audiencePoll: false, flip: false },
      isEliminated: false,
      createdAt: Date.now()
    };
    userMap.set(usernameClean, formatted);
  });

  const merged = Array.from(userMap.values());
  setLocal(KEYS.USERS, merged);

  if (isFirebaseActive && db) {
    for (const u of newUsersList) {
      try {
        const usernameClean = u.username.trim().toLowerCase();
        await setDoc(doc(db, "kbc_users", usernameClean), {
          username: usernameClean,
          password: u.password,
          displayName: u.displayName || u.username,
          college: u.college || "College Fest",
          score: 0,
          currentLevel: 1,
          lifelines: { fiftyFifty: false, audiencePoll: false, flip: false },
          isEliminated: false,
          createdAt: Date.now()
        }, { merge: true });
      } catch (e) {
        console.error("Batch insert error", e);
      }
    }
  }

  return merged;
}

export async function deleteUserAccount(username) {
  const usernameClean = username.trim().toLowerCase();
  let users = getLocal(KEYS.USERS, []);
  users = users.filter(u => u.username.toLowerCase() !== usernameClean);
  setLocal(KEYS.USERS, users);

  if (isFirebaseActive && db) {
    try {
      await deleteDoc(doc(db, "kbc_users", usernameClean));
    } catch (e) {
      console.error("Delete user error in firebase", e);
    }
  }
}

export async function resetAllScores() {
  let users = getLocal(KEYS.USERS, []);
  users = users.map(u => ({
    ...u,
    score: 0,
    currentLevel: 1,
    lifelines: { fiftyFifty: false, audiencePoll: false, flip: false },
    isEliminated: false,
    lastAnswer: null
  }));

  setLocal(KEYS.USERS, users);
  setLocal(KEYS.RESPONSES, {});

  if (isFirebaseActive && db) {
    for (const u of users) {
      try {
        await updateDoc(doc(db, "kbc_users", u.username.toLowerCase()), {
          score: 0,
          currentLevel: 1,
          lifelines: { fiftyFifty: false, audiencePoll: false, flip: false },
          isEliminated: false,
          lastAnswer: null
        });
      } catch (e) {
        console.error("Error resetting user in firebase", e);
      }
    }
  }
}

// -------------------------------------------------------------
// 5. RESPONSES & LIVE SUBMISSIONS
// -------------------------------------------------------------
export function subscribeQuestionResponses(questionId, callback) {
  if (isFirebaseActive && db) {
    const unsub = onSnapshot(doc(db, "kbc_responses", questionId || "q-active"), (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data().submissions || {});
      } else {
        callback({});
      }
    }, (err) => {
      console.warn("Firestore responses snapshot error:", err);
      fallbackResponsesSync(questionId, callback);
    });
    return unsub;
  } else {
    return fallbackResponsesSync(questionId, callback);
  }
}

function fallbackResponsesSync(questionId, callback) {
  const allResponses = getLocal(KEYS.RESPONSES, {});
  callback(allResponses[questionId] || {});

  const handleMessage = (e) => {
    if (e.data && e.data.type === "LOCAL_SYNC" && e.data.key === KEYS.RESPONSES) {
      const resp = e.data.value;
      callback(resp[questionId] || {});
    }
  };

  if (syncChannel) syncChannel.addEventListener("message", handleMessage);
  return () => {
    if (syncChannel) syncChannel.removeEventListener("message", handleMessage);
  };
}

export async function submitParticipantAnswer({ userId, username, questionId, selectedOption, timeTakenMs, isCorrect, pointsEarned }) {
  const allResponses = getLocal(KEYS.RESPONSES, {});
  if (!allResponses[questionId]) {
    allResponses[questionId] = {};
  }

  const submission = {
    userId, username, selectedOption, timeTakenMs,
    isCorrect, pointsEarned, submittedAt: Date.now()
  };

  allResponses[questionId][username.toLowerCase()] = submission;
  setLocal(KEYS.RESPONSES, allResponses);

  const users = getLocal(KEYS.USERS, []);
  const idx = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
  if (idx >= 0) {
    const user = users[idx];
    const newScore = isCorrect ? (user.score || 0) + pointsEarned : (user.score || 0);
    const newLevel = isCorrect ? (user.currentLevel || 1) + 1 : (user.currentLevel || 1);

    users[idx] = {
      ...user,
      score: newScore,
      currentLevel: newLevel,
      lastAnswer: submission,
      isEliminated: !isCorrect && (user.isEliminated || false)
    };
    setLocal(KEYS.USERS, [...users]);

    if (isFirebaseActive && db) {
      try {
        await updateDoc(doc(db, "kbc_users", username.toLowerCase()), {
          score: newScore, currentLevel: newLevel, lastAnswer: submission
        });
      } catch (e) {
        console.error("Firestore user score update error", e);
      }
    }
  }

  if (isFirebaseActive && db) {
    try {
      const qDocRef = doc(db, "kbc_responses", questionId);
      const docSnap = await getDoc(qDocRef);
      const existing = docSnap.exists() ? docSnap.data().submissions || {} : {};
      existing[username.toLowerCase()] = submission;
      await setDoc(qDocRef, { submissions: existing }, { merge: true });
    } catch (err) {
      console.error("Firestore response submit error:", err);
    }
  }

  return submission;
}

export async function markLifelineUsed(username, lifelineType) {
  const users = getLocal(KEYS.USERS, []);
  const idx = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
  if (idx >= 0) {
    const lifelines = { ...users[idx].lifelines, [lifelineType]: true };
    users[idx].lifelines = lifelines;
    setLocal(KEYS.USERS, [...users]);

    if (isFirebaseActive && db) {
      try {
        await updateDoc(doc(db, "kbc_users", username.toLowerCase()), { lifelines });
      } catch (e) {
        console.error("Firestore lifeline update error", e);
      }
    }
  }
}
