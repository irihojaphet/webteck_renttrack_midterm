# Accessibility Notes

## Implemented
- Inline form validation with visible error text and `role="alert"`.
- Inputs set `aria-invalid` and `aria-describedby` where validation is present.
- Toasts use `aria-live="polite"`.
- Modals support Escape to close and restore focus after close.
- Navigation uses semantic buttons and links with visible focus states.
- Tables retain semantic structure for screen readers.
- Empty states include strong labels and action buttons.

## Manual Checks
- Verified keyboard navigation through login, modals, and route shell links.
- Checked that validation messages appear without relying on color only.
- Confirmed responsive layouts for dashboard cards and tables.
- Confirmed toasts and empty states remain readable on small screens.

## Remaining Work
- Add formal screen-reader testing with NVDA or VoiceOver.
- Add automated a11y checks in CI.
- Add more descriptive alt text if real illustrations replace placeholders.
