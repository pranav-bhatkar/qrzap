<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into QRzap. The PostHog web snippet is loaded in the shared `Layout.astro` via a dedicated `src/components/posthog.astro` component. Eleven client-side events were instrumented across three React components, covering core product actions (QR generation, downloads, sharing), feature discovery (appearance panel, MCP setup, API playground), and conversion events (support donations, GitHub clicks). A `src/env.d.ts` file was added to provide TypeScript types for `window.posthog`. Credentials are stored in `.env` and referenced via Astro's `PUBLIC_` environment variable convention — nothing is hardcoded.

| Event | Description | File |
|---|---|---|
| `qr_generated` | User generates a QR code (fires on each debounced render); includes `qr_type`, `error_correction`, `size` | `src/components/QRGenerator.tsx` |
| `qr_type_selected` | User switches QR type (url, wifi, phone, email, sms, vcard, text); includes `qr_type` | `src/components/QRGenerator.tsx` |
| `qr_downloaded` | User downloads a QR code; includes `format` (png/svg/jpeg/webp) and `qr_type` | `src/components/QRGenerator.tsx` |
| `qr_shared` | User taps the native share button; includes `qr_type` | `src/components/QRGenerator.tsx` |
| `appearance_panel_opened` | User opens the Appearance customization accordion; includes `qr_type` | `src/components/QRGenerator.tsx` |
| `mcp_setup_tab_selected` | User switches between Claude Code / Claude Desktop / Cursor setup tabs; includes `tab` | `src/components/LandingSections.tsx` |
| `mcp_command_copied` | User copies a MCP config snippet; includes `tab` | `src/components/LandingSections.tsx` |
| `api_url_copied` | User copies the generated API URL from the playground; includes `qr_type` | `src/components/LandingSections.tsx` |
| `api_playground_type_changed` | User changes QR type in the API playground; includes `qr_type` | `src/components/LandingSections.tsx` |
| `support_link_clicked` | User clicks a donation link; includes `platform` (buymeacoffee / razorpay) | `src/components/SupportPage.tsx` |
| `github_link_clicked` | User clicks the GitHub repo link in the Open Source CTA | `src/components/LandingSections.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/372349/dashboard/1438971
- **Daily unique QR generators** (line chart): https://us.posthog.com/project/372349/insights/ZNdqjjQP
- **QR type popularity breakdown** (bar chart by `qr_type`): https://us.posthog.com/project/372349/insights/IC4gkcNn
- **QR generated → downloaded funnel** (conversion funnel): https://us.posthog.com/project/372349/insights/iFetr4Jc
- **Download format breakdown** (pie chart by `format`): https://us.posthog.com/project/372349/insights/mrxLgtBc
- **Support page clicks** (line chart): https://us.posthog.com/project/372349/insights/ulsPgijq

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
