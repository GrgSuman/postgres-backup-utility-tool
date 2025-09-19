export const validatePGURL = (url) => {
  try {
    const u = new URL(url);
    return (
      ["postgres:", "postgresql:"].includes(u.protocol) &&
      !!u.hostname &&
      !!u.pathname
    );
  } catch {
    return false;
  }
};


const ALLOWED_ACTIONS = ["migrate", "backup"];
const ALLOWED_FORMATS = ["tar", "sql"];
const ALLOWED_DB_TYPES = ["postgres"];

export const validateBackupRequest = ({
  action,
  outputFormat,
  dbType,
  sourceUrl,
  destUrl,
}) => {
  // Early validation checks
  if (!ALLOWED_ACTIONS.includes(action)) {
    return { valid: false, message: "Invalid action" };
  }

  if (!ALLOWED_FORMATS.includes(outputFormat)) {
    return { valid: false, message: "Invalid output format" };
  }

  if (!ALLOWED_DB_TYPES.includes(dbType)) {
    return { valid: false, message: "Invalid DB type" };
  }

  // PostgreSQL URL validation
  if (dbType === "postgres") {
    if (!validatePGURL(sourceUrl)) {
      return { valid: false, message: "Invalid source URL" };
    }

    // Only validate destination URL for migration
    if (action === "migrate" && !validatePGURL(destUrl)) {
      return { valid: false, message: "Invalid destination URL" };
    }
  }

  return { valid: true };
};
