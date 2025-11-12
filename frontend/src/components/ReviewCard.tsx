// src/components/GameCard.tsx
type Props = {
  user: string;
  rating: number;
  body: string;
  createdAt: Date;
};
export default function GameCard({
  user, rating, body, createdAt
}: Props) {

  return (
    <div className="rounded-2xl border border-[rgba(30,195,255,0.25)] bg-[rgba(8,25,38,0.6)] p-4">
        <div className="text-sm text-[#a7e9ff]">{user}'s Review</div>
            <div className="text-lg font-semibold text-white">{rating}/10</div>
            <p className="mt-1 text-sm text-gray-300">{body || "—"}</p>
            <p className="mt-1 text-sm text-gray-300">{createdAt.toString() || "—"}</p>
    </div>
  );
}
