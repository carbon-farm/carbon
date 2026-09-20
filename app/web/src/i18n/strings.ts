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

  // Landing page
  landingTagline: {
    en: 'Real advice from real agriculture experts, and a growing library of trusted knowledge — right from your phone.',
    te: 'నిజమైన వ్యవసాయ నిపుణుల నుండి నిజమైన సలహా, మరియు నమ్మదగిన జ్ఞానం యొక్క పెరుగుతున్న గ్రంథాలయం — మీ ఫోన్ నుండి నేరుగా.',
  },
  landingFeature1Title: { en: 'Ask an expert', te: 'నిపుణుడిని అడగండి' },
  landingFeature1Desc: {
    en: 'Report a problem with photos and get a real diagnosis from a verified agriculture expert.',
    te: 'ఫోటోలతో సమస్యను నివేదించండి మరియు ధృవీకరించబడిన వ్యవసాయ నిపుణుడి నుండి నిజమైన నిర్ధారణ పొందండి.',
  },
  landingFeature2Title: { en: 'Browse advice', te: 'సలహాలను చూడండి' },
  landingFeature2Desc: {
    en: 'Search a growing library of expert-reviewed advisory articles, in your language.',
    te: 'నిపుణులు సమీక్షించిన సలహా వ్యాసాల పెరుగుతున్న గ్రంథాలయాన్ని మీ భాషలో వెతకండి.',
  },
  landingFeature3Title: { en: 'Track your land', te: 'మీ భూమిని ట్రాక్ చేయండి' },
  landingFeature3Desc: {
    en: 'Keep every Farm/Land parcel, its crops, and its case history in one place.',
    te: 'ప్రతి పొలం స్థలం, దాని పంటలు, దాని కేసు చరిత్రను ఒకే చోట ఉంచుకోండి.',
  },
  landingFooterNote: {
    en: 'Built for farmers, agriculture experts, and advisory teams.',
    te: 'రైతులు, వ్యవసాయ నిపుణులు, సలహా బృందాల కోసం నిర్మించబడింది.',
  },

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
    en: "Temporary: SMS isn't connected yet, so your code is shown here instead of being texted to you:",
    te: 'తాత్కాలికం: SMS ఇంకా అనుసంధానించబడలేదు, కాబట్టి మీ కోడ్ మీకు మెసేజ్ చేయబడకుండా ఇక్కడ చూపబడుతుంది:',
  },

  // Dashboard
  dashboardEyebrow: { en: 'Dashboard', te: 'డాష్‌బోర్డ్' },
  yourFarms: { en: 'Your farms', te: 'మీ పొలాలు' },
  logoutButton: { en: 'Log out', te: 'లాగ్ అవుట్' },
  farmLandParcelsStat: { en: 'Farm/Land parcels', te: 'పొలం స్థలాలు' },
  casesAskedStat: { en: 'Cases asked', te: 'అడిగిన కేసులు' },
  casesPendingStat: { en: 'Pending', te: 'పెండింగ్‌లో' },
  casesClosedStat: { en: 'Closed', te: 'మూసివేయబడింది' },
  recentKnowledgeHeading: { en: 'Recent advice', te: 'ఇటీవలి సలహా' },
  farmLandParcelsHeading: { en: 'Farm/Land parcels', te: 'పొలం స్థలాలు' },
  addParcelButton: { en: '+ Add parcel', te: '+ స్థలం జోడించండి' },
  cancelButton: { en: 'Cancel', te: 'రద్దు చేయండి' },
  parcelLabelField: { en: 'Name for this parcel', te: 'ఈ స్థలానికి పేరు' },
  addressField: { en: 'Address', te: 'చిరునామా' },
  landSizeField: { en: 'Size (acres)', te: 'పరిమాణం (ఎకరాలు)' },
  cropsField: { en: 'Main crops (comma-separated)', te: 'ప్రధాన పంటలు (కామాతో వేరు చేయండి)' },
  useLocationButton: { en: '📍 Use my current location (optional)', te: '📍 నా ప్రస్తుత స్థానాన్ని వాడండి (ఐచ్ఛికం)' },
  locatingButton: { en: 'Locating…', te: 'గుర్తిస్తోంది…' },
  locationCapturedNotice: { en: 'Location captured.', te: 'స్థానం నమోదైంది.' },
  removeLocationButton: { en: 'Remove location', te: 'స్థానాన్ని తీసివేయండి' },
  locationDeniedError: {
    en: "Couldn't get your location — you can skip this, it's optional.",
    te: 'మీ స్థానాన్ని పొందలేకపోయాము — దీన్ని దాటవేయవచ్చు, ఇది ఐచ్ఛికం.',
  },
  viewOnMapLink: { en: 'View on map', te: 'మ్యాప్‌లో చూడండి' },
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
  saveChangesButton: { en: 'Save changes', te: 'మార్పులను సేవ్ చేయండి' },
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
  evidenceMediaLabel: { en: 'Photos / videos', te: 'ఫోటోలు / వీడియోలు' },
  addEvidenceButton: { en: '+ Add a photo or video', te: '+ ఫోటో లేదా వీడియో జోడించండి' },
  watchVideoLink: { en: 'Watch video', te: 'వీడియో చూడండి' },
  uploading: { en: 'Uploading…', te: 'అప్‌లోడ్ అవుతోంది…' },
  couldNotUploadEvidence: { en: 'Could not upload this file.', te: 'ఈ ఫైల్‌ను అప్‌లోడ్ చేయలేకపోయాము.' },
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

  // Expert — my credentials
  myCredentialsLinkTitle: { en: 'My credentials', te: 'నా ధృవపత్రాలు' },
  myCredentialsTitle: { en: 'My credentials', te: 'నా ధృవపత్రాలు' },
  credentialStatusLabel: { en: 'Status', te: 'స్థితి' },
  credentialNotSubmitted: {
    en: 'Not submitted yet — you need to submit your qualification before you can be assigned cases.',
    te: 'ఇంకా సమర్పించలేదు — కేసులు కేటాయించబడాలంటే మీరు మీ అర్హతను సమర్పించాలి.',
  },
  credentialPendingReview: {
    en: 'Submitted — waiting for an Administrator to review it.',
    te: 'సమర్పించారు — అడ్మినిస్ట్రేటర్ సమీక్ష కోసం వేచి ఉంది.',
  },
  credentialVerified: { en: 'Verified — you can be assigned cases.', te: 'ధృవీకరించబడింది — మీకు కేసులు కేటాయించవచ్చు.' },
  credentialRejected: {
    en: 'Rejected — check your notifications for the reason, then resubmit below.',
    te: 'తిరస్కరించబడింది — కారణం కోసం మీ ప్రకటనలను చూడండి, తర్వాత క్రింద మళ్ళీ సమర్పించండి.',
  },
  qualificationFieldHint: {
    en: 'Your farming/agronomy qualification or relevant experience.',
    te: 'మీ వ్యవసాయం/అగ్రోనమీ అర్హత లేదా సంబంధిత అనుభవం.',
  },
  licenseFieldOptionalHint: { en: 'Optional — if you hold a professional license.', te: 'ఐచ్ఛికం — మీకు వృత్తిపరమైన లైసెన్స్ ఉంటే.' },
  submitCredentialsButton: { en: 'Submit for review', te: 'సమీక్ష కోసం సమర్పించండి' },
  resubmitCredentialsButton: { en: 'Resubmit for review', te: 'మళ్ళీ సమీక్ష కోసం సమర్పించండి' },
  submittingCredentials: { en: 'Submitting…', te: 'సమర్పిస్తోంది…' },
  couldNotLoadMyCredentials: { en: 'Could not load your credential status.', te: 'మీ ధృవపత్ర స్థితిని లోడ్ చేయలేకపోయాము.' },
  couldNotSubmitCredentials: { en: 'Could not submit your credentials.', te: 'మీ ధృవపత్రాలను సమర్పించలేకపోయాము.' },

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

  // Administrator — hub
  adminEyebrow: { en: 'Administrator', te: 'అడ్మినిస్ట్రేటర్' },
  adminHubTitle: { en: 'Admin', te: 'అడ్మిన్' },
  staffLinkTitle: { en: 'Staff accounts', te: 'సిబ్బంది ఖాతాలు' },
  staffLinkDesc: { en: 'Create Moderator/Expert accounts and see everyone registered.', te: 'మోడరేటర్/నిపుణుల ఖాతాలను సృష్టించండి మరియు నమోదైన అందరినీ చూడండి.' },
  credentialsLinkTitle: { en: 'Expert credentials', te: 'నిపుణుల ధృవపత్రాలు' },
  credentialsLinkDesc: { en: 'Approve or reject qualifications experts have submitted.', te: 'నిపుణులు సమర్పించిన అర్హతలను ఆమోదించండి లేదా తిరస్కరించండి.' },
  taxonomyLinkTitle: { en: 'Taxonomy', te: 'వర్గీకరణ' },
  taxonomyLinkDesc: { en: 'Crops, case categories, tags, and regions used across the app.', te: 'యాప్ అంతటా ఉపయోగించే పంటలు, కేసు వర్గాలు, ట్యాగ్‌లు, ప్రాంతాలు.' },
  auditLogLinkTitle: { en: 'Audit log', te: 'ఆడిట్ లాగ్' },
  auditLogLinkDesc: { en: 'Every material action taken across the platform, who did it, and when.', te: 'ప్లాట్‌ఫారమ్ అంతటా తీసుకున్న ప్రతి ముఖ్యమైన చర్య, ఎవరు చేశారు, ఎప్పుడు.' },

  // Administrator — audit log
  auditLogPageTitle: { en: 'Audit log', te: 'ఆడిట్ లాగ్' },
  entityTypeFilterLabel: { en: 'Entity type', te: 'ఎంటిటీ రకం' },
  fromDateFilterLabel: { en: 'From', te: 'నుండి' },
  toDateFilterLabel: { en: 'To', te: 'వరకు' },
  allEntityTypesOption: { en: 'All', te: 'అన్నీ' },
  noAuditEntries: { en: 'No matching entries.', te: 'సరిపోలే నమోదులు లేవు.' },
  couldNotLoadAuditLog: { en: 'Could not load the audit log.', te: 'ఆడిట్ లాగ్‌ను లోడ్ చేయలేకపోయాము.' },
  dateColumnLabel: { en: 'Date', te: 'తేదీ' },
  actionColumnLabel: { en: 'Action', te: 'చర్య' },
  entityColumnLabel: { en: 'Entity', te: 'ఎంటిటీ' },
  actorColumnLabel: { en: 'Actor', te: 'నిర్వాహకుడు' },

  // Administrator — staff
  staffPageTitle: { en: 'Staff accounts', te: 'సిబ్బంది ఖాతాలు' },
  createStaffHeading: { en: 'Create a staff account', te: 'సిబ్బంది ఖాతాను సృష్టించండి' },
  temporaryPasswordField: { en: 'Temporary password', te: 'తాత్కాలిక పాస్‌వర్డ్' },
  roleFieldLabel: { en: 'Role', te: 'పాత్ర' },
  roleFarmer: { en: 'Farmer', te: 'రైతు' },
  roleMember: { en: 'Member', te: 'సభ్యుడు' },
  roleExpert: { en: 'Expert', te: 'నిపుణుడు' },
  roleModerator: { en: 'Moderator', te: 'మోడరేటర్' },
  roleVendor: { en: 'Vendor', te: 'విక్రేత' },
  roleSupportAgent: { en: 'Support Agent', te: 'సపోర్ట్ ఏజెంట్' },
  roleAdministrator: { en: 'Administrator', te: 'అడ్మినిస్ట్రేటర్' },
  createStaffButton: { en: 'Create account', te: 'ఖాతాను సృష్టించండి' },
  creatingStaff: { en: 'Creating…', te: 'సృష్టిస్తోంది…' },
  existingStaffHeading: { en: 'Everyone registered', te: 'నమోదైన అందరూ' },
  noStaffYet: { en: 'No accounts yet.', te: 'ఇంకా ఖాతాలు లేవు.' },
  couldNotLoadUsers: { en: 'Could not load users.', te: 'వినియోగదారులను లోడ్ చేయలేకపోయాము.' },
  couldNotCreateStaff: { en: 'Could not create this account.', te: 'ఈ ఖాతాను సృష్టించలేకపోయాము.' },
  inactiveBadge: { en: 'Inactive', te: 'నిష్క్రియం' },

  // Administrator — expert credentials
  credentialsPageTitle: { en: 'Expert credentials', te: 'నిపుణుల ధృవపత్రాలు' },
  noPendingCredentials: { en: 'Nothing pending review.', te: 'సమీక్ష కోసం ఏమీ పెండింగ్‌లో లేదు.' },
  qualificationLabel: { en: 'Qualification', te: 'అర్హత' },
  licenseLabel: { en: 'License number', te: 'లైసెన్స్ నంబర్' },
  approveButton: { en: 'Approve', te: 'ఆమోదించండి' },
  rejectButton: { en: 'Reject', te: 'తిరస్కరించండి' },
  rejectReasonField: { en: 'Reason for rejection', te: 'తిరస్కరణకు కారణం' },
  approving: { en: 'Approving…', te: 'ఆమోదిస్తోంది…' },
  rejecting: { en: 'Rejecting…', te: 'తిరస్కరిస్తోంది…' },
  couldNotLoadCredentials: { en: 'Could not load pending credentials.', te: 'పెండింగ్ ధృవపత్రాలను లోడ్ చేయలేకపోయాము.' },
  couldNotVerifyCredential: { en: 'Could not save this decision.', te: 'ఈ నిర్ణయాన్ని సేవ్ చేయలేకపోయాము.' },

  // Administrator — taxonomy
  taxonomyPageTitle: { en: 'Taxonomy', te: 'వర్గీకరణ' },
  cropsHeading: { en: 'Crops', te: 'పంటలు' },
  categoriesHeading: { en: 'Case categories', te: 'కేసు వర్గాలు' },
  tagsHeading: { en: 'Tags', te: 'ట్యాగ్‌లు' },
  regionsHeading: { en: 'Regions', te: 'ప్రాంతాలు' },
  itemNameField: { en: 'Name', te: 'పేరు' },
  stateField: { en: 'State', te: 'రాష్ట్రం' },
  addButton: { en: 'Add', te: 'జోడించండి' },
  adding: { en: 'Adding…', te: 'జోడిస్తోంది…' },
  couldNotLoadTaxonomy: { en: 'Could not load this list.', te: 'ఈ జాబితాను లోడ్ చేయలేకపోయాము.' },
  couldNotAddItem: { en: 'Could not add this.', te: 'దీన్ని జోడించలేకపోయాము.' },

  // Knowledge — shared
  knowledgeEyebrow: { en: 'Knowledge', te: 'జ్ఞానం' },
  articleStatusDraft: { en: 'Draft', te: 'డ్రాఫ్ట్' },
  articleStatusPending: { en: 'Pending review', te: 'సమీక్ష పెండింగ్‌లో' },
  articleStatusPublished: { en: 'Published', te: 'ప్రచురించబడింది' },
  articleStatusRejected: { en: 'Sent back — needs changes', te: 'తిరిగి పంపబడింది — మార్పులు అవసరం' },

  // Expert — My Articles
  myArticlesTitle: { en: 'My articles', te: 'నా వ్యాసాలు' },
  articlesAutoGeneratedNotice: {
    en: 'A draft appears here automatically whenever one of your cases closes as resolved.',
    te: 'మీ కేసుల్లో ఏదైనా పరిష్కరించబడి మూసివేయబడినప్పుడు ఇక్కడ స్వయంచాలకంగా ఒక డ్రాఫ్ట్ కనిపిస్తుంది.',
  },
  noArticlesYet: { en: 'No articles yet — resolve a case to generate one.', te: 'ఇంకా వ్యాసాలు లేవు — ఒకటి రూపొందించడానికి ఒక కేసును పరిష్కరించండి.' },
  couldNotLoadArticles: { en: 'Could not load your articles.', te: 'మీ వ్యాసాలను లోడ్ చేయలేకపోయాము.' },

  // Article form
  articleTitleField: { en: 'Title', te: 'శీర్షిక' },
  articleCropField: { en: 'Crop', te: 'పంట' },
  articleSymptomsField: { en: 'Symptoms', te: 'లక్షణాలు' },
  articleSolutionField: { en: "Expert's advice", te: 'నిపుణుడి సలహా' },
  articleTagsField: { en: 'Tags', te: 'ట్యాగ్‌లు' },
  articleCategoryField: { en: 'Topic (optional)', te: 'అంశం (ఐచ్ఛికం)' },
  submitArticleButton: { en: 'Submit for review', te: 'సమీక్ష కోసం సమర్పించండి' },
  rejectionNoticeLabel: { en: 'Why it was sent back', te: 'ఎందుకు తిరిగి పంపబడింది' },
  couldNotCreateArticle: { en: 'Could not create this article.', te: 'ఈ వ్యాసాన్ని సృష్టించలేకపోయాము.' },
  couldNotSaveArticle: { en: 'Could not save this article.', te: 'ఈ వ్యాసాన్ని సేవ్ చేయలేకపోయాము.' },
  couldNotSubmitArticle: { en: 'Could not submit this article.', te: 'ఈ వ్యాసాన్ని సమర్పించలేకపోయాము.' },
  couldNotLoadArticle: { en: 'Could not load this article.', te: 'ఈ వ్యాసాన్ని లోడ్ చేయలేకపోయాము.' },
  articleNotFoundError: { en: 'Article not found.', te: 'వ్యాసం కనుగొనబడలేదు.' },

  // Moderator — article queue
  articleQueueTitle: { en: 'Article review queue', te: 'వ్యాస సమీక్ష క్యూ' },
  noArticlesInQueue: { en: 'Nothing waiting for review.', te: 'సమీక్ష కోసం ఏమీ లేదు.' },
  couldNotLoadArticleQueue: { en: 'Could not load the review queue.', te: 'సమీక్ష క్యూను లోడ్ చేయలేకపోయాము.' },
  couldNotApproveArticle: { en: 'Could not approve this article.', te: 'ఈ వ్యాసాన్ని ఆమోదించలేకపోయాము.' },
  couldNotRejectArticle: { en: 'Could not send this article back.', te: 'ఈ వ్యాసాన్ని తిరిగి పంపలేకపోయాము.' },

  // Knowledge browse (everyone)
  knowledgeBrowseTitle: { en: 'Knowledge', te: 'జ్ఞానం' },
  browseKnowledgeButton: { en: 'Browse advice', te: 'సలహాలను చూడండి' },
  noPublishedArticles: { en: 'Nothing published yet.', te: 'ఇంకా ఏమీ ప్రచురించలేదు.' },
  couldNotLoadPublished: { en: 'Could not load articles.', te: 'వ్యాసాలను లోడ్ చేయలేకపోయాము.' },
  byAuthorLabel: { en: 'By', te: 'రచయిత' },

  // Generic fallback error (network failure with no server message)
  genericError: { en: 'Something went wrong. Try again.', te: 'ఏదో తప్పు జరిగింది. మళ్ళీ ప్రయత్నించండి.' },
  incorrectCodeError: { en: 'Incorrect code. Try again.', te: 'తప్పు కోడ్. మళ్ళీ ప్రయత్నించండి.' },
  couldNotLoadFarms: { en: 'Could not load your farms.', te: 'మీ పొలాలను లోడ్ చేయలేకపోయాము.' },
  couldNotAddParcel: { en: 'Could not add this parcel.', te: 'ఈ స్థలాన్ని జోడించలేకపోయాము.' },

  // Case -> published Knowledge Article cross-link
  resultingArticleNotice: {
    en: 'This case became a published advisory guide.',
    te: 'ఈ కేసు ప్రచురించబడిన సలహా మార్గదర్శిగా మారింది.',
  },
  viewGuideLink: { en: 'View the guide', te: 'మార్గదర్శిని చూడండి' },

  // Generic list toolbar (sort/filter) controls, reused across list screens
  sortByLabel: { en: 'Sort by', te: 'క్రమం' },
  allOption: { en: 'All', te: 'అన్నీ' },
  searchPlaceholder: { en: 'Search…', te: 'వెతకండి…' },
  sortNewestFirst: { en: 'Newest first', te: 'కొత్తవి మొదట' },
  sortOldestFirst: { en: 'Oldest first', te: 'పాతవి మొదట' },
  sortPriorityFirst: { en: 'Priority first', te: 'ప్రాధాన్యత మొదట' },
  sortStatusAZ: { en: 'Status (A–Z)', te: 'స్థితి (A–Z)' },
  sortTitleAZ: { en: 'Title (A–Z)', te: 'శీర్షిక (A–Z)' },
  sortNameAZ: { en: 'Name (A–Z)', te: 'పేరు (A–Z)' },
  statusFilterLabel: { en: 'Status', te: 'స్థితి' },
  accountStatusFilterLabel: { en: 'Account status', te: 'ఖాతా స్థితి' },
  statusActiveOption: { en: 'Active', te: 'క్రియాశీలం' },
  statusInactiveOption: { en: 'Inactive', te: 'నిష్క్రియం' },
  priorityOnlyFilterLabel: { en: 'Priority only', te: 'ప్రాధాన్యత మాత్రమే' },

  // Administrator — reports (Charter Module 11)
  reportsLinkTitle: { en: 'Reports', te: 'నివేదికలు' },
  reportsLinkDesc: {
    en: 'Case volume, resolution time, and platform activity at a glance.',
    te: 'కేసు పరిమాణం, పరిష్కార సమయం, ప్లాట్‌ఫారమ్ కార్యకలాపాలు ఒక చూపులో.',
  },
  reportsPageTitle: { en: 'Reports', te: 'నివేదికలు' },
  couldNotLoadReports: { en: 'Could not load reports.', te: 'నివేదికలను లోడ్ చేయలేకపోయాము.' },
  reportTotalCasesLabel: { en: 'Total cases', te: 'మొత్తం కేసులు' },
  reportOpenCasesLabel: { en: 'Currently open', te: 'ప్రస్తుతం తెరిచి ఉంది' },
  reportResolvedCasesLabel: { en: 'Resolved', te: 'పరిష్కరించబడింది' },
  reportAbandonedCasesLabel: { en: 'Abandoned', te: 'వదిలివేయబడింది' },
  reportAvgResolutionLabel: { en: 'Average time to resolve', te: 'పరిష్కరించడానికి సగటు సమయం' },
  reportDaysUnit: { en: 'days', te: 'రోజులు' },
  reportCasesByStatusHeading: { en: 'Cases by status', te: 'స్థితి వారీగా కేసులు' },
  reportCasesByCategoryHeading: { en: 'Cases by category', te: 'వర్గం వారీగా కేసులు' },
  reportCasesByCropHeading: { en: 'Cases by crop', te: 'పంట వారీగా కేసులు' },
  reportArticlesByStatusHeading: { en: 'Knowledge articles by status', te: 'స్థితి వారీగా జ్ఞాన వ్యాసాలు' },
  reportExpertWorkloadHeading: { en: 'Expert workload', te: 'నిపుణుల పనిభారం' },
  reportUsersByRoleHeading: { en: 'Accounts by role', te: 'పాత్ర వారీగా ఖాతాలు' },
  reportNoData: { en: 'No data yet.', te: 'ఇంకా డేటా లేదు.' },
  reportAssignedCasesColumn: { en: 'Assigned (total)', te: 'కేటాయించినవి (మొత్తం)' },

  // Notifications (Module 12, in-app channel)
  notificationsEyebrow: { en: 'Notifications', te: 'ప్రకటనలు' },
  notificationsPageTitle: { en: 'Notifications', te: 'ప్రకటనలు' },
  notificationBellLabel: { en: 'Notifications', te: 'ప్రకటనలు' },
  markAllReadButton: { en: 'Mark all as read', te: 'అన్నీ చదివినట్లు గుర్తించండి' },
  markingRead: { en: 'Marking…', te: 'గుర్తిస్తోంది…' },
  noNotifications: { en: 'No notifications yet.', te: 'ఇంకా ప్రకటనలు లేవు.' },
  couldNotLoadNotifications: { en: 'Could not load notifications.', te: 'ప్రకటనలను లోడ్ చేయలేకపోయాము.' },
  showFilterLabel: { en: 'Show', te: 'చూపించు' },
  unreadOnlyOption: { en: 'Unread only', te: 'చదవనివి మాత్రమే' },

  // Article feedback (Charter Section 10.1 cross-cutting Feedback utility)
  feedbackHeading: { en: 'Was this helpful?', te: 'ఇది సహాయకరంగా ఉందా?' },
  markHelpfulButton: { en: 'Helpful', te: 'సహాయకరం' },
  markNotHelpfulButton: { en: 'Not helpful', te: 'సహాయకరం కాదు' },
  ratingFieldLabel: { en: 'Your rating', te: 'మీ రేటింగ్' },
  feedbackCommentField: { en: 'Comment (optional)', te: 'వ్యాఖ్య (ఐచ్ఛికం)' },
  submitFeedbackButton: { en: 'Submit feedback', te: 'అభిప్రాయాన్ని సమర్పించండి' },
  updateFeedbackButton: { en: 'Update feedback', te: 'అభిప్రాయాన్ని నవీకరించండి' },
  submittingFeedback: { en: 'Submitting…', te: 'సమర్పిస్తోంది…' },
  feedbackSavedNotice: { en: 'Thanks — your feedback was saved.', te: 'ధన్యవాదాలు — మీ అభిప్రాయం సేవ్ చేయబడింది.' },
  averageRatingLabel: { en: 'Average rating', te: 'సగటు రేటింగ్' },
  responsesCountLabel: { en: 'responses', te: 'స్పందనలు' },
  couldNotLoadFeedback: { en: 'Could not load feedback.', te: 'అభిప్రాయాన్ని లోడ్ చేయలేకపోయాము.' },
  couldNotSubmitFeedback: { en: 'Could not submit feedback.', te: 'అభిప్రాయాన్ని సమర్పించలేకపోయాము.' },

  // Moderator — flagged articles (low-rated, still published)
  flaggedArticlesHeading: { en: 'Flagged for review', te: 'సమీక్ష కోసం ఫ్లాగ్ చేయబడింది' },
  flagReasonLabel: { en: 'Why it was flagged', te: 'ఎందుకు ఫ్లాగ్ చేయబడింది' },
  clearFlagButton: { en: 'Clear flag', te: 'ఫ్లాగ్‌ను తీసివేయండి' },
  clearingFlag: { en: 'Clearing…', te: 'తీసివేస్తోంది…' },
  sendBackButton: { en: 'Send back for revision', te: 'సవరణ కోసం తిరిగి పంపండి' },
  sendingBack: { en: 'Sending back…', te: 'తిరిగి పంపుతోంది…' },
  sendBackReasonField: { en: 'Reason for sending back', te: 'తిరిగి పంపడానికి కారణం' },
  noFlaggedArticles: { en: 'Nothing flagged.', te: 'ఏమీ ఫ్లాగ్ చేయబడలేదు.' },
  couldNotLoadFlagged: { en: 'Could not load flagged articles.', te: 'ఫ్లాగ్ చేసిన వ్యాసాలను లోడ్ చేయలేకపోయాము.' },
  couldNotClearFlag: { en: 'Could not clear this flag.', te: 'ఈ ఫ్లాగ్‌ను తీసివేయలేకపోయాము.' },
  couldNotSendBack: { en: 'Could not send this back.', te: 'దీన్ని తిరిగి పంపలేకపోయాము.' },

  // Bookmarks + Recently Viewed (Charter Section 10.1)
  bookmarkButton: { en: 'Bookmark', te: 'బుక్‌మార్క్' },
  bookmarkedButton: { en: 'Bookmarked', te: 'బుక్‌మార్క్ చేయబడింది' },
  couldNotToggleBookmark: { en: 'Could not update this bookmark.', te: 'ఈ బుక్‌మార్క్‌ను నవీకరించలేకపోయాము.' },
  bookmarkedOnlyOption: { en: 'Bookmarked only', te: 'బుక్‌మార్క్ చేసినవి మాత్రమే' },
  recentlyViewedHeading: { en: 'Recently viewed', te: 'ఇటీవల చూసినవి' },

  // Learning Management (Module 5, shell)
  coursesEyebrow: { en: 'Courses', te: 'కోర్సులు' },
  coursesBrowseTitle: { en: 'Courses', te: 'కోర్సులు' },
  coursesManageTitle: { en: 'Manage courses', te: 'కోర్సులను నిర్వహించండి' },
  noCoursesYet: { en: 'Nothing here yet.', te: 'ఇంకా ఇక్కడ ఏమీ లేదు.' },
  couldNotLoadCourses: { en: 'Could not load courses.', te: 'కోర్సులను లోడ్ చేయలేకపోయాము.' },
  couldNotLoadCourse: { en: 'Could not load this course.', te: 'ఈ కోర్సును లోడ్ చేయలేకపోయాము.' },
  courseNotFoundError: { en: 'Course not found.', te: 'కోర్సు కనుగొనబడలేదు.' },
  courseTitleField: { en: 'Title', te: 'శీర్షిక' },
  courseDescriptionField: { en: 'Description', te: 'వివరణ' },
  createCourseButton: { en: 'Create course', te: 'కోర్సును సృష్టించండి' },
  creatingCourse: { en: 'Creating…', te: 'సృష్టిస్తోంది…' },
  couldNotCreateCourse: { en: 'Could not create this course.', te: 'ఈ కోర్సును సృష్టించలేకపోయాము.' },
  couldNotSaveCourse: { en: 'Could not save this course.', te: 'ఈ కోర్సును సేవ్ చేయలేకపోయాము.' },
  courseStatusDraft: { en: 'Draft', te: 'డ్రాఫ్ట్' },
  courseStatusPublished: { en: 'Published', te: 'ప్రచురించబడింది' },
  publishButton: { en: 'Publish', te: 'ప్రచురించండి' },
  publishingCourse: { en: 'Publishing…', te: 'ప్రచురిస్తోంది…' },
  unpublishButton: { en: 'Unpublish', te: 'ప్రచురణ తీసివేయండి' },
  unpublishingCourse: { en: 'Unpublishing…', te: 'ప్రచురణ తీసివేస్తోంది…' },
  couldNotChangeCourseStatus: { en: 'Could not change this course\'s status.', te: 'ఈ కోర్సు స్థితిని మార్చలేకపోయాము.' },
  lessonsHeading: { en: 'Lessons', te: 'పాఠాలు' },
  noLessonsYet: { en: 'No lessons yet.', te: 'ఇంకా పాఠాలు లేవు.' },
  addLessonButton: { en: 'Add lesson', te: 'పాఠాన్ని జోడించండి' },
  addingLesson: { en: 'Adding…', te: 'జోడిస్తోంది…' },
  couldNotAddLesson: { en: 'Could not add this lesson.', te: 'ఈ పాఠాన్ని జోడించలేకపోయాము.' },
  lessonTitleField: { en: 'Lesson title', te: 'పాఠం శీర్షిక' },
  lessonContentTypeField: { en: 'Content type', te: 'కంటెంట్ రకం' },
  contentTypeVideo: { en: 'Video', te: 'వీడియో' },
  contentTypeAudio: { en: 'Audio', te: 'ఆడియో' },
  contentTypePdf: { en: 'PDF', te: 'PDF' },
  contentTypeAssignment: { en: 'Assignment', te: 'అసైన్‌మెంట్' },
  assignmentInstructionsField: { en: 'Assignment instructions', te: 'అసైన్‌మెంట్ సూచనలు' },
  uploadContentButton: { en: 'Upload file', te: 'ఫైల్ అప్‌లోడ్ చేయండి' },
  uploadingContent: { en: 'Uploading…', te: 'అప్‌లోడ్ చేస్తోంది…' },
  couldNotUploadContent: { en: 'Could not upload this file.', te: 'ఈ ఫైల్‌ను అప్‌లోడ్ చేయలేకపోయాము.' },
  noContentUploadedYet: { en: 'No file uploaded yet.', te: 'ఇంకా ఫైల్ అప్‌లోడ్ చేయలేదు.' },
  openContentLink: { en: 'Open', te: 'తెరవండి' },
  lessonCompletedBadge: { en: 'Completed', te: 'పూర్తయింది' },
  markCompleteButton: { en: 'Mark complete', te: 'పూర్తయినట్లు గుర్తించండి' },
  markingComplete: { en: 'Marking…', te: 'గుర్తిస్తోంది…' },
  couldNotMarkComplete: { en: 'Could not mark this lesson complete.', te: 'ఈ పాఠాన్ని పూర్తయినట్లు గుర్తించలేకపోయాము.' },
  lessonNotFoundError: { en: 'Lesson not found.', te: 'పాఠం కనుగొనబడలేదు.' },
  courseProgressLabel: { en: 'Progress', te: 'పురోగతి' },
  certificateEarnedNotice: { en: 'Certificate earned!', te: 'సర్టిఫికేట్ సంపాదించారు!' },
  myCertificatesHeading: { en: 'My certificates', te: 'నా సర్టిఫికెట్లు' },
  noCertificatesYet: { en: 'No certificates yet.', te: 'ఇంకా సర్టిఫికెట్లు లేవు.' },

  // Soil Laboratory (Module 7, generic — no lab partner integrated)
  soilSamplesEyebrow: { en: 'Soil Testing', te: 'నేల పరీక్ష' },
  soilSamplesTitle: { en: 'Soil Testing', te: 'నేల పరీక్ష' },
  newSampleButton: { en: 'Request a soil test', te: 'నేల పరీక్షను అభ్యర్థించండి' },
  creatingSample: { en: 'Submitting…', te: 'సమర్పిస్తోంది…' },
  couldNotCreateSample: { en: 'Could not submit this sample.', te: 'ఈ నమూనాను సమర్పించలేకపోయాము.' },
  couldNotLoadSamples: { en: 'Could not load soil samples.', te: 'నేల నమూనాలను లోడ్ చేయలేకపోయాము.' },
  couldNotLoadSample: { en: 'Could not load this sample.', te: 'ఈ నమూనాను లోడ్ చేయలేకపోయాము.' },
  noSamplesYet: { en: 'No soil samples yet.', te: 'ఇంకా నేల నమూనాలు లేవు.' },
  sampleNotFoundError: { en: 'Sample not found.', te: 'నమూనా కనుగొనబడలేదు.' },
  collectionVideoConfirmLabel: {
    en: 'I have watched the sample collection instructions and collected the sample correctly',
    te: 'నేను నమూనా సేకరణ సూచనలను చూశాను మరియు నమూనాను సరిగ్గా సేకరించాను',
  },
  linkToCaseField: { en: 'Link to a case (optional)', te: 'కేసుకు లింక్ చేయండి (ఐచ్ఛికం)' },
  sampleStatusCreated: { en: 'Submitted', te: 'సమర్పించబడింది' },
  sampleStatusDispatched: { en: 'Dispatched to lab', te: 'ల్యాబ్‌కు పంపబడింది' },
  sampleStatusReceived: { en: 'Received by lab', te: 'ల్యాబ్ ద్వారా స్వీకరించబడింది' },
  sampleStatusTested: { en: 'Testing complete', te: 'పరీక్ష పూర్తయింది' },
  sampleStatusReportAvailable: { en: 'Report available', te: 'నివేదిక అందుబాటులో ఉంది' },
  dispatchButton: { en: 'Mark dispatched', te: 'పంపినట్లు గుర్తించండి' },
  dispatchingSample: { en: 'Marking…', te: 'గుర్తిస్తోంది…' },
  markReceivedButton: { en: 'Mark received', te: 'స్వీకరించినట్లు గుర్తించండి' },
  markTestedButton: { en: 'Mark tested', te: 'పరీక్షించినట్లు గుర్తించండి' },
  uploadReportButton: { en: 'Upload report', te: 'నివేదికను అప్‌లోడ్ చేయండి' },
  uploadingReport: { en: 'Uploading…', te: 'అప్‌లోడ్ చేస్తోంది…' },
  couldNotAdvanceSample: { en: 'Could not update this sample.', te: 'ఈ నమూనాను నవీకరించలేకపోయాము.' },
  couldNotUploadReport: { en: 'Could not upload this report.', te: 'ఈ నివేదికను అప్‌లోడ్ చేయలేకపోయాము.' },
  viewReportLink: { en: 'View report', te: 'నివేదికను చూడండి' },
  sampleQueueTitle: { en: 'Soil sample queue', te: 'నేల నమూనా క్యూ' },

  // Marketplace (Modules 6/9, payment deferred — Cash on Delivery only)
  marketplaceEyebrow: { en: 'Marketplace', te: 'మార్కెట్‌ప్లేస్' },
  marketplaceTitle: { en: 'Marketplace', te: 'మార్కెట్‌ప్లేస్' },
  noProductsYet: { en: 'No products yet.', te: 'ఇంకా ఉత్పత్తులు లేవు.' },
  couldNotLoadProducts: { en: 'Could not load products.', te: 'ఉత్పత్తులను లోడ్ చేయలేకపోయాము.' },
  couldNotLoadProduct: { en: 'Could not load this product.', te: 'ఈ ఉత్పత్తిని లోడ్ చేయలేకపోయాము.' },
  productNotFoundError: { en: 'Product not found.', te: 'ఉత్పత్తి కనుగొనబడలేదు.' },
  productPriceLabel: { en: 'Price', te: 'ధర' },
  productStockLabel: { en: 'In stock', te: 'స్టాక్‌లో ఉంది' },
  outOfStockNotice: { en: 'Out of stock', te: 'స్టాక్ లేదు' },
  quantityLabel: { en: 'Quantity', te: 'పరిమాణం' },
  addToCartButton: { en: 'Add to cart', te: 'కార్ట్‌కు జోడించండి' },
  addingToCart: { en: 'Adding…', te: 'జోడిస్తోంది…' },
  couldNotAddToCart: { en: 'Could not add this to your cart.', te: 'దీన్ని మీ కార్ట్‌కు జోడించలేకపోయాము.' },
  viewCartButton: { en: 'View cart', te: 'కార్ట్‌ను చూడండి' },
  cartTitle: { en: 'Cart', te: 'కార్ట్' },
  cartEmptyNotice: { en: 'Your cart is empty.', te: 'మీ కార్ట్ ఖాళీగా ఉంది.' },
  couldNotLoadCart: { en: 'Could not load your cart.', te: 'మీ కార్ట్‌ను లోడ్ చేయలేకపోయాము.' },
  removeButton: { en: 'Remove', te: 'తీసివేయండి' },
  removingItem: { en: 'Removing…', te: 'తీసివేస్తోంది…' },
  cartTotalLabel: { en: 'Total', te: 'మొత్తం' },
  proceedToCheckoutButton: { en: 'Proceed to checkout', te: 'చెక్అవుట్‌కు వెళ్లండి' },
  checkoutTitle: { en: 'Checkout', te: 'చెక్అవుట్' },
  deliveryAddressField: { en: 'Delivery address', te: 'డెలివరీ చిరునామా' },
  paymentMethodLabel: { en: 'Payment method', te: 'చెల్లింపు విధానం' },
  cashOnDeliveryNotice: {
    en: 'Cash on Delivery only — online payment is not available yet.',
    te: 'డెలివరీ సమయంలో నగదు మాత్రమే — ఆన్‌లైన్ చెల్లింపు ఇంకా అందుబాటులో లేదు.',
  },
  placeOrderButton: { en: 'Place order', te: 'ఆర్డర్ చేయండి' },
  placingOrder: { en: 'Placing order…', te: 'ఆర్డర్ చేస్తోంది…' },
  couldNotCheckout: { en: 'Could not place this order.', te: 'ఈ ఆర్డర్‌ను చేయలేకపోయాము.' },
  myOrdersTitle: { en: 'My orders', te: 'నా ఆర్డర్‌లు' },
  ordersQueueTitle: { en: 'Order queue', te: 'ఆర్డర్ క్యూ' },
  noOrdersYet: { en: 'No orders yet.', te: 'ఇంకా ఆర్డర్‌లు లేవు.' },
  couldNotLoadOrders: { en: 'Could not load orders.', te: 'ఆర్డర్‌లను లోడ్ చేయలేకపోయాము.' },
  couldNotLoadOrder: { en: 'Could not load this order.', te: 'ఈ ఆర్డర్‌ను లోడ్ చేయలేకపోయాము.' },
  orderNotFoundError: { en: 'Order not found.', te: 'ఆర్డర్ కనుగొనబడలేదు.' },
  orderStatusPlaced: { en: 'Placed', te: 'చేయబడింది' },
  orderStatusConfirmed: { en: 'Confirmed', te: 'నిర్ధారించబడింది' },
  orderStatusShipped: { en: 'Shipped', te: 'పంపబడింది' },
  orderStatusDelivered: { en: 'Delivered', te: 'డెలివరీ చేయబడింది' },
  orderStatusCancelled: { en: 'Cancelled', te: 'రద్దు చేయబడింది' },
  confirmOrderButton: { en: 'Confirm order', te: 'ఆర్డర్‌ను నిర్ధారించండి' },
  shipOrderButton: { en: 'Mark shipped', te: 'పంపినట్లు గుర్తించండి' },
  deliverOrderButton: { en: 'Mark delivered', te: 'డెలివరీ అయినట్లు గుర్తించండి' },
  cancelOrderButton: { en: 'Cancel order', te: 'ఆర్డర్‌ను రద్దు చేయండి' },
  updatingOrder: { en: 'Updating…', te: 'నవీకరిస్తోంది…' },
  couldNotUpdateOrder: { en: 'Could not update this order.', te: 'ఈ ఆర్డర్‌ను నవీకరించలేకపోయాము.' },
  wishlistButton: { en: 'Add to wishlist', te: 'కోరికల జాబితాకు జోడించండి' },
  wishlistedButton: { en: 'In wishlist', te: 'కోరికల జాబితాలో ఉంది' },
  couldNotToggleWishlist: { en: 'Could not update your wishlist.', te: 'మీ కోరికల జాబితాను నవీకరించలేకపోయాము.' },
  myWishlistHeading: { en: 'My wishlist', te: 'నా కోరికల జాబితా' },
  reviewsHeading: { en: 'Reviews', te: 'సమీక్షలు' },
  writeReviewHeading: { en: 'Write a review', te: 'సమీక్ష రాయండి' },
  submitReviewButton: { en: 'Submit review', te: 'సమీక్షను సమర్పించండి' },
  updateReviewButton: { en: 'Update review', te: 'సమీక్షను నవీకరించండి' },
  submittingReview: { en: 'Submitting…', te: 'సమర్పిస్తోంది…' },
  couldNotSubmitReview: { en: 'Could not submit this review.', te: 'ఈ సమీక్షను సమర్పించలేకపోయాము.' },
  noReviewsYet: { en: 'No reviews yet.', te: 'ఇంకా సమీక్షలు లేవు.' },
  vendorDashboardTitle: { en: 'Vendor', te: 'విక్రేత' },
  vendorProfileHeading: { en: 'Vendor profile', te: 'విక్రేత ప్రొఫైల్' },
  businessNameField: { en: 'Business name', te: 'వ్యాపార పేరు' },
  businessDescriptionField: { en: 'Description (optional)', te: 'వివరణ (ఐచ్ఛికం)' },
  submitVendorProfileButton: { en: 'Submit for approval', te: 'ఆమోదం కోసం సమర్పించండి' },
  submittingVendorProfile: { en: 'Submitting…', te: 'సమర్పిస్తోంది…' },
  couldNotSubmitVendorProfile: { en: 'Could not submit your profile.', te: 'మీ ప్రొఫైల్‌ను సమర్పించలేకపోయాము.' },
  vendorApprovedNotice: { en: 'Your vendor account is approved.', te: 'మీ విక్రేత ఖాతా ఆమోదించబడింది.' },
  vendorPendingNotice: { en: 'Your vendor profile is awaiting approval.', te: 'మీ విక్రేత ప్రొఫైల్ ఆమోదం కోసం వేచి ఉంది.' },
  myProductsHeading: { en: 'My products', te: 'నా ఉత్పత్తులు' },
  createProductButton: { en: 'Add product', te: 'ఉత్పత్తిని జోడించండి' },
  creatingProduct: { en: 'Adding…', te: 'జోడిస్తోంది…' },
  couldNotCreateProduct: { en: 'Could not create this product.', te: 'ఈ ఉత్పత్తిని సృష్టించలేకపోయాము.' },
  couldNotUpdateProduct: { en: 'Could not save changes.', te: 'మార్పులను సేవ్ చేయలేకపోయాము.' },
  productNameField: { en: 'Product name', te: 'ఉత్పత్తి పేరు' },
  productDescriptionField: { en: 'Description', te: 'వివరణ' },
  productPriceField: { en: 'Price (₹)', te: 'ధర (₹)' },
  productUnitField: { en: 'Unit (e.g. per kg, per bag)', te: 'యూనిట్ (ఉదా. కిలోకు, బస్తాకు)' },
  productStockField: { en: 'Stock quantity', te: 'స్టాక్ పరిమాణం' },
  uploadImageButton: { en: 'Upload image', te: 'చిత్రాన్ని అప్‌లోడ్ చేయండి' },
  uploadingImage: { en: 'Uploading…', te: 'అప్‌లోడ్ చేస్తోంది…' },
  couldNotUploadImage: { en: 'Could not upload this image.', te: 'ఈ చిత్రాన్ని అప్‌లోడ్ చేయలేకపోయాము.' },
  activeStatusLabel: { en: 'Active', te: 'క్రియాశీలం' },
  inactiveStatusLabel: { en: 'Inactive', te: 'నిష్క్రియం' },
  deactivateButton: { en: 'Deactivate', te: 'నిష్క్రియం చేయండి' },
  activateButton: { en: 'Activate', te: 'క్రియాశీలం చేయండి' },
  vendorApprovalsTitle: { en: 'Vendor approvals', te: 'విక్రేత ఆమోదాలు' },
  noVendorsPending: { en: 'Nothing pending review.', te: 'సమీక్ష కోసం ఏమీ పెండింగ్‌లో లేదు.' },
  couldNotLoadVendors: { en: 'Could not load vendors.', te: 'విక్రేతలను లోడ్ చేయలేకపోయాము.' },
  approveVendorButton: { en: 'Approve', te: 'ఆమోదించండి' },
  rejectVendorButton: { en: 'Reject', te: 'తిరస్కరించండి' },
  couldNotVerifyVendor: { en: 'Could not save this decision.', te: 'ఈ నిర్ణయాన్ని సేవ్ చేయలేకపోయాము.' },
  productsManageTitle: { en: 'Manage products', te: 'ఉత్పత్తులను నిర్వహించండి' },
  productCategoriesHeading: { en: 'Product categories', te: 'ఉత్పత్తి వర్గాలు' },
  vendorFilterLabel: { en: 'Seller', te: 'విక్రేత' },
  platformSoldOption: { en: 'Platform', te: 'ప్లాట్‌ఫారమ్' },

  // Media library
  mediaLibraryTitle: { en: 'Media library', te: 'మీడియా లైబ్రరీ' },
  mediaNavTitle: { en: 'Media library', te: 'మీడియా లైబ్రరీ' },
  mediaPreviewColumn: { en: 'Preview', te: 'ప్రివ్యూ' },
  mediaKindColumn: { en: 'Type', te: 'రకం' },
  mediaSourceColumn: { en: 'Source', te: 'మూలం' },
  mediaOwnerColumn: { en: 'Belongs to', te: 'దీనికి చెందినది' },
  mediaDateColumn: { en: 'Date', te: 'తేదీ' },
  mediaOpenLink: { en: 'Open', te: 'తెరవండి' },
  noMediaYet: { en: 'No uploads yet.', te: 'ఇంకా అప్‌లోడ్‌లు లేవు.' },
  couldNotLoadMedia: { en: 'Could not load the media library.', te: 'మీడియా లైబ్రరీని లోడ్ చేయలేకపోయాము.' },
  mediaKindImage: { en: 'Image', te: 'చిత్రం' },
  mediaKindVideo: { en: 'Video', te: 'వీడియో' },
  mediaKindAudio: { en: 'Audio', te: 'ఆడియో' },
  mediaKindPdf: { en: 'PDF', te: 'PDF' },
  mediaKindOther: { en: 'Other', te: 'ఇతర' },
  mediaSourceCase: { en: 'Case evidence', te: 'కేసు ఆధారాలు' },
  mediaSourceArticle: { en: 'Article evidence', te: 'వ్యాస ఆధారాలు' },
  mediaSourceLesson: { en: 'Lesson', te: 'పాఠం' },
  mediaSourceSoil: { en: 'Soil report', te: 'నేల నివేదిక' },
  mediaSourceProduct: { en: 'Product image', te: 'ఉత్పత్తి చిత్రం' },

  // Account management
  deactivateAccountButton: { en: 'Deactivate', te: 'నిష్క్రియం చేయండి' },
  reactivateAccountButton: { en: 'Reactivate', te: 'మళ్ళీ క్రియాశీలం చేయండి' },
  couldNotUpdateAccount: { en: 'Could not update this account.', te: 'ఈ ఖాతాను నవీకరించలేకపోయాము.' },
  changePasswordTitle: { en: 'Change password', te: 'పాస్‌వర్డ్ మార్చండి' },
  currentPasswordField: { en: 'Current password', te: 'ప్రస్తుత పాస్‌వర్డ్' },
  newPasswordField: { en: 'New password (8+ characters)', te: 'కొత్త పాస్‌వర్డ్ (8+ అక్షరాలు)' },
  changePasswordButton: { en: 'Change password', te: 'పాస్‌వర్డ్ మార్చండి' },
  passwordChangedNotice: { en: 'Password changed. You will be asked to log in again.', te: 'పాస్‌వర్డ్ మార్చబడింది. మీరు మళ్ళీ లాగిన్ అవ్వాలి.' },
  couldNotChangePassword: { en: 'Could not change your password.', te: 'మీ పాస్‌వర్డ్‌ను మార్చలేకపోయాము.' },
  accountNavTitle: { en: 'Account', te: 'ఖాతా' },

  // HARIHARAA Natural Food Stores — nav labels
  hariharaaShopNavTitle: { en: 'Shop', te: 'షాప్' },
  hariharaaSubscriptionNavTitle: { en: 'My subscription', te: 'నా సభ్యత్వం' },
  dispatchQueueNavTitle: { en: 'Dispatch queue', te: 'డిస్పాచ్ క్యూ' },
  hariharaaSubscriptionsAdminNavTitle: { en: 'HARIHARAA subscriptions', te: 'HARIHARAA సభ్యత్వాలు' },
  hariharaaSettingsAdminNavTitle: { en: 'HARIHARAA settings', te: 'HARIHARAA సెట్టింగ్‌లు' },

  // HARIHARAA — public landing page
  hariharaaBrandTagline: { en: 'Real natural food, from our kitchen to yours', te: 'నిజమైన సహజ ఆహారం, మా వంటగది నుండి మీ వరకు' },
  hariharaaTestimonialsHeading: { en: 'What our customers say', te: 'మా కస్టమర్లు ఏమంటున్నారు' },
  hariharaaTestimonial1: { en: 'Customer story 1', te: 'కస్టమర్ కథ 1' },
  hariharaaTestimonial2: { en: 'Customer story 2', te: 'కస్టమర్ కథ 2' },
  hariharaaTestimonial3: { en: 'Customer story 3', te: 'కస్టమర్ కథ 3' },
  hariharaaTestimonial4: { en: 'Customer story 4', te: 'కస్టమర్ కథ 4' },
  hariharaaTestimonial5: { en: 'Customer story 5', te: 'కస్టమర్ కథ 5' },
  hariharaaTestimonial6: { en: 'Customer story 6', te: 'కస్టమర్ కథ 6' },
  hariharaaSubscribeHeading: { en: 'Subscribe to shop', te: 'షాపింగ్ చేయడానికి సభ్యత్వం తీసుకోండి' },
  hariharaaSubscribeDescription: {
    en: 'Register first, then pay the monthly subscription by UPI. We activate your access once we verify your payment.',
    te: 'ముందుగా నమోదు చేసుకోండి, తర్వాత UPI ద్వారా నెలవారీ సభ్యత్వాన్ని చెల్లించండి. మీ చెల్లింపును ధృవీకరించిన తర్వాత మేము మీ ప్రాప్యతను యాక్టివేట్ చేస్తాము.',
  },
  hariharaaScanToPayHint: { en: 'Scan with any UPI app', te: 'ఏదైనా UPI యాప్‌తో స్కాన్ చేయండి' },
  hariharaaPriceLabel: { en: 'Monthly subscription', te: 'నెలవారీ సభ్యత్వం' },
  hariharaaRegisterCta: { en: 'Register to subscribe', te: 'సభ్యత్వం కోసం నమోదు చేసుకోండి' },
  hariharaaSettingsUnavailable: {
    en: 'Subscription details are not available right now — check back soon.',
    te: 'సభ్యత్వ వివరాలు ప్రస్తుతం అందుబాటులో లేవు — త్వరలో మళ్ళీ చూడండి.',
  },

  // HARIHARAA — registration (forcedRole="CUSTOMER" on the shared RegisterPage)
  hariharaaRegisterEyebrow: { en: 'HARIHARAA', te: 'HARIHARAA' },
  hariharaaCreateAccountTitle: { en: 'Create your HARIHARAA account', te: 'మీ HARIHARAA ఖాతాను సృష్టించండి' },

  // HARIHARAA — customer subscription status + claim
  hariharaaSubscriptionTitle: { en: 'My subscription', te: 'నా సభ్యత్వం' },
  hariharaaStatusLabel: { en: 'Status', te: 'స్థితి' },
  hariharaaStatusNotSubmitted: {
    en: 'Not paid yet — pay below to unlock checkout and farm advice.',
    te: 'ఇంకా చెల్లించలేదు — చెక్అవుట్, వ్యవసాయ సలహాను అన్‌లాక్ చేయడానికి క్రింద చెల్లించండి.',
  },
  hariharaaStatusPendingReview: {
    en: 'Payment submitted — waiting for us to verify it.',
    te: 'చెల్లింపు సమర్పించబడింది — మేము దాన్ని ధృవీకరించే వరకు వేచి ఉంది.',
  },
  hariharaaStatusActive: { en: 'Active — checkout and all farm-advice features are unlocked.', te: 'యాక్టివ్ — చెక్అవుట్ మరియు అన్ని వ్యవసాయ సలహా సౌకర్యాలు అన్‌లాక్ అయ్యాయి.' },
  hariharaaStatusFree: { en: 'Free access — checkout and all farm-advice features are unlocked.', te: 'ఉచిత ప్రాప్యత — చెక్అవుట్ మరియు అన్ని వ్యవసాయ సలహా సౌకర్యాలు అన్‌లాక్ అయ్యాయి.' },
  hariharaaFreeUntilLabel: { en: 'Free access until', te: 'వరకు ఉచిత ప్రాప్యత' },
  hariharaaStatusRejected: {
    en: 'We could not verify your last payment — see the reason below, then pay or resubmit.',
    te: 'మీ చివరి చెల్లింపును మేము ధృవీకరించలేకపోయాము — క్రింద కారణం చూడండి, తర్వాత చెల్లించండి లేదా మళ్ళీ సమర్పించండి.',
  },
  hariharaaStatusExpired: { en: 'Expired — renew below to unlock checkout and farm advice again.', te: 'గడువు ముగిసింది — చెక్అవుట్, వ్యవసాయ సలహాను మళ్ళీ అన్‌లాక్ చేయడానికి క్రింద పునరుద్ధరించండి.' },
  hariharaaActiveUntilLabel: { en: 'Active until', te: 'వరకు యాక్టివ్' },
  hariharaaPayNowButton: { en: 'Pay now', te: 'ఇప్పుడే చెల్లించండి' },
  // Kept short on purpose: the strip shows English / Telugu on one line on every screen.
  paymentStripNotPaid: { en: 'Membership payment pending — unlock checkout and farm advice', te: 'సభ్యత్వ చెల్లింపు పెండింగ్ — చెక్అవుట్, వ్యవసాయ సలహా అన్‌లాక్ చేయండి' },
  paymentStripAwaiting: { en: 'Payment submitted — being verified', te: 'చెల్లింపు సమర్పించబడింది — ధృవీకరణలో ఉంది' },
  paymentStripRejected: { en: 'Payment not verified — pay again', te: 'చెల్లింపు ధృవీకరించబడలేదు — మళ్ళీ చెల్లించండి' },
  paymentStripExpired: { en: 'Membership expired — renew', te: 'సభ్యత్వం గడువు ముగిసింది — పునరుద్ధరించండి' },
  paymentStripPay: { en: 'Pay', te: 'చెల్లించు' },
  paymentStripView: { en: 'View', te: 'చూడండి' },
  hariharaaStartingPayment: { en: 'Preparing…', te: 'సిద్ధం చేస్తోంది…' },
  hariharaaPayStepsTitle: { en: 'After you pay', te: 'మీరు చెల్లించిన తర్వాత' },
  hariharaaMonthlyPrice: { en: 'per month', te: 'నెలకు' },
  hariharaaYourIdLabel: { en: 'Your customer ID', te: 'మీ కస్టమర్ ID' },
  hariharaaYourIdHint: {
    en: 'Quote this ID if you ever contact us about a payment. It is already in your payment note.',
    te: 'చెల్లింపు గురించి మమ్మల్ని సంప్రదిస్తే ఈ IDని చెప్పండి. ఇది ఇప్పటికే మీ చెల్లింపు నోట్‌లో ఉంది.',
  },
  hariharaaLastRejectionLabel: { en: 'Reason', te: 'కారణం' },
  hariharaaPayVerifyingNotice: {
    en: 'We will verify your payment against our bank account and unlock the shop. You will get a notification.',
    te: 'మేము మీ చెల్లింపును మా బ్యాంక్ ఖాతాలో ధృవీకరించి షాప్‌ను అన్‌లాక్ చేస్తాము. మీకు నోటిఫికేషన్ వస్తుంది.',
  },
  hariharaaCustomerIdLabel: { en: 'Customer ID', te: 'కస్టమర్ ID' },
  couldNotStartPayment: { en: 'Could not start the payment.', te: 'చెల్లింపును ప్రారంభించలేకపోయాము.' },
  accountIdLabel: { en: 'Your ID', te: 'మీ ID' },
  hariharaaPaymentReferenceField: { en: 'Payment reference / UTR number', te: 'చెల్లింపు రిఫరెన్స్ / UTR నంబర్' },
  hariharaaNoteField: { en: 'Note (optional)', te: 'గమనిక (ఐచ్ఛికం)' },
  hariharaaSubmitClaimButton: { en: 'Submit for review', te: 'సమీక్ష కోసం సమర్పించండి' },
  hariharaaResubmitClaimButton: { en: 'Resubmit for review', te: 'మళ్ళీ సమీక్ష కోసం సమర్పించండి' },
  hariharaaSubmittingClaim: { en: 'Submitting…', te: 'సమర్పిస్తోంది…' },
  couldNotLoadHariharaaSubscription: { en: 'Could not load your subscription status.', te: 'మీ సభ్యత్వ స్థితిని లోడ్ చేయలేకపోయాము.' },
  couldNotSubmitHariharaaClaim: { en: 'Could not submit your claim.', te: 'మీ దావాను సమర్పించలేకపోయాము.' },

  // HARIHARAA — admin subscription review
  hariharaaSubscriptionsAdminTitle: { en: 'HARIHARAA subscriptions', te: 'HARIHARAA సభ్యత్వాలు' },
  noHariharaaSubscriptionsPending: { en: 'Nothing pending review.', te: 'సమీక్ష కోసం ఏమీ పెండింగ్‌లో లేదు.' },
  couldNotLoadHariharaaSubscriptions: { en: 'Could not load pending claims.', te: 'పెండింగ్ దావాలను లోడ్ చేయలేకపోయాము.' },
  couldNotReviewHariharaaSubscription: { en: 'Could not save this decision.', te: 'ఈ నిర్ణయాన్ని సేవ్ చేయలేకపోయాము.' },
  hariharaaPaymentReferenceLabel: { en: 'Payment reference', te: 'చెల్లింపు రిఫరెన్స్' },

  // HARIHARAA — admin settings
  hariharaaSettingsAdminTitle: { en: 'HARIHARAA settings', te: 'HARIHARAA సెట్టింగ్‌లు' },
  hariharaaPriceField: { en: 'Monthly subscription price (₹)', te: 'నెలవారీ సభ్యత్వ ధర (₹)' },
  hariharaaPayeeNameField: { en: 'Payee name (shown on QR)', te: 'చెల్లింపుదారు పేరు (QRలో చూపబడుతుంది)' },
  hariharaaPrimaryUpiField: { en: 'Primary UPI ID', te: 'ప్రధాన UPI ID' },
  hariharaaSecondaryUpiField: { en: 'Secondary UPI ID (optional)', te: 'ద్వితీయ UPI ID (ఐచ్ఛికం)' },
  hariharaaVendorIdField: { en: 'HARIHARAA vendor profile ID', te: 'HARIHARAA విక్రేత ప్రొఫైల్ ID' },
  hariharaaVendorIdHint: {
    en: "The VendorProfile ID whose products make up HARIHARAA's catalog — copy it from that vendor's row in Manage products.",
    te: 'HARIHARAA కేటలాగ్‌ను రూపొందించే ఉత్పత్తులు ఉన్న విక్రేత ప్రొఫైల్ ID — దాన్ని ఉత్పత్తులను నిర్వహించండి‌లోని ఆ విక్రేత వరుస నుండి కాపీ చేయండి.',
  },
  hariharaaUpiAidField: { en: 'Google Pay merchant ID (aid)', te: 'Google Pay మర్చంట్ ID (aid)' },
  hariharaaUpiAidHint: {
    en: 'The "aid=" value inside your own merchant QR (the text after aid= in the QR payload). Without it the payment may be treated as person-to-person.',
    te: 'మీ స్వంత మర్చంట్ QRలోని "aid=" విలువ (QR పేలోడ్‌లో aid= తర్వాత ఉన్న టెక్స్ట్). ఇది లేకపోతే చెల్లింపు వ్యక్తి-నుండి-వ్యక్తికి చెల్లింపుగా పరిగణించబడవచ్చు.',
  },
  hariharaaExpectedAmountLabel: { en: 'Amount expected', te: 'ఆశించిన మొత్తం' },
  hariharaaExpiredOnLabel: { en: 'Expired on', te: 'గడువు ముగిసిన తేదీ' },
  hariharaaPayHeading: { en: 'Pay to subscribe', te: 'సభ్యత్వం కోసం చెల్లించండి' },
  hariharaaRenewHeading: { en: 'Renew your subscription', te: 'మీ సభ్యత్వాన్ని పునరుద్ధరించండి' },
  hariharaaPayThenSubmitHint: {
    en: 'After paying, enter the payment reference (UTR) from your UPI app below.',
    te: 'చెల్లించిన తర్వాత, మీ UPI యాప్‌లోని చెల్లింపు రిఫరెన్స్ (UTR)ని క్రింద నమోదు చేయండి.',
  },
  hariharaaSubscriptionNeeded: {
    en: 'You need an active subscription to shop. Pay and submit your payment reference to unlock the catalog.',
    te: 'షాపింగ్ చేయడానికి యాక్టివ్ సభ్యత్వం అవసరం. కేటలాగ్‌ను అన్‌లాక్ చేయడానికి చెల్లించి మీ చెల్లింపు రిఫరెన్స్‌ను సమర్పించండి.',
  },
  hariharaaGoToSubscription: { en: 'Pay / manage subscription', te: 'చెల్లించండి / సభ్యత్వం నిర్వహించండి' },
  hariharaaSaveSettingsButton: { en: 'Save settings', te: 'సెట్టింగ్‌లను సేవ్ చేయండి' },
  couldNotLoadHariharaaSettings: { en: 'Could not load settings.', te: 'సెట్టింగ్‌లను లోడ్ చేయలేకపోయాము.' },
  couldNotSaveHariharaaSettings: { en: 'Could not save settings.', te: 'సెట్టింగ్‌లను సేవ్ చేయలేకపోయాము.' },

  // HARIHARAA — shop
  hariharaaShopTitle: { en: 'HARIHARAA catalog', te: 'HARIHARAA కేటలాగ్' },
  noHariharaaProductsYet: { en: 'No products yet — check back soon.', te: 'ఇంకా ఉత్పత్తులు లేవు — త్వరలో మళ్ళీ చూడండి.' },

  // Dispatch queue (SUPPORT_AGENT) + per-item status, shared with OrderDetailPage
  dispatchQueueTitle: { en: 'Dispatch queue', te: 'డిస్పాచ్ క్యూ' },
  dispatchStatusLabel: { en: 'Dispatch status', te: 'డిస్పాచ్ స్థితి' },
  dispatchStatusPending: { en: 'Pending', te: 'పెండింగ్‌లో' },
  dispatchStatusSent: { en: 'Sent', te: 'పంపబడింది' },
  markSentButton: { en: 'Mark sent', te: 'పంపినట్లు గుర్తించండి' },
  markPendingButton: { en: 'Mark pending', te: 'పెండింగ్‌గా గుర్తించండి' },
  updatingDispatchStatus: { en: 'Updating…', te: 'నవీకరిస్తోంది…' },
  couldNotUpdateDispatchStatus: { en: 'Could not update this item.', te: 'ఈ అంశాన్ని నవీకరించలేకపోయాము.' },
  // Membership gate + Members admin screen
  membershipLockedTitle: { en: 'Members only', te: 'సభ్యులకు మాత్రమే' },
  membershipLockedBody: {
    en: 'This part needs an active membership. Pay to unlock checkout and all farm-advice features (cases, knowledge, courses, soil testing).',
    te: 'ఈ భాగానికి యాక్టివ్ సభ్యత్వం అవసరం. చెక్అవుట్ మరియు అన్ని వ్యవసాయ సలహా సౌకర్యాలు (కేసులు, జ్ఞానం, కోర్సులు, మట్టి పరీక్ష) అన్‌లాక్ చేయడానికి చెల్లించండి.',
  },
  membershipLockedButton: { en: 'Unlock with membership', te: 'సభ్యత్వంతో అన్‌లాక్ చేయండి' },
  membersAdminNavTitle: { en: 'Members & free access', te: 'సభ్యులు & ఉచిత ప్రాప్యత' },
  membersAdminTitle: { en: 'Members', te: 'సభ్యులు' },
  membersAdminHint: {
    en: 'Everyone who signed up. Paid means a verified payment is running; Free means you granted access without payment (for testing, or friends of the store).',
    te: 'సైన్ అప్ అయిన అందరూ. చెల్లించిన వారికి ధృవీకరించిన చెల్లింపు నడుస్తోంది; ఉచితం అంటే మీరు చెల్లింపు లేకుండా ప్రాప్యత ఇచ్చారు (పరీక్ష కోసం లేదా స్టోర్ మిత్రులకు).',
  },
  memberLabelPaid: { en: 'Paid', te: 'చెల్లించారు' },
  memberLabelFree: { en: 'Free', te: 'ఉచితం' },
  memberLabelAwaiting: { en: 'Waiting', te: 'వేచి ఉంది' },
  memberLabelExpired: { en: 'Expired', te: 'గడువు ముగిసింది' },
  memberLabelUnpaid: { en: 'Unpaid', te: 'చెల్లించలేదు' },
  memberAllLabels: { en: 'All members', te: 'అందరు సభ్యులు' },
  memberIdColumn: { en: 'ID', te: 'ID' },
  memberAccessColumn: { en: 'Access', te: 'ప్రాప్యత' },
  memberUntilColumn: { en: 'Until', te: 'వరకు' },
  memberJoinedColumn: { en: 'Joined', te: 'చేరిన తేదీ' },
  memberActionsColumn: { en: 'Actions', te: 'చర్యలు' },
  memberGrantFreeButton: { en: 'Give free access', te: 'ఉచిత ప్రాప్యత ఇవ్వండి' },
  memberChangeFreeButton: { en: 'Change', te: 'మార్చండి' },
  memberRevokeFreeButton: { en: 'Remove free access', te: 'ఉచిత ప్రాప్యత తొలగించండి' },
  memberGrantHeading: { en: 'Free access for', te: 'ఉచిత ప్రాప్యత:' },
  memberGrantUntilField: { en: 'Free until (date)', te: 'ఈ తేదీ వరకు ఉచితం' },
  memberGrantNoteField: { en: 'Reason (optional)', te: 'కారణం (ఐచ్ఛికం)' },
  memberGrantHelp: {
    en: 'The member can use checkout and farm advice until the end of this day. Paid days they have are not touched. Maximum 2 years at a time.',
    te: 'సభ్యుడు ఈ రోజు ముగిసే వరకు చెక్అవుట్, వ్యవసాయ సలహాను ఉపయోగించవచ్చు. వారికి ఉన్న చెల్లించిన రోజులు మారవు. ఒకసారి గరిష్టంగా 2 సంవత్సరాలు.',
  },
  memberGrantSave: { en: 'Save', te: 'సేవ్ చేయండి' },
  memberSaving: { en: 'Saving…', te: 'సేవ్ అవుతోంది…' },
  memberNoMatches: { en: 'No members match.', te: 'సరిపోలే సభ్యులు లేరు.' },
  couldNotLoadMembers: { en: 'Could not load members. Try again.', te: 'సభ్యులను లోడ్ చేయలేకపోయాము. మళ్ళీ ప్రయత్నించండి.' },
  couldNotSaveFreeAccess: { en: 'Could not save free access. Try again.', te: 'ఉచిత ప్రాప్యతను సేవ్ చేయలేకపోయాము. మళ్ళీ ప్రయత్నించండి.' },
  memberFreeReasonPrefix: { en: 'Reason:', te: 'కారణం:' },
  // Shop window, guest cart, checkout, address book, order payments, category tree
  browseShopLink: { en: 'Browse the shop', te: 'షాప్‌ను చూడండి' },
  departmentLabel: { en: 'Department', te: 'విభాగం' },
  subCategoryLabel: { en: 'Sub-category', te: 'ఉప-వర్గం' },
  registerLink: { en: 'Register', te: 'నమోదు చేసుకోండి' },
  guestBrowseHint: {
    en: 'Browse and fill your cart freely — you only need to sign in when you check out.',
    te: 'స్వేచ్ఛగా బ్రౌజ్ చేసి మీ కార్ట్ నింపండి — చెక్అవుట్ సమయంలో మాత్రమే సైన్ ఇన్ కావాలి.',
  },
  loginToReviewHint: { en: 'Log in to save or review products.', te: 'ఉత్పత్తులను సేవ్ చేయడానికి లేదా సమీక్షించడానికి లాగిన్ అవ్వండి.' },
  staffNoCartNotice: { en: 'Staff accounts do not have a shopping cart.', te: 'సిబ్బంది ఖాతాలకు షాపింగ్ కార్ట్ ఉండదు.' },
  guestCheckoutNotice: {
    en: 'Your cart is saved on this device. Log in or create an account to check out — your items will come with you.',
    te: 'మీ కార్ట్ ఈ పరికరంలో సేవ్ అయింది. చెక్అవుట్ చేయడానికి లాగిన్ అవ్వండి లేదా ఖాతా సృష్టించండి — మీ వస్తువులు మీతో వస్తాయి.',
  },
  loginToCheckoutButton: { en: 'Log in to check out', te: 'చెక్అవుట్ కోసం లాగిన్ అవ్వండి' },
  checkoutNeedsMembershipNotice: {
    en: 'Checkout needs an active membership. Your cart is safe — activate your membership, then place this order.',
    te: 'చెక్అవుట్‌కు యాక్టివ్ సభ్యత్వం అవసరం. మీ కార్ట్ భద్రంగా ఉంది — సభ్యత్వాన్ని యాక్టివేట్ చేసి, ఈ ఆర్డర్ చేయండి.',
  },
  addressesNavTitle: { en: 'Addresses', te: 'చిరునామాలు' },
  addressesPageTitle: { en: 'My addresses', te: 'నా చిరునామాలు' },
  addressesHint: {
    en: 'Save your delivery addresses once and pick one at checkout. Changing an address here never changes an order you already placed.',
    te: 'మీ డెలివరీ చిరునామాలను ఒకసారి సేవ్ చేసి, చెక్అవుట్‌లో ఒకదాన్ని ఎంచుకోండి. ఇక్కడ చిరునామా మార్చినా, ఇప్పటికే చేసిన ఆర్డర్ మారదు.',
  },
  noAddressesYet: { en: 'No saved addresses yet.', te: 'ఇంకా సేవ్ చేసిన చిరునామాలు లేవు.' },
  addAddressButton: { en: 'Add a new address', te: 'కొత్త చిరునామా చేర్చండి' },
  addrEditHeading: { en: 'Edit address', te: 'చిరునామాను మార్చండి' },
  addrRecipientField: { en: 'Receiver name', te: 'స్వీకర్త పేరు' },
  addrPhoneField: { en: 'Mobile number', te: 'మొబైల్ నంబర్' },
  addrAltPhoneField: { en: 'Second phone (optional)', te: 'రెండవ ఫోన్ (ఐచ్ఛికం)' },
  addrEmailField: { en: 'Email (optional)', te: 'ఇమెయిల్ (ఐచ్ఛికం)' },
  addrLine1Field: { en: 'House no. / street / village', te: 'ఇంటి నంబర్ / వీధి / గ్రామం' },
  addrLine2Field: { en: 'Area / mandal (optional)', te: 'ప్రాంతం / మండలం (ఐచ్ఛికం)' },
  addrLandmarkField: { en: 'Landmark (optional)', te: 'ల్యాండ్‌మార్క్ (ఐచ్ఛికం)' },
  addrCityField: { en: 'Town / city', te: 'పట్టణం / నగరం' },
  addrStateField: { en: 'State', te: 'రాష్ట్రం' },
  addrPincodeField: { en: 'PIN code (6 digits)', te: 'పిన్ కోడ్ (6 అంకెలు)' },
  addrLabelField: { en: 'Name this address (Home, Farm, Shop…)', te: 'ఈ చిరునామాకు పేరు (ఇల్లు, పొలం, దుకాణం…)' },
  addrDefaultField: { en: 'Make this my default address', te: 'దీన్ని నా డిఫాల్ట్ చిరునామాగా చేయండి' },
  addrSaveButton: { en: 'Save', te: 'సేవ్ చేయండి' },
  addrSaving: { en: 'Saving…', te: 'సేవ్ అవుతోంది…' },
  addrEditButton: { en: 'Edit', te: 'మార్చండి' },
  addrMakeDefaultButton: { en: 'Make default', te: 'డిఫాల్ట్ చేయండి' },
  addrDeleteButton: { en: 'Delete', te: 'తొలగించండి' },
  addrDefaultBadge: { en: 'Default', te: 'డిఫాల్ట్' },
  addrUntitled: { en: 'Address', te: 'చిరునామా' },
  couldNotLoadAddresses: { en: 'Could not load your addresses. Try again.', te: 'మీ చిరునామాలను లోడ్ చేయలేకపోయాము. మళ్ళీ ప్రయత్నించండి.' },
  couldNotSaveAddress: { en: 'Could not save the address. Check the details and try again.', te: 'చిరునామాను సేవ్ చేయలేకపోయాము. వివరాలను తనిఖీ చేసి మళ్ళీ ప్రయత్నించండి.' },
  deliveryAddressHeading: { en: 'Delivery address', te: 'డెలివరీ చిరునామా' },
  chooseAddressHint: { en: 'Choose or add a delivery address to place the order.', te: 'ఆర్డర్ చేయడానికి డెలివరీ చిరునామాను ఎంచుకోండి లేదా చేర్చండి.' },
  paymentMethodHeading: { en: 'How will you pay?', te: 'మీరు ఎలా చెల్లిస్తారు?' },
  paymentCod: { en: 'Cash on Delivery', te: 'క్యాష్ ఆన్ డెలివరీ' },
  paymentUpi: { en: 'Pay by UPI', te: 'UPI ద్వారా చెల్లించండి' },
  paymentUpiShort: { en: 'UPI', te: 'UPI' },
  paymentCodHint: { en: 'Pay in cash when the order reaches you.', te: 'ఆర్డర్ మీకు చేరినప్పుడు నగదు చెల్లించండి.' },
  paymentUpiHint: {
    en: 'Pay with any UPI app after placing the order. We verify the payment, then pack and send it.',
    te: 'ఆర్డర్ చేసిన తర్వాత ఏదైనా UPI యాప్‌తో చెల్లించండి. మేము చెల్లింపును ధృవీకరించి, ప్యాక్ చేసి పంపుతాము.',
  },
  orderSummaryHeading: { en: 'Order summary', te: 'ఆర్డర్ సారాంశం' },
  orderPayHeading: { en: 'Pay for this order', te: 'ఈ ఆర్డర్‌కు చెల్లించండి' },
  orderPayVerifyingNotice: {
    en: 'We will verify your payment against our bank account, then pack and send your order. You will get a notification.',
    te: 'మేము మీ చెల్లింపును మా బ్యాంక్ ఖాతాలో ధృవీకరించి, మీ ఆర్డర్‌ను ప్యాక్ చేసి పంపుతాము. మీకు నోటిఫికేషన్ వస్తుంది.',
  },
  orderVerifyHeading: { en: 'Verify the UPI payment', te: 'UPI చెల్లింపును ధృవీకరించండి' },
  orderVerifyHint: {
    en: 'Check that the UTR below shows as credited in the bank for this exact amount, then approve. The order cannot be confirmed until then.',
    te: 'దిగువ UTR ఈ ఖచ్చితమైన మొత్తానికి బ్యాంకులో జమ అయినట్లు ఉందో తనిఖీ చేసి, ఆమోదించండి. అప్పటి వరకు ఆర్డర్‌ను నిర్ధారించలేరు.',
  },
  orderConfirmNeedsPayment: { en: 'Verify the UPI payment before confirming this order.', te: 'ఈ ఆర్డర్‌ను నిర్ధారించే ముందు UPI చెల్లింపును ధృవీకరించండి.' },
  orderPayStatusPending: { en: 'Payment pending', te: 'చెల్లింపు పెండింగ్' },
  orderPayStatusClaimed: { en: 'Payment submitted — being verified', te: 'చెల్లింపు సమర్పించబడింది — ధృవీకరణలో ఉంది' },
  orderPayStatusPaid: { en: 'Paid', te: 'చెల్లించబడింది' },
  orderPayStatusRejected: { en: 'Payment not verified — pay again', te: 'చెల్లింపు ధృవీకరించబడలేదు — మళ్ళీ చెల్లించండి' },
  orderPaymentStatusFilterLabel: { en: 'Payment status', te: 'చెల్లింపు స్థితి' },
  ordersNeedVerifying: { en: '{n} UPI payment(s) waiting for verification — show them', te: '{n} UPI చెల్లింపు(లు) ధృవీకరణ కోసం వేచి ఉన్నాయి — చూపించండి' },
  orderNumberColumn: { en: 'Order', te: 'ఆర్డర్' },
  customerColumnLabel: { en: 'Customer', te: 'కస్టమర్' },
  dispatchReadyOnly: { en: 'Ready to pack only (COD or paid)', te: 'ప్యాక్ చేయడానికి సిద్ధమైనవి మాత్రమే (COD లేదా చెల్లించినవి)' },
  categoryTreeHint: {
    en: 'Departments hold categories, and categories hold sub-categories. A product can be filed at any level. Switching one off hides it from the shop without deleting anything.',
    te: 'విభాగాలలో వర్గాలు, వర్గాలలో ఉప-వర్గాలు ఉంటాయి. ఉత్పత్తిని ఏ స్థాయిలోనైనా ఉంచవచ్చు. ఒకదాన్ని ఆఫ్ చేస్తే ఏదీ తొలగించకుండా షాప్ నుండి దాచబడుతుంది.',
  },
  nameTeField: { en: 'Telugu name (optional)', te: 'తెలుగు పేరు (ఐచ్ఛికం)' },
  categoryOffBadge: { en: '(off)', te: '(ఆఫ్)' },
  productsCountLabel: { en: 'products', te: 'ఉత్పత్తులు' },
  renameButton: { en: 'Rename', te: 'పేరు మార్చండి' },
  addDepartmentButton: { en: 'Add a department', te: 'విభాగాన్ని చేర్చండి' },
  addCategoryInsideButton: { en: 'Add a category inside', te: 'లోపల వర్గాన్ని చేర్చండి' },
  addSubCategoryInsideButton: { en: 'Add a sub-category inside', te: 'లోపల ఉప-వర్గాన్ని చేర్చండి' },
  switchOffButton: { en: 'Switch off', te: 'ఆఫ్ చేయండి' },
  switchOnButton: { en: 'Switch on', te: 'ఆన్ చేయండి' },
  showSwitchedOffLabel: { en: 'Show switched-off ones', te: 'ఆఫ్ చేసినవి చూపించండి' },
  couldNotSaveCategory: { en: 'Could not save the category. Try again.', te: 'వర్గాన్ని సేవ్ చేయలేకపోయాము. మళ్ళీ ప్రయత్నించండి.' },
  helpNavTitle: { en: 'Help', te: 'సహాయం' },
  helpPageTitle: { en: 'How to use this app', te: 'ఈ యాప్‌ను ఎలా ఉపయోగించాలి' },
  helpIntro: {
    en: 'Plain answers for the screens you can see. Search for a word, or replay the guided tour.',
    te: 'మీకు కనిపించే స్క్రీన్‌లకు సులభమైన సమాధానాలు. ఒక పదం కోసం శోధించండి, లేదా గైడెడ్ టూర్‌ను మళ్ళీ చూడండి.',
  },
  tourReplayButton: { en: 'Take the tour', te: 'టూర్ చూడండి' },
  tourLabel: { en: 'Guided tour', te: 'గైడెడ్ టూర్' },
  tourStepOf: { en: 'Step {n} of {total}', te: '{total} లో {n}వ దశ' },
  tourNext: { en: 'Next', te: 'తదుపరి' },
  tourBack: { en: 'Back', te: 'వెనుకకు' },
  tourSkip: { en: 'Skip tour', te: 'టూర్ దాటవేయండి' },
  tourDone: { en: 'Got it', te: 'అర్థమైంది' },
} as const satisfies Record<string, Bilingual>;

