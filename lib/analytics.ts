/**
 * Analytics hook. A no-op for now; wire it to Mixpanel (or anything else) in one place.
 *
 *   import mixpanel from "mixpanel-browser";
 *   mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN!);
 *   ...then inside track(): mixpanel.track(event, props);
 *
 * Funnel (v4.1): landing_view → flow_start → step_view (one per screen, prop `step`) → linkedin_found →
 * linkedin_confirmed → resume_added | resume_skipped → done. The rest are diagnostics.
 */

export type AnalyticsEvent =
  | "landing_view"
  | "flow_start"
  | "step_view"
  | "linkedin_found"
  | "linkedin_confirmed"
  | "linkedin_rejected"
  | "linkedin_failed"
  | "resume_added"
  | "resume_rejected"
  | "resume_skipped"
  | "upload_failed"
  | "done";

export type AnalyticsProps = Record<string, string | number | boolean | string[] | null | undefined>;

export function track(event: AnalyticsEvent, props: AnalyticsProps = {}): void {
  // TODO: send to Mixpanel here.
  if (process.env.NODE_ENV === "development") {
    console.debug("[track]", event, props);
  }
}
