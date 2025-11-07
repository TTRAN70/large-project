export type MockUser = { id: string; username: string; bio?: string };

export const mockUsers: MockUser[] = [
  { id: "u1", username: "samus",   bio: "Metroidvania enjoyer." },
  { id: "u2", username: "cloud9",  bio: "JRPGs and coffee." },
  { id: "u3", username: "katamari", bio: "Rolling through backlogs." },
  { id: "u4", username: "shepard", bio: "Paragade choices only." },
];
