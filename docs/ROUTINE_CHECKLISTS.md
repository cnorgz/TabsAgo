# Routine Checklists for TabsAGO Project

Related docs: PROJECT_TRACKING.md, PHASE2_SPEC.md, CODE_AUDIT.md, QUICK_START.md

## Pre-Coding Checklist
- [ ] **Phase Status Check**: Verify current development phase from PROJECT_TRACKING.md
- [ ] **Task Review**: Review specific task requirements and acceptance criteria
- [ ] **Dependencies**: Ensure all required dependencies are installed (`npm install`)
- [ ] **Build Status**: Verify current build works (`npm run build`)
- [ ] **Extension Load**: Test extension loads in Chrome without errors
- [ ] **Git Status**: Ensure working directory is clean or changes are committed
 - [ ] **Policies**: Skim Chrome policy link in PHASE2_SPEC.md
 - [ ] **Clarity**: Review ⭐ items in PHASE2_SPEC.md; ask questions before coding

## Code Change Checklist
- [ ] **Backup/Branch**: Create feature branch or backup current work
- [ ] **File Impact**: Identify all files that will be modified
- [ ] **TypeScript**: Ensure proper typing and no type errors
- [ ] **React Patterns**: Follow functional component + hooks pattern
- [ ] **Tailwind**: Use Tailwind classes, avoid custom CSS
- [ ] **Error Handling**: Add proper error boundaries and error handling
- [ ] **Testing**: Test changes locally in Chrome extension
- [ ] **Performance**: Verify no performance regressions
 - [ ] **Docs**: Update PROJECT_TRACKING.md and CODE_AUDIT.md (TO BE DONE/DONE)
 - [ ] **Commit**: Commit with concise message (scope: summary)
 - [ ] **Prompt Push**: Ask user if they want to push to remote repo (if configured)

## Post-Implementation Checklist
- [ ] **Code Review**: Self-review code for best practices
- [ ] **Testing**: Test all new functionality manually
- [ ] **Extension Test**: Load extension and verify changes work
- [x] **Documentation**: Update PROJECT_TRACKING.md with progress
 - [ ] **Audit Update**: Move any completed audit items in CODE_AUDIT.md to DONE
 - [ ] **Prompt User**: Ask for validation/testing focus or clarifications on ⭐ items
 - [ ] **Push**: If approved, push branch/commit to remote
- [ ] **Git Commit**: Commit with descriptive message following convention
- [ ] **Phase Check**: Update phase status if milestone reached

## Daily Development Routine

### Morning (9:00 AM)
- [ ] **Status Check**: Review PROJECT_TRACKING.md current phase
- [ ] **Yesterday Review**: Check what was completed yesterday
- [ ] **Today's Goals**: Identify 2-3 key tasks for today
- [ ] **Environment**: Ensure dev environment is ready
- [ ] **Extension Load**: Load extension in Chrome for testing
 - [ ] **Commit**: Commit any meaningful changes with concise message
 - [ ] **Mini Audit**: Quick scan for code quality drift; log in CODE_AUDIT.md if needed

### Midday (12:00 PM)
- [ ] **Progress Check**: Review morning progress
- [ ] **Blockers**: Identify any blockers or issues
- [ ] **Adjust Goals**: Modify afternoon goals if needed
- [ ] **Quick Test**: Test any new functionality added

### Afternoon (3:00 PM)
- [ ] **Progress Review**: Assess afternoon progress
- [ ] **Documentation**: Update PROJECT_TRACKING.md
- [ ] **Testing**: Comprehensive test of today's changes
- [ ] **Git Commit**: Commit work if substantial progress made

### End of Day (5:00 PM)
- [ ] **Final Testing**: Load extension and verify all changes work
- [ ] **Progress Update**: Update PROJECT_TRACKING.md with today's progress
- [ ] **Tomorrow Prep**: Identify first task for tomorrow
- [ ] **Git Status**: Ensure all work is committed or stashed

## Weekly Review Routine

### Monday Morning
- [ ] **Week Planning**: Review week's goals from PROJECT_TRACKING.md
- [ ] **Phase Status**: Check current phase and progress
- [ ] **Dependencies**: Ensure all required tools and packages are ready
- [ ] **Team Sync**: If working with others, sync on weekly goals

