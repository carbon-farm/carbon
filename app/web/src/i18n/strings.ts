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
    en: "Learning and Marketplace aren't built yet — that's later in the Product Roadmap. Your account, your land, and reporting a problem all work today.",
    te: 'లెర్నింగ్, మార్కెట్‌ప్లేస్ ఇంకా నిర్మించలేదు — అవి ప్రొడక్ట్ రోడ్‌మ్యాప్‌లో తర్వాత భాగం. మీ ఖాతా, మీ భూమి, సమస్యను నివేదించడం ఇప్పుడు పనిచేస్తాయి.',
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

  // Dashboard — Cases entry point
  myCasesStat: { en: 'Cases', te: 'కేసులు' },
  reportProblemButton: { en: 'Report a problem', te: 'సమస్యను నివేదించండి' },

  // Cases — list ("My Cases")
  myCasesEyebrow: { en: 'Cases', te: 'కేసులు' },
  myCasesTitle: { en: 'My cases', te: 'నా కేసులు' },
  newCaseButton: { en: '+ New case', te: '+ కొత్త కేసు' },
  noCasesYet: {
    en: 'No cases yet — report a problem to get expert advice.',
    te: 'ఇంకా కేసులు లేవు — నిపుణుల సలహా పొందడానికి ఒక సమస్యను నివేదించండి.',
  },
  couldNotLoadCases: { en: 'Could not load your cases.', te: 'మీ కేసులను లోడ్ చేయలేకపోయాము.' },
  priorityBadgeLabel: { en: 'Priority', te: 'ప్రాధాన్యత' },
  draftBadgeNotice: { en: 'Not submitted yet', te: 'ఇంకా సమర్పించలేదు' },

  // Case status labels — the ten states in 000-Project-Charter.md's Case Lifecycle
  statusDraft: { en: 'Draft', te: 'డ్రాఫ్ట్' },
  statusSubmitted: { en: 'Submitted', te: 'సమర్పించబడింది' },
  statusUnderReview: { en: 'Under review', te: 'సమీక్షలో ఉంది' },
  statusAssigned: { en: 'Assigned to an expert', te: 'నిపుణుడికి కేటాయించబడింది' },
  statusExpertWorking: { en: 'Expert is working on it', te: 'నిపుణుడు దీనిపై పనిచేస్తున్నారు' },
  statusWaitingFarmer: { en: 'Waiting for your response', te: 'మీ స్పందన కోసం వేచి ఉంది' },
  statusAnswered: { en: 'Answered — please review', te: 'సమాధానం ఇవ్వబడింది — దయచేసి సమీక్షించండి' },
  statusFarmerConfirmed: { en: 'Confirmed', te: 'ధృవీకరించబడింది' },
  statusReopened: { en: 'Reopened', te: 'తిరిగి తెరవబడింది' },
  statusClosedResolved: { en: 'Closed — resolved', te: 'మూసివేయబడింది — పరిష్కరించబడింది' },
  statusClosedAbandoned: { en: 'Closed — no response received', te: 'మూసివేయబడింది — స్పందన రాలేదు' },
  statusClosed: { en: 'Closed', te: 'మూసివేయబడింది' },

  // Case categories (from CaseCategoryMaster — fixed six per Charter v0.3.0)
  categoryDisease: { en: 'Disease', te: 'వ్యాధి' },
  categoryPest: { en: 'Pest', te: 'పురుగు' },
  categoryNutrientDeficiency: { en: 'Nutrient Deficiency', te: 'పోషకాహార లోపం' },
  categoryWeatherDamage: { en: 'Weather Damage', te: 'వాతావరణ నష్టం' },
  categoryUnknownProblem: { en: 'Unknown Problem', te: 'తెలియని సమస్య' },
  categoryGeneralAdvisory: { en: 'General Advisory / Planning', te: 'సాధారణ సలహా / ప్రణాళిక' },

  // New Case form
  newCaseEyebrow: { en: 'New case', te: 'కొత్త కేసు' },
  newCaseTitle: { en: 'Report a problem', te: 'సమస్యను నివేదించండి' },
  farmLandFieldLabel: { en: 'Which parcel?', te: 'ఏ స్థలం?' },
  categoryFieldLabel: { en: 'What kind of problem?', te: 'ఎలాంటి సమస్య?' },
  selectPlaceholder: { en: 'Select…', te: 'ఎంచుకోండి…' },
  problemDescriptionField: { en: 'Describe the problem', te: 'సమస్యను వివరించండి' },
  evidenceNotesField: { en: 'Anything else to add? (optional)', te: 'ఇంకా ఏమైనా చెప్పాలా? (ఐచ్ఛికం)' },
  requestPriorityLabel: {
    en: 'This is urgent — request priority handling',
    te: 'ఇది అత్యవసరం — ప్రాధాన్యతా చికిత్సను అభ్యర్థించండి',
  },
  saveDraftButton: { en: 'Save as draft', te: 'డ్రాఫ్ట్‌గా సేవ్ చేయండి' },
  submitCaseButton: { en: 'Submit case', te: 'కేసును సమర్పించండి' },
  saving: { en: 'Saving…', te: 'సేవ్ చేస్తోంది…' },
  submitting: { en: 'Submitting…', te: 'సమర్పిస్తోంది…' },
  noFarmLandsWarning: {
    en: 'Add a Farm/Land parcel first, from your Dashboard, before reporting a problem.',
    te: 'సమస్యను నివేదించే ముందు, మీ డాష్‌బోర్డ్ నుండి ముందుగా ఒక పొలం స్థలాన్ని జోడించండి.',
  },
  couldNotCreateCase: { en: 'Could not create this case.', te: 'ఈ కేసును సృష్టించలేకపోయాము.' },
  couldNotSubmitCase: { en: 'Could not submit this case.', te: 'ఈ కేసును సమర్పించలేకపోయాము.' },

  // Case detail
  caseDetailEyebrow: { en: 'Case', te: 'కేసు' },
  backToCasesLink: { en: 'Back to my cases', te: 'నా కేసులకు తిరిగి వెళ్ళండి' },
  parcelLabel: { en: 'Parcel', te: 'స్థలం' },
  categoryLabel: { en: 'Category', te: 'వర్గం' },
  problemLabel: { en: 'Problem', te: 'సమస్య' },
  evidenceLabel: { en: 'Additional notes', te: 'అదనపు గమనికలు' },
  followUpQuestionLabel: { en: 'The expert is asking', te: 'నిపుణుడు అడుగుతున్నారు' },
  yourResponseField: { en: 'Your response', te: 'మీ స్పందన' },
  sendResponseButton: { en: 'Send response', te: 'స్పందనను పంపండి' },
  sending: { en: 'Sending…', te: 'పంపుతోంది…' },
  resolutionLabel: { en: "Expert's advice", te: 'నిపుణుడి సలహా' },
  confirmResolutionButton: { en: 'This solved my problem', te: 'ఇది నా సమస్యను పరిష్కరించింది' },
  disputeResolutionButton: { en: "This didn't help", te: 'ఇది సహాయపడలేదు' },
  confirming: { en: 'Confirming…', te: 'ధృవీకరిస్తోంది…' },
  disputing: { en: 'Sending back…', te: 'తిరిగి పంపుతోంది…' },
  caseNotFoundError: { en: 'Case not found.', te: 'కేసు కనుగొనబడలేదు.' },
  couldNotLoadCase: { en: 'Could not load this case.', te: 'ఈ కేసును లోడ్ చేయలేకపోయాము.' },
  couldNotRespond: { en: 'Could not send your response.', te: 'మీ స్పందనను పంపలేకపోయాము.' },
  couldNotConfirm: { en: 'Could not confirm this case.', te: 'ఈ కేసును ధృవీకరించలేకపోయాము.' },
  couldNotDispute: { en: 'Could not send this back.', te: 'దీన్ని తిరిగి పంపలేకపోయాము.' },

  // No portal built yet (Administrator/Vendor/Support Agent)
  noPortalTitle: { en: 'No web portal yet for your role', te: 'మీ పాత్ర కోసం ఇంకా వెబ్ పోర్టల్ లేదు' },
  noPortalNotice: {
    en: "This role's screens haven't been built yet.",
    te: 'ఈ పాత్ర కోసం స్క్రీన్‌లు ఇంకా నిర్మించలేదు.',
  },

  // Moderator — Case Queue
  moderatorQueueEyebrow: { en: 'Moderator', te: 'మోడరేటర్' },
  moderatorQueueTitle: { en: 'Case queue', te: 'కేసు క్యూ' },
  noCasesInQueue: { en: 'Nothing waiting for review right now.', te: 'ప్రస్తుతం సమీక్ష కోసం ఏమీ లేదు.' },
  startReviewButton: { en: 'Start review', te: 'సమీక్ష ప్రారంభించండి' },
  assignExpertFieldLabel: { en: 'Assign to', te: 'కేటాయించండి' },
  assignButton: { en: 'Assign', te: 'కేటాయించండి' },
  assigning: { en: 'Assigning…', te: 'కేటాయిస్తోంది…' },
  reviewing: { en: 'Starting…', te: 'ప్రారంభిస్తోంది…' },
  noVerifiedExperts: {
    en: 'No verified experts available to assign yet.',
    te: 'కేటాయించడానికి ధృవీకరించబడిన నిపుణులు ఇంకా లేరు.',
  },
  couldNotLoadQueue: { en: 'Could not load the case queue.', te: 'కేసు క్యూను లోడ్ చేయలేకపోయాము.' },
  couldNotStartReview: { en: 'Could not start review on this case.', te: 'ఈ కేసుపై సమీక్ష ప్రారంభించలేకపోయాము.' },
  couldNotAssign: { en: 'Could not assign this case.', te: 'ఈ కేసును కేటాయించలేకపోయాము.' },

  // Expert — assigned cases
  expertCasesEyebrow: { en: 'Expert', te: 'నిపుణుడు' },
  expertCasesTitle: { en: 'My assigned cases', te: 'నాకు కేటాయించిన కేసులు' },
  noAssignedCases: { en: 'No cases assigned to you right now.', te: 'ప్రస్తుతం మీకు కేటాయించిన కేసులు లేవు.' },
  couldNotLoadAssigned: { en: 'Could not load your assigned cases.', te: 'మీ కేటాయించిన కేసులను లోడ్ చేయలేకపోయాము.' },

  // Expert — case detail actions
  startWorkButton: { en: 'Start work', te: 'పని ప్రారంభించండి' },
  startingWork: { en: 'Starting…', te: 'ప్రారంభిస్తోంది…' },
  askFollowUpHeading: { en: 'Ask the farmer a question', te: 'రైతును ఒక ప్రశ్న అడగండి' },
  followUpQuestionField: { en: 'Your question', te: 'మీ ప్రశ్న' },
  sendQuestionButton: { en: 'Send question', te: 'ప్రశ్నను పంపండి' },
  farmerResponseLabel: { en: "Farmer's response", te: 'రైతు స్పందన' },
  answerCaseHeading: { en: 'Answer this case', te: 'ఈ కేసుకు సమాధానం ఇవ్వండి' },
  resolutionNotesField: { en: 'Your advice for the farmer', te: 'రైతు కోసం మీ సలహా' },
  answerCaseButton: { en: 'Send answer', te: 'సమాధానం పంపండి' },
  answering: { en: 'Sending…', te: 'పంపుతోంది…' },
  waitingOnFarmerNotice: {
    en: "Waiting for the farmer's response before you can continue.",
    te: 'మీరు కొనసాగించే ముందు రైతు స్పందన కోసం వేచి ఉంది.',
  },
  couldNotStartWork: { en: 'Could not start work on this case.', te: 'ఈ కేసుపై పని ప్రారంభించలేకపోయాము.' },
  couldNotSendQuestion: { en: 'Could not send this question.', te: 'ఈ ప్రశ్నను పంపలేకపోయాము.' },
  couldNotAnswer: { en: 'Could not send this answer.', te: 'ఈ సమాధానాన్ని పంపలేకపోయాము.' },

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

