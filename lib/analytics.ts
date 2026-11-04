/**
 * Analytics hook. A no-op for now; wire it to Mixpanel (or anything else) in one place.
 *
 *   import mixpanel from "mixpanel-browser";
 *   mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN!);
 *   ...then inside track(): mixpanel.track(event, props);
 */

export type AnalyticsEvent =
  | "resume_selected"
  | "resume_rejected"
  | "resume_uploaded"
  | "upload_failed"
  | "match_shown"
  | "jump_to_active_upload"
  | "sticky_bar_click";

export type AnalyticsProps = Record<string, string | number | boolean | string[] | null | undefined>;

export function track(event: AnalyticsEvent, props: AnalyticsProps = {}): void {
  // TODO: send to Mixpanel here.
  if (process.env.NODE_ENV === "development") {
    console.debug("[track]", event, props);
  }
}
