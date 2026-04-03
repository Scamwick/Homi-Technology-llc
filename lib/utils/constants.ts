export const APP_NAME = 'H\u014dMI'
export const LEGAL_ENTITY = 'HOMI TECHNOLOGIES LLC'
export const EIN = '39-3779378'
export const SUPPORT_EMAIL = 'info@homitechnology.com'
export const LEGAL_EMAIL = 'legal@homitechnology.com'
export const TWITTER_URL = 'https://x.com/Homi_Tech'
export const PRIMARY_DOMAIN = 'homitechnology.com'

export const VERDICT_THRESHOLDS = {
  READY: 80,
  ALMOST_THERE: 65,
  BUILD_FIRST: 50,
  NOT_YET: 0,
} as const

export const DIMENSION_WEIGHTS = {
  financial: 0.35,
  emotional: 0.35,
  timing: 0.30,
} as const

export const TIER_LIMITS = {
  free: {
    assessments_per_month: 3,
    advisor_messages_per_day: 10,
    couples_mode: false,
    transformation_paths: false,
    pdf_reports: false,
  },
  plus: {
    assessments_per_month: null,
    advisor_messages_per_day: 50,
    couples_mode: false,
    transformation_paths: true,
    pdf_reports: true,
  },
  pro: {
    assessments_per_month: null,
    advisor_messages_per_day: null,
    couples_mode: true,
    transformation_paths: true,
    pdf_reports: true,
  },
  family: {
    assessments_per_month: null,
    advisor_messages_per_day: null,
    couples_mode: true,
    transformation_paths: true,
    pdf_reports: true,
  },
} as const
