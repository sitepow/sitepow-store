export const PLAN_LIMITS = {
  STARTER: {
    maxProducts: 50,
    aiVisionLimit: 0,
    aiSearchLimit: 0,
    hasEasySlip: false,
    hasCrm: false,
  },
  PRO: {
    maxProducts: 999999,
    aiVisionLimit: 100,
    aiSearchLimit: 100,
    hasEasySlip: true,
    hasCrm: false,
  },
  ULTIMATE: {
    maxProducts: 999999,
    aiVisionLimit: 500,
    aiSearchLimit: 999999,
    hasEasySlip: true,
    hasCrm: true,
  },
}
