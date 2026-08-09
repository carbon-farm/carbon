// Every farmer-facing string in the app, in both languages, in one place —
// per the product decision that everything shown to a farmer carries an
// English line and a Telugu line together, not Telugu-only (which is what
// 01-Product/05-Target-Users.md's NFR-T1 originally specified; this
// supersedes that to bilingual display). Keeping every string here, instead
// of scattered inline in JSX, is what makes "each and every" checkable —
// a missing key is a build-time TypeScript error, not a silent gap.

export interface Bilingual {
  en: string;
  te: string;
}

export const strings = {
  brand: { en: 'Organic Carbon Farming', te: 'ఆర్గానిక్ కార్బన్ ఫార్మింగ్' },

  // Login
  loginTitle: { en: 'Log in', te: 'లాగిన్ అవ్వండి' },
  mobileNumberLabel: { en: 'Mobile number', te: 'మొబైల్ నంబర్' },
  passwordLabel: { en: 'Password', te: 'పాస్‌వర్డ్' },
  loginButton: { en: 'Log in', te: 'లాగిన్' },
  loggingIn: { en: 'Logging in…', te: 'లాగిన్ అవుతోంది…' },
  newHere: { en: 'New here?', te: 'కొత్తవారా?' },
  createAccountLink: { en: 'Create an account', te: 'ఖాతా సృష్టించండి' },
  forgotPasswordLink: { en: 'Forgot password?', te: 'పాస్‌వర్డ్ మర్చిపోయారా?' },

  // Forgot password — step 1 (request code)
  forgotPasswordStep1: { en: 'Step 1 of 3', te: 'దశ 1 / 3' },
  resetPasswordTitle: { en: 'Reset your password', te: 'మీ పాస్‌వర్డ్‌ను రీసెట్ చేయండి' },
  sendResetCodeButton: { en: 'Send reset code', te: 'రీసెట్ కోడ్ పంపండి' },
  sendingCode: { en: 'Sending…', te: 'పంపుతోంది…' },

  // Forgot password — step 2 (verify code)
  forgotPasswordStep2: { en: 'Step 2 of 3', te: 'దశ 2 / 3' },

  // Forgot password — step 3 (new password)
  forgotPasswordStep3: { en: 'Step 3 of 3', te: 'దశ 3 / 3' },
  newPasswordLabel: { en: 'New password', te: 'కొత్త పాస్‌వర్డ్' },
  resetPasswordButton: { en: 'Reset password', te: 'పాస్‌వర్డ్ రీసెట్ చేయండి' },
  resetting: { en: 'Resetting…', te: 'రీసెట్ చేస్తోంది…' },
  resetSuccessMessage: {
    en: 'Password reset. Log in with your new password.',
    te: 'పాస్‌వర్డ్ రీసెట్ చేయబడింది. మీ కొత్త పాస్‌వర్డ్‌తో లాగిన్ అవ్వండి.',
  },
  backToLoginLink: { en: 'Back to log in', te: 'లాగిన్‌కు తిరిగి వెళ్ళండి' },

  // Register — step 1
  registerStep1: { en: 'Step 1 of 2', te: 'దశ 1 / 2' },
  createAccountTitle: { en: 'Create your account', te: 'మీ ఖాతాను సృష్టించండి' },
  nameLabel: { en: 'Name', te: 'పేరు' },
  sendCodeButton: { en: 'Send verification code', te: 'ధృవీకరణ కోడ్ పంపండి' },
  creating: { en: 'Creating…', te: 'సృష్టిస్తోంది…' },
  alreadyRegistered: { en: 'Already registered?', te: 'ఇప్పటికే నమోదు అయ్యారా?' },
  loginLink: { en: 'Log in', te: 'లాగిన్ అవ్వండి' },

  // Register — step 2 (OTP)
  registerStep2: { en: 'Step 2 of 2', te: 'దశ 2 / 2' },
  enterCodeTitle: { en: 'Enter the code', te: 'కోడ్‌ను నమోదు చేయండి' },
  otpCodeLabel: { en: '6-digit code', te: '6-అంకెల కోడ్' },
  verifyButton: { en: 'Verify & continue', te: 'ధృవీకరించి కొనసాగించండి' },
  verifying: { en: 'Verifying…', te: 'ధృవీకరిస్తోంది…' },
  backButton: { en: 'Back', te: 'వెనుకకు' },
  devOtpPrefix: {
    en: 'Dev mode — no SMS gateway yet (Stage 2). Your code is:',
    te: 'డెవ్ మోడ్ — ఇంకా SMS గేట్‌వే లేదు (దశ 2). మీ కోడ్:',
  },

  // Dashboard
  dashboardEyebrow: { en: 'Dashboard', te: 'డాష్‌బోర్డ్' },
  yourFarms: { en: 'Your farms', te: 'మీ పొలాలు' },
  logoutButton: { en: 'Log out', te: 'లాగ్ అవుట్' },
  farmLandParcelsStat: { en: 'Farm/Land parcels', te: 'పొలం స్థలాలు' },
  stage1Notice: {
    en: "Case Management, Learning, and Marketplace aren't built yet — that's Stage 2+ of the Product Roadmap. This is Stage 1: your account and your land.",
    te: 'కేస్ మేనేజ్‌మెంట్, లెర్నింగ్, మార్కెట్‌ప్లేస్ ఇంకా నిర్మించలేదు — అవి ప్రొడక్ట్ రోడ్‌మ్యాప్‌లో దశ 2కి చెందినవి. ఇది దశ 1: మీ ఖాతా మరియు మీ భూమి.',
  },
  farmLandParcelsHeading: { en: 'Farm/Land parcels', te: 'పొలం స్థలాలు' },
  addParcelButton: { en: '+ Add parcel', te: '+ స్థలం జోడించండి' },
  cancelButton: { en: 'Cancel', te: 'రద్దు చేయండి' },
  parcelLabelField: { en: 'Name for this parcel', te: 'ఈ స్థలానికి పేరు' },
  addressField: { en: 'Address', te: 'చిరునామా' },
  landSizeField: { en: 'Size (acres)', te: 'పరిమాణం (ఎకరాలు)' },
  cropsField: { en: 'Main crops (comma-separated)', te: 'ప్రధాన పంటలు (కామాతో వేరు చేయండి)' },
  saveParcelButton: { en: 'Save parcel', te: 'స్థలాన్ని సేవ్ చేయండి' },
  noParcelsYet: { en: 'No parcels yet — add your first one.', te: 'ఇంకా స్థలాలు లేవు — మీ మొదటిదాన్ని జోడించండి.' },
  loading: { en: 'Loading…', te: 'లోడ్ అవుతోంది…' },

  // Generic fallback error (network failure with no server message)
  genericError: { en: 'Something went wrong. Try again.', te: 'ఏదో తప్పు జరిగింది. మళ్ళీ ప్రయత్నించండి.' },
  incorrectCodeError: { en: 'Incorrect code. Try again.', te: 'తప్పు కోడ్. మళ్ళీ ప్రయత్నించండి.' },
  couldNotLoadFarms: { en: 'Could not load your farms.', te: 'మీ పొలాలను లోడ్ చేయలేకపోయాము.' },
  couldNotAddParcel: { en: 'Could not add this parcel.', te: 'ఈ స్థలాన్ని జోడించలేకపోయాము.' },
} as const satisfies Record<string, Bilingual>;

export type StringKey = keyof typeof strings;

// "We sent a 6-digit code to {mobile}." needs the mobile number interpolated —
// kept as a function, outside the static dictionary, for that reason alone.
export function otpSentTo(mobileNumber: string): Bilingual {
  return {
    en: `We sent a 6-digit code to ${mobileNumber}.`,
    te: `మేము ${mobileNumber}కి 6-అంకెల కోడ్ పంపాము.`,
  };
}
