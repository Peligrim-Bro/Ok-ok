# Home filter label alignment

Owner screenshot, 24 October 2026: the Filters label is left-aligned while
adjacent action labels are centered. Base main:
dd57b16854933c341b2794bc0c315fc578d59c09.

Cause: author-chat.css uses justify-content:space-between on the native summary.
Fix: center its text and absolutely position the disclosure indicator at the
right edge. Existing geometry, appearance, native details behaviour, selections,
keyboard activation, language/theme switching and catalogue visibility remain.

Existing full layout coverage gains a measurement of the actual text range
center against the button box, independent of the pseudo-element, across
RU/EN/TH, both themes and phone/tablet/landscape widths. Existing home filter
navigation/folding regression stays intact.

Local build and all 86 native checks pass with unchanged size budgets.
Pending full browser suite and three Lighthouse audits,
visual screenshot review, then Cloudflare native success and exact live checks.
Final PR records evidence and any unresolved result. No Telegram changes.