### Wednesday Midday
- [ ] **Midweek Check**: Assess progress toward weekly goals
- [ ] **Blocker Review**: Identify and address any blockers
- [ ] **Goal Adjustment**: Modify goals if needed for the week
- [ ] **Quality Check**: Review code quality and testing coverage

### Friday Afternoon
- [ ] **Week Review**: Complete weekly review template in PROJECT_TRACKING.md
- [ ] **Progress Update**: Update all phase statuses and progress percentages
- [ ] **Next Week Prep**: Plan first tasks for next week
- [ ] **Documentation**: Update any documentation that needs updating
 - [ ] **Policy Check**: Briefly verify Chrome policy still aligns
 - [ ] **Audit Rollup**: Move any lingering audit items to TO BE DONE/DONE
 - [ ] **Plan Next**: Ensure PROJECT_TRACKING.md next tasks are ready

## Automation Prompts (for the AI agent)
- On task start: read PROJECT_TRACKING.md item, run `npm run type-check && npm run lint && npm run test`.
- After edits: run type-check/lint/tests again; update CODE_AUDIT.md (DONE/TO BE DONE) and PROJECT_TRACKING.md.
- Before commit: confirm checklists; commit; optionally prompt to push.
- When ⭐ exists: ask questions before coding.
- Weekly: verify Chrome policy link in PHASE2_SPEC.md.

## Quality Assurance Checklist

### Before Each Commit
- [ ] **TypeScript**: No type errors (`npm run type-check`)
- [ ] **Linting**: Code passes linting (`npm run lint`) or fix with (`npm run lint:fix`)
- [ ] **Format**: Prettier format is clean (`npm run format:check`)
- [ ] **Build**: Extension builds successfully (`npm run build`)
- [ ] **Extension Load**: Extension loads in Chrome without errors
- [ ] **Basic Functionality**: Core features still work
- [ ] **No Console Errors**: Check browser console for errors

### Before Phase Completion
- [ ] **All Tasks**: All phase tasks are completed
- [ ] **Definition of Done**: Phase meets all completion criteria
- [ ] **Testing**: Comprehensive testing of all phase features
- [ ] **Documentation**: Phase documentation is complete
- [ ] **Next Phase Prep**: Dependencies for next phase are ready

### Before Major Release
- [ ] **All Phases**: All development phases are complete
- [ ] **User Testing**: User acceptance testing is complete
- [ ] **Performance**: Performance meets requirements
- [ ] **Accessibility**: Accessibility standards are met
- [ ] **Documentation**: User and developer documentation is complete
- [ ] **Chrome Web Store**: Extension is ready for store submission

## Emergency Procedures

### If Extension Won't Load
1. Check browser console for errors
2. Verify manifest.json is valid
3. Check service worker for errors
4. Verify all required files exist in dist/
5. Try reloading extension
6. Check Chrome extension error logs

### If Build Fails
1. Check package.json dependencies
2. Verify Node.js version compatibility
3. Clear node_modules and reinstall
4. Check for TypeScript compilation errors
5. Verify Vite configuration
6. Check for file path issues

### If Features Stop Working
1. Check recent changes for breaking modifications
2. Verify chrome.storage data integrity
3. Check service worker lifecycle
4. Test in incognito mode
5. Verify permissions are still granted
6. Check for Chrome API changes

## Communication Checklist

### Daily Updates
- [ ] **Progress**: Update PROJECT_TRACKING.md with daily progress
- [ ] **Blockers**: Document any blockers or issues
- [ ] **Next Steps**: Identify tomorrow's priorities
- [ ] **Questions**: Document any questions for review

### Weekly Updates
- [ ] **Phase Status**: Update phase completion status
- [ ] **Progress Percentage**: Update overall progress
- [ ] **Milestones**: Document any milestones reached
- [ ] **Next Week**: Plan next week's objectives

### Issue Reporting
- [ ] **Description**: Clear description of the issue
- [ ] **Steps to Reproduce**: Detailed reproduction steps
- [ ] **Expected vs Actual**: What should happen vs what happens
- [ ] **Environment**: Chrome version, OS, extension version
- [ ] **Console Logs**: Any relevant error messages
- [ ] **Screenshots**: Visual evidence if applicable 