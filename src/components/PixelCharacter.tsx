import Image from "next/image";

export default function PixelCharacter({ size = 320 }: { size?: number }) {
  return (
    <Image
      src="/character.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      priority
      unoptimized
      style={{
        width: size,
        height: "auto",
        imageRendering: "pixelated",
        display: "block",
      }}
    />
  );
}
