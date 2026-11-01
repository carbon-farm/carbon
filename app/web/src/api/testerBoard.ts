import { apiRequest } from './client';

export type BoardKind = 'BUG' | 'REQUIREMENT' | 'FEEDBACK' | 'QUESTION';
export type BoardStatus = 'NEW' | 'SEEN' | 'IN_PROGRESS' | 'DONE' | 'WONT_DO';

export interface BoardComment {
  id: string;
  authorName: string;
  body: string;
  isSystem: boolean;
  createdAt: string;
}

export interface BoardItem {
  id: string;
  number: number;
  kind: BoardKind;
  location: string | null;
  description: string;
  expected: string | null;
  authorName: string;
  status: BoardStatus;
  createdAt: string;
  updatedAt: string;
  comments: BoardComment[];
}

// The testers' board needs no sign-in: the secret in the page address is the key.
const base = (key: string) => `/tester-feedback/board/${encodeURIComponent(key)}`;

export const listBoard = (key: string) => apiRequest<BoardItem[]>(base(key));

export const postBoardItem = (
  key: string,
  body: { kind: BoardKind; location?: string; description: string; expected?: string; authorName: string; faxExtra?: string },
) => apiRequest<BoardItem | { ok: true }>(base(key), { method: 'POST', body });

export const postBoardReply = (key: string, id: string, body: { authorName: string; body: string; faxExtra?: string }) =>
  apiRequest<unknown>(`${base(key)}/${id}/comments`, { method: 'POST', body });

export const setBoardStatus = (key: string, id: string, body: { status: BoardStatus; by: string }) =>
  apiRequest<BoardItem>(`${base(key)}/${id}/status`, { method: 'PATCH', body });

// Administrator: the secret for the link.
export const getBoardLinkKey = (token: string) => apiRequest<{ key: string }>('/tester-feedback/link', { token });
export const rotateBoardLinkKey = (token: string) => apiRequest<{ key: string }>('/tester-feedback/link/rotate', { method: 'POST', token });
