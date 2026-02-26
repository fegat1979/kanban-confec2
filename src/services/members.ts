// FILE: src/services/members.ts
import { db } from "../lib/firebase";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  getDoc,
  query,
  orderBy,
} from "firebase/firestore";

export type MemberRole = "admin" | "editor" | "viewer";

export type Member = {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string | null;
  role: MemberRole;
  addedAt?: any;
};

export type JoinRequest = {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string | null;
  createdAt?: any;
};

/**
 * Assina a role do usuário no board.
 * - Retorna `null` quando não existe doc de membro (usuário não autorizado).
 * - Em caso de erro (ex.: permissão), chama `onError` e retorna `null` no callback principal.
 */
export function subscribeMemberRole(
  boardId: string,
  uid: string,
  cb: (role: MemberRole | null) => void,
  onError?: (err: any) => void
) {
  const ref = doc(db, "boards", boardId, "members", uid);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        cb(null);
        return;
      }
      const data = snap.data() as any;
      cb((data.role as MemberRole) ?? "viewer");
    },
    (err) => {
      console.error("[subscribeMemberRole] permission/other error:", err);
      onError?.(err);
      cb(null);
    }
  );
}

/** Lista membros do board (apenas para quem pode ler a coleção). */
export function subscribeMembers(boardId: string, cb: (arr: Member[]) => void) {
  const q = query(collection(db, "boards", boardId, "members"), orderBy("addedAt", "desc"));
  return onSnapshot(q, (snap) => {
    const out: Member[] = [];
    snap.forEach((d) => {
      const x = d.data() as any;
      out.push({
        uid: d.id,
        email: x.email,
        displayName: x.displayName,
        photoURL: x.photoURL ?? null,
        role: (x.role as MemberRole) ?? "viewer",
        addedAt: x.addedAt,
      });
    });
    cb(out);
  });
}

/** Lista pedidos de acesso pendentes. */
export function subscribeJoinRequests(boardId: string, cb: (arr: JoinRequest[]) => void) {
  const q = query(collection(db, "boards", boardId, "joinRequests"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const out: JoinRequest[] = [];
    snap.forEach((d) => {
      const x = d.data() as any;
      out.push({
        uid: d.id,
        email: x.email,
        displayName: x.displayName,
        photoURL: x.photoURL ?? null,
        createdAt: x.createdAt,
      });
    });
    cb(out);
  });
}

/**
 * Aprova um pedido de acesso movendo-o para members/{uid} com a role informada
 * e removendo de joinRequests/{uid}.
 */
export async function approveJoinRequest(boardId: string, reqUid: string, role: MemberRole = "viewer") {
  const jrRef = doc(db, "boards", boardId, "joinRequests", reqUid);
  const jrSnap = await getDoc(jrRef);
  if (!jrSnap.exists()) throw new Error("Pedido não encontrado");

  const data = jrSnap.data() as any;

  const mRef = doc(db, "boards", boardId, "members", reqUid);
  await setDoc(
    mRef,
    {
      role,
      email: data.email ?? null,
      displayName: data.displayName ?? null,
      photoURL: data.photoURL ?? null,
      addedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await deleteDoc(jrRef);
}

/** Recusa (apaga) um pedido de acesso. */
export async function denyJoinRequest(boardId: string, reqUid: string) {
  const jrRef = doc(db, "boards", boardId, "joinRequests", reqUid);
  await deleteDoc(jrRef);
}

/** Altera a role de um membro existente. */
export async function setMemberRole(boardId: string, uid: string, role: MemberRole) {
  const mRef = doc(db, "boards", boardId, "members", uid);
  await updateDoc(mRef, { role });
}

/** Remove um membro do board. */
export async function removeMember(boardId: string, uid: string) {
  const mRef = doc(db, "boards", boardId, "members", uid);
  await deleteDoc(mRef);
}

/** Envia (ou atualiza) um pedido de acesso para o board. */
export async function requestAccess(boardId: string, user: any) {
  const ref = doc(db, "boards", boardId, "joinRequests", user.uid);
  await setDoc(
    ref,
    {
      uid: user.uid,
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}
