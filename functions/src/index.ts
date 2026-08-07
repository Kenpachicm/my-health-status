import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";

initializeApp();
const db = getFirestore();
const messaging = getMessaging();

// ═══════════════════════════════════════════════════════════════════
// validateShareAccess — existing function from previous task
// ═══════════════════════════════════════════════════════════════════

export const validateShareAccess = onRequest(
  { cors: true },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type");
      res.status(204).end();
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const { share_token, access_code, user_agent } = req.body || {};

    if (!share_token || typeof share_token !== "string") {
      res.status(400).json({ error: "Missing share_token" });
      return;
    }

    const rawIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.ip ||
      "unknown";

    const shareQuery = await db
      .collection("shares")
      .where("share_token", "==", share_token)
      .limit(1)
      .get();

    if (shareQuery.empty) {
      await logAccessAttempt(db, {
        share_id: null,
        share_token,
        status: "failed",
        reason: "not_found",
        ip_address: rawIp,
        user_agent: user_agent || null,
      });
      res.status(404).json({ valid: false, error: "Share not found or has been revoked." });
      return;
    }

    const shareDoc = shareQuery.docs[0];
    const shareId = shareDoc.id;
    const share = shareDoc.data();
    const now = Date.now();

    if (share.is_active === false) {
      await logAccessAttempt(db, {
        share_id: shareId,
        share_token,
        status: "failed",
        reason: "revoked",
        ip_address: rawIp,
        user_agent: user_agent || null,
      });
      res.status(403).json({ valid: false, error: "This share has been revoked by the owner." });
      return;
    }

    let expiresAtMs: number | null = null;
    if (share.expires_at) {
      const v = share.expires_at;
      if (typeof v === "string") expiresAtMs = new Date(v).getTime();
      else if (v && typeof (v as any).toMillis === "function") expiresAtMs = (v as any).toMillis();
      else if (typeof v === "number") expiresAtMs = v;
    }

    if (expiresAtMs !== null && expiresAtMs < now) {
      await logAccessAttempt(db, {
        share_id: shareId,
        share_token,
        status: "failed",
        reason: "expired",
        ip_address: rawIp,
        user_agent: user_agent || null,
      });
      res.status(403).json({ valid: false, error: "This share link has expired." });
      return;
    }

    if (share.require_access_code === true) {
      if (!access_code || access_code !== share.access_code) {
        await logAccessAttempt(db, {
          share_id: shareId,
          share_token,
          status: "failed",
          reason: "invalid_access_code",
          ip_address: rawIp,
          user_agent: user_agent || null,
        });
        res.status(403).json({
          valid: false,
          error: "Invalid or missing access code.",
          requires_access_code: true,
        });
        return;
      }
    }

    const shareResultsSnap = await db
      .collection("share_results")
      .where("share_id", "==", shareId)
      .get();

    const testResults: any[] = [];
    for (const srDoc of shareResultsSnap.docs) {
      const trId = srDoc.data().test_result_id;
      if (!trId) continue;
      const trDoc = await db.collection("test_results").doc(trId).get();
      if (trDoc.exists) {
        const d = trDoc.data()!;
        testResults.push({
          id: trDoc.id,
          file_name: d.file_name || "",
          file_type: d.file_type || "",
          file_url: d.file_url || "",
          test_date: d.test_date || null,
          test_types: d.test_types || [],
          facility_name: d.facility_name || "",
          notes: d.notes || "",
        });
      }
    }

    let memberId: string | null = null;
    if (share.user_id) {
      const ownerDoc = await db.collection("users").doc(share.user_id).get();
      if (ownerDoc.exists) memberId = ownerDoc.data()!.member_id || null;
    }

    await shareDoc.ref.update({
      view_count: FieldValue.increment(1),
      last_viewed_at: FieldValue.serverTimestamp(),
    });

    await logAccessAttempt(db, {
      share_id: shareId,
      share_token,
      status: "success",
      reason: null,
      ip_address: rawIp,
      user_agent: user_agent || null,
      user_id: share.user_id || null,
    });

    res.status(200).json({
      valid: true,
      share: {
        id: shareId,
        share_token: share.share_token,
        share_type: share.share_type || null,
        personal_message: share.personal_message || null,
        expires_at: share.expires_at || null,
        created_at: share.created_at || null,
      },
      test_results: testResults,
      member: { member_id: memberId },
    });
  },
);

