const firebaseVersion = '10.14.1';

function importFirebaseModule(name) {
  return import(`https://www.gstatic.com/firebasejs/${firebaseVersion}/${name}.js`);
}

export async function initializePackDayAuth(config) {
  if (!config || !config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
    window.dispatchEvent(new CustomEvent('packday-auth-state', {
      detail: { configured: false, user: null }
    }));
    return;
  }

  const [{ initializeApp, getApps, getApp }, {
    getAuth,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut
  }] = await Promise.all([
    importFirebaseModule('firebase-app'),
    importFirebaseModule('firebase-auth')
  ]);
  const app = getApps().length ? getApp() : initializeApp(config);
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });

  window.packdayAuth = {
    signIn: () => signInWithPopup(auth, googleProvider),
    signInWithEmail: (email, password) => signInWithEmailAndPassword(auth, email, password),
    createAccount: (email, password) => createUserWithEmailAndPassword(auth, email, password),
    sendPasswordReset: (email) => sendPasswordResetEmail(auth, email),
    signOut: () => signOut(auth),
    getCalendarAccessToken: async () => {
      if (!auth.currentUser) throw new Error('Sign in with Google before syncing your calendar.');
      const calendarProvider = new GoogleAuthProvider();
      calendarProvider.addScope('https://www.googleapis.com/auth/calendar.events.readonly');
      calendarProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, calendarProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential || !credential.accessToken) {
        throw new Error('Google did not provide calendar access. Please approve the read-only calendar permission.');
      }
      return credential.accessToken;
    }
  };

  onAuthStateChanged(auth, (user) => {
    window.dispatchEvent(new CustomEvent('packday-auth-state', {
      detail: { configured: true, user }
    }));
  });
}