export type StringKey = keyof typeof strings;

// "We sent a 6-digit code to {mobile}." needs the mobile number interpolated —
// kept as a function, outside the static dictionary, for that reason alone.
export function otpSentTo(mobileNumber: string): Bilingual {
  return {
    en: `A 6-digit code was generated for ${mobileNumber}.`,
    te: `${mobileNumber} కోసం 6-అంకెల కోడ్ రూపొందించబడింది.`,
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

const ARTICLE_STATUS_KEYS: Record<string, StringKey> = {
  DRAFT: 'articleStatusDraft',
  PENDING_REVIEW: 'articleStatusPending',
  PUBLISHED: 'articleStatusPublished',
  REJECTED: 'articleStatusRejected',
};

export function articleStatusLabel(status: string): Bilingual {
  const key = ARTICLE_STATUS_KEYS[status];
  return key ? strings[key] : { en: status, te: status };
}

const COURSE_STATUS_KEYS: Record<string, StringKey> = {
  DRAFT: 'courseStatusDraft',
  PUBLISHED: 'courseStatusPublished',
};

export function courseStatusLabel(status: string): Bilingual {
  const key = COURSE_STATUS_KEYS[status];
  return key ? strings[key] : { en: status, te: status };
}

const LESSON_CONTENT_TYPE_KEYS: Record<string, StringKey> = {
  VIDEO: 'contentTypeVideo',
  AUDIO: 'contentTypeAudio',
  PDF: 'contentTypePdf',
  ASSIGNMENT: 'contentTypeAssignment',
};

export function lessonContentTypeLabel(type: string): Bilingual {
  const key = LESSON_CONTENT_TYPE_KEYS[type];
  return key ? strings[key] : { en: type, te: type };
}

const SAMPLE_STATUS_KEYS: Record<string, StringKey> = {
  CREATED: 'sampleStatusCreated',
  DISPATCHED: 'sampleStatusDispatched',
  RECEIVED: 'sampleStatusReceived',
  TESTED: 'sampleStatusTested',
  REPORT_AVAILABLE: 'sampleStatusReportAvailable',
};

export function sampleStatusLabel(status: string): Bilingual {
  const key = SAMPLE_STATUS_KEYS[status];
  return key ? strings[key] : { en: status, te: status };
}

const ORDER_STATUS_KEYS: Record<string, StringKey> = {
  PLACED: 'orderStatusPlaced',
  CONFIRMED: 'orderStatusConfirmed',
  SHIPPED: 'orderStatusShipped',
  DELIVERED: 'orderStatusDelivered',
  CANCELLED: 'orderStatusCancelled',
};

export function orderStatusLabel(status: string): Bilingual {
  const key = ORDER_STATUS_KEYS[status];
  return key ? strings[key] : { en: status, te: status };
}

const MEDIA_KIND_KEYS: Record<string, StringKey> = {
  IMAGE: 'mediaKindImage',
  VIDEO: 'mediaKindVideo',
  AUDIO: 'mediaKindAudio',
  PDF: 'mediaKindPdf',
  OTHER: 'mediaKindOther',
};

export function mediaKindLabel(kind: string): Bilingual {
  const key = MEDIA_KIND_KEYS[kind];
  return key ? strings[key] : { en: kind, te: kind };
}

const MEDIA_SOURCE_KEYS: Record<string, StringKey> = {
  CASE_EVIDENCE: 'mediaSourceCase',
  ARTICLE_EVIDENCE: 'mediaSourceArticle',
  LESSON: 'mediaSourceLesson',
  SOIL_REPORT: 'mediaSourceSoil',
  PRODUCT_IMAGE: 'mediaSourceProduct',
};

export function mediaSourceLabel(source: string): Bilingual {
  const key = MEDIA_SOURCE_KEYS[source];
  return key ? strings[key] : { en: source, te: source };
}

const DISPATCH_STATUS_KEYS: Record<string, StringKey> = {
  PENDING: 'dispatchStatusPending',
  SENT: 'dispatchStatusSent',
};

export function dispatchStatusLabel(status: string): Bilingual {
  const key = DISPATCH_STATUS_KEYS[status];
  return key ? strings[key] : { en: status, te: status };
}

const HARIHARAA_SUBSCRIPTION_STATUS_KEYS: Record<string, StringKey> = {
  NOT_PAID: 'hariharaaStatusNotSubmitted',
  AWAITING_VERIFICATION: 'hariharaaStatusPendingReview',
  ACTIVE: 'hariharaaStatusActive',
  FREE: 'hariharaaStatusFree',
  REJECTED: 'hariharaaStatusRejected',
  EXPIRED: 'hariharaaStatusExpired',
};

export function hariharaaSubscriptionStatusLabel(status: string): Bilingual {
  const key = HARIHARAA_SUBSCRIPTION_STATUS_KEYS[status];
  return key ? strings[key] : { en: status, te: status };
}

const ORDER_PAYMENT_STATUS_KEYS: Record<string, StringKey> = {
  PENDING: 'orderPayStatusPending',
  CLAIMED: 'orderPayStatusClaimed',
  PAID: 'orderPayStatusPaid',
  REJECTED: 'orderPayStatusRejected',
};

export function orderPaymentStatusLabel(status: string): Bilingual {
  const key = ORDER_PAYMENT_STATUS_KEYS[status];
  return key ? strings[key] : { en: status, te: status };
}
