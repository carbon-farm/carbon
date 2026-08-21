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