// ═══════════════════════════════════════════════════════════════════
// FCM Push Notification Helpers
// ═══════════════════════════════════════════════════════════════════

async function sendPushToUser(
  userId: string,
  notification: { title: string; body: string },
  data?: Record<string, string>,
): Promise<void> {
  const tokenDoc = await db.collection("fcm_tokens").doc(userId).get();
  if (!tokenDoc.exists) return;

  const token = tokenDoc.data()!.token;
  if (!token) return;

  try {
    await messaging.send({
      token,
      notification,
      data: data || {},
      android: { priority: "high" },
      apns: {
        payload: {
          aps: { badge: 1, sound: "default" },
        },
      },
    });
  } catch (err: any) {
    console.error(`Failed to send push to ${userId}:`, err?.message);

    // If the token is invalid/unregistered, remove it so future sends
    // don't keep failing on a stale token.
    if (
      err?.code === "messaging/invalid-registration-token" ||
      err?.code === "messaging/registration-token-not-registered"
    ) {
      await db.collection("fcm_tokens").doc(userId).delete();
    }
  }
}

async function getNotificationPrefs(
  userId: string,
): Promise<{
  push_new_results: boolean;
  push_share_created: boolean;
  push_share_expiring: boolean;
  push_share_revoked: boolean;
}> {
  const snap = await db.collection("notification_preferences").doc(userId).get();
  if (!snap.exists) {
    // Default: all notifications enabled
    return {
      push_new_results: true,
      push_share_created: true,
      push_share_expiring: true,
      push_share_revoked: true,
    };
  }
  const data = snap.data()!;
  return {
    push_new_results: data.push_new_results ?? true,
    push_share_created: data.push_share_created ?? true,
    push_share_expiring: data.push_share_expiring ?? true,
    push_share_revoked: data.push_share_revoked ?? true,
  };
}

// ═══════════════════════════════════════════════════════════════════
// 1. New lab results uploaded → notify the patient
// ═══════════════════════════════════════════════════════════════════

export const onTestResultCreated = onDocumentCreated(
  "test_results/{resultId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const result = snapshot.data()!;
    const userId = result.user_id;
    if (!userId) return;

    const prefs = await getNotificationPrefs(userId);
    if (!prefs.push_new_results) return;

    const facilityName = result.facility_name || "your healthcare provider";
    const testDate = result.test_date
      ? new Date(result.test_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "recently";

    await sendPushToUser(
      userId,
      {
        title: "New Lab Results Available",
        body: `Results from ${facilityName} (${testDate}) are now available in your dashboard.`,
      },
      {
        type: "new_results",
        result_id: event.params.resultId,
      },
    );
  },
);

// ═══════════════════════════════════════════════════════════════════
// 2. New share created → notify the patient (confirmation)
// ═══════════════════════════════════════════════════════════════════

export const onShareCreated = onDocumentCreated(
  "shares/{shareId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const share = snapshot.data()!;
    const userId = share.user_id;
    if (!userId) return;

    const prefs = await getNotificationPrefs(userId);
    if (!prefs.push_share_created) return;

    const shareType = share.share_type === "qr_code" ? "QR code" : "secure link";

    await sendPushToUser(
      userId,
      {
        title: "Share Created Successfully",
        body: `Your ${shareType} share is ready. You can track its status in My Shares.`,
      },
      {
        type: "share_created",
        share_id: event.params.shareId,
      },
    );
  },
);

// ═══════════════════════════════════════════════════════════════════
// 3. Share revoked → notify the patient
// ═══════════════════════════════════════════════════════════════════

