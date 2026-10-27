import { randomUUID } from "node:crypto";

const baseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!baseUrl || !anonKey || !serviceKey) {
  throw new Error("SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are required");
}

const runId = randomUUID();
const testLegalDocuments = {
  terms: {
    version: `storage-test-terms-${runId}`,
    content_en: "Synthetic test Terms",
    content_ar: "شروط اختبارية",
  },
  privacy: {
    version: `storage-test-privacy-${runId}`,
    content_en: "Synthetic test Privacy",
    content_ar: "خصوصية اختبارية",
  },
};

async function request(path, { method = "GET", key = serviceKey, token = key, body, headers = {} } = {}) {
  const response = await fetch(new URL(path, baseUrl), {
    method,
    headers: {
      apikey: key,
      authorization: `Bearer ${token}`,
      ...(body instanceof Uint8Array ? {} : body ? { "content-type": "application/json" } : {}),
      ...headers,
    },
    body: body instanceof Uint8Array ? body : body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null);
  return { response, data };
}

function assert(condition, label) {
  if (!condition) throw new Error(`FAIL: ${label}`);
  console.log(`PASS: ${label}`);
}

async function service(path, options = {}) {
  const result = await request(path, options);
  if (!result.response.ok) throw new Error(`Service request failed (${result.response.status})`);
  return result;
}

async function signedInUser(suffix) {
  const email = `pet-storage-${runId}-${suffix}@example.test`;
  const password = `Storage-${randomUUID()}-aA1!`;
  const created = await service("/auth/v1/admin/users", {
    method: "POST",
    body: { email, password, email_confirm: true },
  });
  const userId = created.data?.id;
  if (!userId) throw new Error("Local Auth did not create a disposable user");

  await service(`/rest/v1/profiles?id=eq.${userId}`, {
    method: "PATCH",
    body: { full_name: `Storage ${suffix}`, city_id: "00000000-0000-4000-8000-000000000001" },
    headers: { Prefer: "return=minimal" },
  });
  await service("/rest/v1/consents", {
    method: "POST",
    body: [
      { user_id: userId, type: "terms", version: testLegalDocuments.terms.version },
      { user_id: userId, type: "privacy", version: testLegalDocuments.privacy.version },
    ],
    headers: { Prefer: "return=minimal" },
  });

  const login = await request("/auth/v1/token?grant_type=password", {
    key: anonKey,
    method: "POST",
    body: { email, password },
  });
  if (!login.response.ok || !login.data?.access_token) {
    throw new Error(`Disposable local Auth sign-in failed (${login.response.status})`);
  }

  return { userId, token: login.data.access_token };
}

async function upload(bucket, path, token, type, bytes, upsert = false) {
  return request(`/storage/v1/object/${bucket}/${path.split("/").map(encodeURIComponent).join("/")}`, {
    key: anonKey,
    token,
    method: "POST",
    body: bytes,
    headers: { "content-type": type, "x-upsert": String(upsert) },
  });
}

async function download(bucket, path, token) {
  return request(`/storage/v1/object/authenticated/${bucket}/${path.split("/").map(encodeURIComponent).join("/")}`, {
    key: anonKey,
    token,
  });
}

async function remove(bucket, paths, token, key = anonKey) {
  return request(`/storage/v1/object/${bucket}`, {
    key,
    token,
    method: "DELETE",
    body: { prefixes: paths },
  });
}

const previousConfig = await service(
  "/rest/v1/app_config?key=eq.legal_documents&select=value",
);
const hadLegalConfig = Array.isArray(previousConfig.data) && previousConfig.data.length > 0;
let firstUser;
let secondUser;
const objects = [];

try {
  await service("/rest/v1/app_config?on_conflict=key", {
    method: hadLegalConfig ? "PATCH" : "POST",
    body: hadLegalConfig
      ? { value: testLegalDocuments }
      : { key: "legal_documents", value: testLegalDocuments },
    headers: hadLegalConfig
      ? { Prefer: "return=minimal" }
      : { Prefer: "resolution=merge-duplicates,return=minimal" },
  });

  firstUser = await signedInUser("owner-a");
  secondUser = await signedInUser("owner-b");
  const firstPetId = randomUUID();
  const secondPetId = randomUUID();
  await service("/rest/v1/pets", {
    method: "POST",
    body: [
      { id: firstPetId, owner_id: firstUser.userId, name: "Storage test A", species: "cat", gender: "unknown" },
      { id: secondPetId, owner_id: secondUser.userId, name: "Storage test B", species: "dog", gender: "unknown" },
    ],
    headers: { Prefer: "return=minimal" },
  });

  const photoPath = `${firstUser.userId}/${firstPetId}/${randomUUID()}.png`;
  const documentPath = `${firstUser.userId}/${firstPetId}/${randomUUID()}.pdf`;
  objects.push({ bucket: "pet-photos", path: photoPath }, { bucket: "pet-documents", path: documentPath });
  const png = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const pdf = new TextEncoder().encode("%PDF-1.4\nsynthetic local Storage test\n");

  const photoUpload = await upload("pet-photos", photoPath, firstUser.token, "image/png", png);
  assert(photoUpload.response.ok, "owner uploads a photo under their own pet path");
  const photoRead = await download("pet-photos", photoPath, firstUser.token);
  assert(photoRead.response.ok, "owner downloads their private pet photo");
  const anonymousRead = await download("pet-photos", photoPath, anonKey);
  assert(!anonymousRead.response.ok, "anonymous caller cannot download a private pet photo");

  const foreignRead = await download("pet-photos", photoPath, secondUser.token);
  assert(!foreignRead.response.ok, "another owner cannot download the photo");
  const foreignUpload = await upload("pet-photos", photoPath, secondUser.token, "image/png", png);
  assert(!foreignUpload.response.ok, "another owner cannot upload into the photo path");
  const foreignPetPath = `${firstUser.userId}/${secondPetId}/${randomUUID()}.png`;
  const foreignPetUpload = await upload("pet-photos", foreignPetPath, firstUser.token, "image/png", png);
  assert(!foreignPetUpload.response.ok, "owner cannot use another pet ID in their own folder");

  const overwrite = await upload("pet-photos", photoPath, firstUser.token, "image/png", png, true);
  assert(!overwrite.response.ok, "owner cannot overwrite an existing object through upsert");
  const wrongMime = await upload(
    "pet-photos",
    `${firstUser.userId}/${firstPetId}/${randomUUID()}.txt`,
    firstUser.token,
    "text/plain",
    new TextEncoder().encode("not an image"),
  );
  assert(!wrongMime.response.ok, "photo bucket rejects a disallowed MIME type");
  const oversized = await upload(
    "pet-photos",
    `${firstUser.userId}/${firstPetId}/${randomUUID()}.png`,
    firstUser.token,
    "image/png",
    new Uint8Array(10 * 1024 * 1024 + 1),
  );
  assert(!oversized.response.ok, "photo bucket rejects files larger than 10 MiB");

  const documentUpload = await upload(
    "pet-documents",
    documentPath,
    firstUser.token,
    "application/pdf",
    pdf,
  );
  assert(documentUpload.response.ok, "owner uploads a private PDF under their pet path");
  const documentRead = await download("pet-documents", documentPath, firstUser.token);
  assert(documentRead.response.ok, "owner downloads their private pet document");
  const foreignDocumentRead = await download("pet-documents", documentPath, secondUser.token);
  assert(!foreignDocumentRead.response.ok, "another owner cannot download a pet document");
  const wrongDocumentMime = await upload(
    "pet-documents",
    `${firstUser.userId}/${firstPetId}/${randomUUID()}.webp`,
    firstUser.token,
    "image/webp",
    png,
  );
  assert(!wrongDocumentMime.response.ok, "document bucket rejects a disallowed MIME type");
  const oversizedDocument = await upload(
    "pet-documents",
    `${firstUser.userId}/${firstPetId}/${randomUUID()}.pdf`,
    firstUser.token,
    "application/pdf",
    new Uint8Array(10 * 1024 * 1024 + 1),
  );
  assert(!oversizedDocument.response.ok, "document bucket rejects files larger than 10 MiB");

  await remove("pet-documents", [documentPath], secondUser.token);
  const stillThere = await download("pet-documents", documentPath, firstUser.token);
  assert(stillThere.response.ok, "another owner cannot delete the document");

  await service(`/rest/v1/profiles?id=eq.${firstUser.userId}`, {
    method: "PATCH",
    body: { status: "suspended" },
    headers: { Prefer: "return=minimal" },
  });
  const suspendedRead = await download("pet-photos", photoPath, firstUser.token);
  assert(!suspendedRead.response.ok, "suspended owner cannot access a stored photo");

  await service(`/rest/v1/profiles?id=eq.${firstUser.userId}`, {
    method: "PATCH",
    body: { status: "active" },
    headers: { Prefer: "return=minimal" },
  });
  await service(`/rest/v1/profiles?id=eq.${firstUser.userId}`, {
    method: "PATCH",
    body: { status: "deleted", deleted_at: new Date().toISOString() },
    headers: { Prefer: "return=minimal" },
  });
  const deletedAccountRead = await download("pet-documents", documentPath, firstUser.token);
  assert(!deletedAccountRead.response.ok, "deleted owner cannot access a stored document");
  await service(`/rest/v1/profiles?id=eq.${firstUser.userId}`, {
    method: "PATCH",
    body: { status: "active", deleted_at: null },
    headers: { Prefer: "return=minimal" },
  });

  const deleteOwn = await remove("pet-photos", [photoPath], firstUser.token);
  assert(deleteOwn.response.ok, "owner can remove their own photo through Storage API");
  const softDelete = await request("/rest/v1/rpc/delete_pet", {
    key: anonKey,
    token: firstUser.token,
    method: "POST",
    body: { p_pet_id: firstPetId },
  });
  assert(softDelete.response.ok && softDelete.data?.status === "deleted", "owner soft-deletes pet through the protected RPC");
  const deletedPetDocumentRead = await download("pet-documents", documentPath, firstUser.token);
  assert(!deletedPetDocumentRead.response.ok, "soft-deleted pet's files are no longer accessible");
} finally {
  const cleanupErrors = [];
  for (const bucket of ["pet-photos", "pet-documents"]) {
    const paths = objects.filter((object) => object.bucket === bucket).map((object) => object.path);
    if (paths.length) {
      try {
        const result = await remove(bucket, paths, serviceKey, serviceKey);
        if (!result.response.ok) cleanupErrors.push(`${bucket} Storage removal returned ${result.response.status}`);
      } catch {
        cleanupErrors.push(`${bucket} Storage removal failed`);
      }
    }
  }
  for (const user of [firstUser, secondUser]) {
    if (user?.userId) {
      try {
        // The consent FK intentionally prevents deleting an Auth identity while
        // consent evidence still exists. These rows belong only to this
        // disposable local fixture and must be removed before the Auth user.
        await service(`/rest/v1/consents?user_id=eq.${user.userId}`, { method: "DELETE" });
        const result = await request(`/auth/v1/admin/users/${user.userId}`, { method: "DELETE" });
        if (!result.response.ok) cleanupErrors.push(`Auth user deletion returned ${result.response.status}`);
      } catch {
        cleanupErrors.push("Disposable consent/Auth cleanup failed");
      }
    }
  }

  try {
    if (hadLegalConfig) {
      await service("/rest/v1/app_config?key=eq.legal_documents", {
        method: "PATCH",
        body: previousConfig.data[0],
        headers: { Prefer: "return=minimal" },
      });
    } else {
      await service("/rest/v1/app_config?key=eq.legal_documents", { method: "DELETE" });
    }
  } catch {
    cleanupErrors.push("Synthetic legal config restore failed");
  }
  try {
    const remaining = await service("/auth/v1/admin/users?page=1&per_page=1000");
    if ((remaining.data?.users ?? []).some((user) => user.email?.startsWith("pet-storage-"))) {
      cleanupErrors.push("Synthetic Auth fixtures remain after cleanup");
    }
  } catch {
    cleanupErrors.push("Synthetic Auth fixture cleanup verification failed");
  }
  if (cleanupErrors.length) throw new Error(`Local fixture cleanup needs attention: ${cleanupErrors.join(", ")}`);
  console.log("PASS: disposable Auth, pet, Storage, and legal-config fixtures were cleaned/restored");
}
