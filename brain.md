# Project Brain

## Core Principles
1. **Security First**: Never store API secrets in code - always use environment variables
2. **Rate Limiting**: Breeze API has strict rate limits (30 req/min) - implement request queuing
3. **Session Handling**: Encrypt session tokens in localStorage using Web Crypto API

## Lessons Learned
### 2024-05-20: Initial Auth Implementation
- **Issue**: Session tokens were stored in plain text
- **Fix**: Implemented AES encryption via Web Crypto API
- **Key Takeaway**: Always encrypt sensitive browser storage

### 2024-05-21: API Error Handling
- **Issue**: Generic error messages from Breeze API
- **Solution**: Created error code mapping system
- **Documentation**: `src/utils/errorCodes.ts`

## Anti-Patterns to Avoid
- ❌ Direct API calls in components
- ✅ Use service layer abstraction

## Performance Notes
- Chart.js can impact bundle size - use tree-shaking
- Cloudflare Pages has 25ms CPU time limit for SSR

## Deployment Checklist
1. Validate environment variables
2. Run `vue-tsc` before build
3. Test CORS settings for API endpoints

## Known Issues
- [ ] Mobile chart rendering needs performance optimization
- [ ] Session timeout handling not implemented

---
*Updated: 2024-05-20*