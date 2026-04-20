export default function PixelCharacter({ size = 160 }: { size?: number }) {
  // 16x16 pixel self-portrait placeholder. 1 = skin, 2 = hair, 3 = shirt, 4 = eye
  const G = [
    "0000002222220000",
    "0000022222222000",
    "0002222222222200",
    "0022222111112200",
    "0022221111111220",
    "0022211111111120",
    "0022111141111410",
    "0002111111111100",
    "0002111111111100",
    "0000211111111000",
    "0000333333330000",
    "0003333333333300",
    "0033333333333330",
    "0033333333333330",
    "0033333333333330",
    "0033300000033330",
  ];
  const palette: Record<string, string> = {
    "0": "transparent",
    "1": "#F1BEBE",
    "2": "#1A1A1A",
    "3": "#FF2F00",
    "4": "#000000",
  };
  const cell = size / 16;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {G.flatMap((row, y) =>
        row.split("").map((c, x) =>
          c === "0" ? null : (
            <rect
              key={`${x}-${y}`}
              x={x * cell}
              y={y * cell}
              width={cell}
              height={cell}
              fill={palette[c]}
            />
          ),
        ),
      )}
    </svg>
  );
}
