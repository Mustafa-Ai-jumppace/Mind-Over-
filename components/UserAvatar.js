export default function UserAvatar({ user, size = 36 }) {
  const src = user?.profilePicture;
  const name = user?.name || user?.email || "User";
  const initials = name
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className="avatar-img"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="avatar"
      style={{ width: size, height: size, fontSize: size / 2.6 }}
    >
      {initials}
    </div>
  );
}