// CaseCategoryMaster stores a single English name (Prisma seed data) — this
// maps the fixed six from that seed to their bilingual display pair. An
// unrecognized name (a category an Administrator added later, outside the
// seed) falls back to showing the raw name on both lines rather than
// crashing — better than a missing category.
const CASE_CATEGORY_KEYS: Record<string, StringKey> = {
  Disease: 'categoryDisease',
  Pest: 'categoryPest',
  'Nutrient Deficiency': 'categoryNutrientDeficiency',
  'Weather Damage': 'categoryWeatherDamage',
  'Unknown Problem': 'categoryUnknownProblem',
  'General Advisory / Planning': 'categoryGeneralAdvisory',
};

export function caseCategoryLabel(name: string): Bilingual {
  const key = CASE_CATEGORY_KEYS[name];
  return key ? strings[key] : { en: name, te: name };
}

// Case status + closure reason -> display label. CLOSED needs the
// ClosureReason alongside it to say "resolved" vs. "no response received" —
// everything else maps straight off CaseStatus.
const CASE_STATUS_KEYS: Record<string, StringKey> = {
  DRAFT: 'statusDraft',
  SUBMITTED: 'statusSubmitted',
  UNDER_REVIEW: 'statusUnderReview',
  ASSIGNED: 'statusAssigned',
  EXPERT_WORKING: 'statusExpertWorking',
  WAITING_FARMER: 'statusWaitingFarmer',
  ANSWERED: 'statusAnswered',
  FARMER_CONFIRMED: 'statusFarmerConfirmed',
  REOPENED: 'statusReopened',
};

export function caseStatusLabel(status: string, closureReason?: string | null): Bilingual {
  if (status === 'CLOSED') {
    if (closureReason === 'ABANDONED') return strings.statusClosedAbandoned;
    if (closureReason === 'RESOLVED') return strings.statusClosedResolved;
    return strings.statusClosed;
  }
  const key = CASE_STATUS_KEYS[status];
  return key ? strings[key] : { en: status, te: status };
}
