# Security Migration Plan

> **Note**: This document was restored from the original `SECURITY-MIGRATION-PLAN.md` that existed in the project root.
> It contains planned security improvements that should be implemented before going to production.

## 1. JWT Storage: localStorage → HttpOnly Cookies

### Current State
JWT tokens are stored in `localStorage` via `AuthContext.jsx` — vulnerable to XSS attacks.

### Target State
HttpOnly cookies — not accessible via JavaScript, immune to XSS token theft.

### Migration Steps

#### Backend Changes
1. Install cookie-parser: `cd backend && npm install cookie-parser`
2. Update login/register controllers to set token as HttpOnly cookie
3. Add cookie-parser middleware in `server.js`
4. Update auth middleware to read from `req.cookies.token` as fallback
5. Add logout endpoint to clear cookie

#### Frontend Changes
1. Update `src/api/axios.js` — remove localStorage interceptor, add `withCredentials: true`
2. Update `src/contexts/AuthContext.jsx` — remove localStorage token calls
3. Update `downloadExport.js` — remove localStorage token call

## 2. npm Audit Vulnerability Analysis

3 vulnerabilities remain (exceljs/tmp — High/Low severity). Limited risk since:
- Exports require admin authentication
- Temp files are created server-side, not from user input
- Files are deleted immediately after streaming

## 3. API Request Validation Audit

### Applied Fixes
- ✅ ObjectId format validation before DB queries
- ✅ Input sanitization (XSS) middleware globally
- ✅ File upload magic byte verification

### Remaining Gaps
- ❌ Password complexity validation (defer to product decision)
- ❌ Phone format validation (MEDIUM priority)

## 4. Security Checklist

| Layer | Status |
|-------|--------|
| HTTP Security Headers (helmet) | ✅ DONE |
| CORS Restricted | ✅ DONE |
| Rate Limiting | ✅ DONE |
| JWT Authentication | ✅ DONE |
| Input Sanitization (XSS) | ✅ DONE |
| File Upload Validation | ✅ DONE |
| ObjectId Validation | ✅ DONE |
| MongoDB Injection Protection | ✅ DONE |
| JWT HttpOnly Cookie | ❌ PLANNED |
| npm Audit Vulnerabilities | ⚠️ PARTIAL (3 remain) |
| Password Complexity | ❌ DEFERRED |
| Phone Validation | ❌ DEFERRED |
