/**
 * HoneypotField Component (P9-002)
 *
 * Invisible honeypot fields for bot protection.
 * Bots typically fill all form fields including hidden ones.
 * Humans won't see or interact with these fields.
 */

import { useEffect, useState } from "react";

/**
 * Honeypot field names that the server checks
 * These must match the bot-protection middleware HONEYPOT_FIELDS
 */
const HONEYPOT_FIELD_NAME = "website";

/**
 * Timestamp field name for timing analysis
 * This must match the bot-protection middleware timestampField
 */
const TIMESTAMP_FIELD_NAME = "_timestamp";

/**
 * Hidden honeypot fields for bot protection
 *
 * Include this component inside any form to add bot protection.
 * The fields are styled to be invisible to humans but visible to bots.
 *
 * @example
 * ```tsx
 * <form onSubmit={handleSubmit}>
 *   <HoneypotFields />
 *   <input name="email" type="email" />
 *   <button type="submit">Submit</button>
 * </form>
 * ```
 */
export function HoneypotFields() {
  const [timestamp, setTimestamp] = useState<number | null>(null);

  // Set timestamp on mount
  useEffect(() => {
    setTimestamp(Date.now());
  }, []);

  // Common styles to hide from humans but allow bots to fill
  const hiddenStyles: React.CSSProperties = {
    position: "absolute",
    left: "-9999px",
    top: "-9999px",
    width: "1px",
    height: "1px",
    opacity: 0,
    pointerEvents: "none",
  };

  return (
    <>
      {/* Honeypot field - bots will fill this */}
      <div style={hiddenStyles} aria-hidden="true">
        <label htmlFor="hp-website">Website</label>
        <input
          type="text"
          id="hp-website"
          name={HONEYPOT_FIELD_NAME}
          autoComplete="off"
          tabIndex={-1}
        />
      </div>

      {/* Timestamp for timing analysis */}
      <input
        type="hidden"
        name={TIMESTAMP_FIELD_NAME}
        value={timestamp ?? ""}
      />
    </>
  );
}

/**
 * Hook to get honeypot values for form submission
 *
 * Use this with TanStack Form or other controlled forms
 * to include honeypot values in the submission.
 *
 * @example
 * ```tsx
 * function MyForm() {
 *   const { honeypotValues, HoneypotInputs } = useHoneypot();
 *
 *   const handleSubmit = (data) => {
 *     // Include honeypot values in submission
 *     api.post('/endpoint', { ...data, ...honeypotValues });
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <HoneypotInputs />
 *       {/* rest of form *\/}
 *     </form>
 *   );
 * }
 * ```
 */
export function useHoneypot() {
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [honeypot, setHoneypot] = useState("");

  useEffect(() => {
    setTimestamp(Date.now());
  }, []);

  const honeypotValues = {
    [HONEYPOT_FIELD_NAME]: honeypot,
    [TIMESTAMP_FIELD_NAME]: timestamp,
  };

  const HoneypotInputs = () => (
    <>
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: "1px",
          height: "1px",
          opacity: 0,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <label htmlFor="hp-website-hook">Website</label>
        <input
          type="text"
          id="hp-website-hook"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          autoComplete="off"
          tabIndex={-1}
        />
      </div>
      <input
        type="hidden"
        name={TIMESTAMP_FIELD_NAME}
        value={timestamp ?? ""}
      />
    </>
  );

  return {
    honeypotValues,
    // biome-ignore lint/style/useNamingConvention: HoneypotInputs is a React component, PascalCase is correct
    HoneypotInputs,
    timestamp,
    resetTimestamp: () => setTimestamp(Date.now()),
  };
}

/**
 * Get fresh honeypot values for API calls
 *
 * Use this when you need honeypot values without the component.
 */
export function getHoneypotValues(): Record<string, unknown> {
  return {
    [HONEYPOT_FIELD_NAME]: "",
    [TIMESTAMP_FIELD_NAME]: Date.now(),
  };
}