export const onShareRevoked = onDocumentUpdated(
  "shares/{shareId}",
  async (event) => {
    const beforeData = event.data?.before?.data();
    const afterData = event.data?.after?.data();
    if (!beforeData || !afterData) return;

    // Only fire when is_active transitions from true → false
    if (beforeData.is_active !== true || afterData.is_active !== false) return;

    const userId = afterData.user_id;
    if (!userId) return;

    const prefs = await getNotificationPrefs(userId);
    if (!prefs.push_share_revoked) return;

    await sendPushToUser(
      userId,
      {
        title: "Share Revoked",
        body: "Your share link has been revoked and is no longer accessible to recipients.",
      },
      {
        type: "share_revoked",
        share_id: event.params.shareId,
      },
    );
  },
);

// ═══════════════════════════════════════════════════════════════════
// 4. Scheduled: check for shares expiring within 24 hours
//    Runs every hour, notifies each patient once per share.
// ═══════════════════════════════════════════════════════════════════

export const checkExpiringShares = onSchedule(
  { schedule: "0 * * * *", timeZone: "America/New_York" },
  async () => {
    const now = Date.now();
    const twentyFourHoursFromNow = now + 24 * 60 * 60 * 1000;

    // Query active shares
    const activeSharesSnap = await db
      .collection("shares")
      .where("is_active", "==", true)
      .get();

    for (const shareDoc of activeSharesSnap.docs) {
      const share = shareDoc.data();
      const expiresAt = share.expires_at;

      if (!expiresAt) continue;

      let expiresAtMs: number;
      if (typeof expiresAt === "string") expiresAtMs = new Date(expiresAt).getTime();
      else if (expiresAt && typeof expiresAt.toMillis === "function") expiresAtMs = expiresAt.toMillis();
      else if (typeof expiresAt === "number") expiresAtMs = expiresAt;
      else continue;

      // Only notify if expiring within the next 24 hours
      if (expiresAtMs <= now || expiresAtMs > twentyFourHoursFromNow) continue;

      // Skip if we already sent an expiry warning for this share
      if (share.expiry_notified === true) continue;

      const userId = share.user_id;
      if (!userId) continue;

      const prefs = await getNotificationPrefs(userId);
      if (!prefs.push_share_expiring) continue;

      const hoursLeft = Math.ceil((expiresAtMs - now) / (60 * 60 * 1000));
      const shareToken = share.share_token || "";
      const shareLabel = shareToken.length > 8 ? shareToken.slice(0, 8) : shareToken;

      await sendPushToUser(
        userId,
        {
          title: "Share Expiring Soon",
          body: `Your share #${shareLabel} expires in ${hoursLeft} hour${hoursLeft !== 1 ? "s" : ""}. Renew or let it expire.`,
        },
        {
          type: "share_expiring",
          share_id: shareDoc.id,
        },
      );

      // Mark as notified so we don't send again
      await shareDoc.ref.update({ expiry_notified: true });
    }
  },
);

// ═══════════════════════════════════════════════════════════════════
// Access log helper (existing)
// ═══════════════════════════════════════════════════════════════════

async function logAccessAttempt(
  db: FirebaseFirestore.Firestore,
  entry: {
    share_id: string | null;
    share_token: string;
    status: "success" | "failed";
    reason: string | null;
    ip_address: string;
    user_agent: string | null;
    user_id?: string | null;
  },
): Promise<void> {
  const logData = {
    share_id: entry.share_id,
    share_token: entry.share_token,
    status: entry.status,
    reason: entry.reason,
    ip_address: entry.ip_address,
    user_agent: entry.user_agent,
    user_id: entry.user_id ?? null,
    accessed_at: FieldValue.serverTimestamp(),
    created_at: FieldValue.serverTimestamp(),
  };

  try {
    await db.collection("access_logs").add(logData);

    if (entry.share_id && entry.user_id) {
      await db.collection("share_access_logs").add(logData);
    }
  } catch (err) {
    console.error("Failed to write access log:", err);
  }
}
