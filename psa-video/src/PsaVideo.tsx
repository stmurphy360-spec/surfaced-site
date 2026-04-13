import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

const BRAND = "#1B976A";
const BRAND_DARK = "#0F6B4A";
const BG = "#FFFFFF";
const MUTED = "#6B7280";

const FONT_STACK =
  '"Inter", "Helvetica Neue", "Arial", system-ui, -apple-system, sans-serif';

/**
 * Timeline (30fps). Each scene has a start frame and duration.
 * Pauses between scenes are created by leaving gaps.
 */
type Scene = {
  from: number;
  duration: number;
  render: () => React.ReactNode;
};

const scenes: Scene[] = [
  // 1. Intro
  {
    from: 0,
    duration: 45,
    render: () => <LineText text="Now you can" size={140} />,
  },
  // 2. EMPHASIS: "sell some or all"
  {
    from: 45,
    duration: 75,
    render: () => (
      <EmphasisText text="sell some or all" size={220} underline />
    ),
  },
  // 3. Bridge
  {
    from: 120,
    duration: 60,
    render: () => (
      <LineText text="of your structured settlement for a" size={110} />
    ),
  },
  // 4. EMPHASIS: "significant amount of cash"
  {
    from: 180,
    duration: 90,
    render: () => (
      <EmphasisText text="significant amount of cash" size={200} underline />
    ),
  },
  // Pause 270-300
  // 5. EMPHASIS: "Inflation is real and unpredictable"
  {
    from: 300,
    duration: 120,
    render: () => (
      <StackedText
        lines={[
          { text: "Inflation is real", emphasis: false },
          { text: "and unpredictable.", emphasis: true },
        ]}
      />
    ),
  },
  // Pause 420-450
  // 6. JG Wentworth intro
  {
    from: 450,
    duration: 90,
    render: () => (
      <LineText text="JG Wentworth makes it possible" size={120} />
    ),
  },
  {
    from: 540,
    duration: 90,
    render: () => (
      <LineText
        text="to convert some or all of your structured settlement"
        size={90}
      />
    ),
  },
  {
    from: 630,
    duration: 90,
    render: () => (
      <LineText text="into a sizeable amount of cash now." size={110} />
    ),
  },
  // Pause 720-750
  // 7. Contact
  {
    from: 750,
    duration: 90,
    render: () => (
      <LineText text="To learn how you can gain control" size={110} />
    ),
  },
  {
    from: 840,
    duration: 75,
    render: () => (
      <LineText text="of your structured settlement," size={110} />
    ),
  },
  {
    from: 915,
    duration: 75,
    render: () => (
      <LineText text="contact JG Wentworth now at" size={110} />
    ),
  },
  // 8. BIG EMPHASIS: 877 CASH NOW
  {
    from: 990,
    duration: 135,
    render: () => <PhoneEmphasis />,
  },
  // Pause 1125-1155
  // 9. Discover
  {
    from: 1155,
    duration: 90,
    render: () => <LineText text="Discover how simple it is" size={120} />,
  },
  {
    from: 1245,
    duration: 90,
    render: () => (
      <LineText text="to receive the cash you want" size={120} />
    ),
  },
  {
    from: 1335,
    duration: 90,
    render: () => (
      <LineText text="from your structured settlement today." size={110} />
    ),
  },
  // Pause 1425-1455
  // 10. Call with no obligation
  {
    from: 1455,
    duration: 90,
    render: () => (
      <StackedText
        lines={[
          { text: "Call 877 CASH NOW", emphasis: false },
          { text: "with", emphasis: false, small: true },
        ]}
      />
    ),
  },
  {
    from: 1545,
    duration: 105,
    render: () => <EmphasisText text="no obligation." size={220} underline />,
  },
  // Pause 1650-1680
  // 11. Life changing
  {
    from: 1680,
    duration: 60,
    render: () => <LineText text="The benefits could be" size={130} />,
  },
  {
    from: 1740,
    duration: 120,
    render: () => <EmphasisText text="life changing." size={240} underline />,
  },
  // Pause 1860-1890
  // 12. Disclaimer
  {
    from: 1890,
    duration: 150,
    render: () => <Disclaimer />,
  },
  // 13. Final CTA
  {
    from: 2040,
    duration: 180,
    render: () => <FinalCTA />,
  },
];

export const PSA_TOTAL_FRAMES = 2220;

export const PsaVideo: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        fontFamily: FONT_STACK,
      }}
    >
      {/* Subtle corner accent marks for brand polish */}
      <CornerMarks />

      {scenes.map((scene, i) => (
        <Sequence
          key={i}
          from={scene.from}
          durationInFrames={scene.duration}
          layout="none"
        >
          {scene.render()}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/* ----------------------------- Text primitives ---------------------------- */

const useEnterExit = (duration: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 120, mass: 0.6 },
    durationInFrames: 18,
  });

  // Fade out during final 12 frames
  const exitStart = duration - 12;
  const exit = interpolate(frame, [exitStart, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = Math.min(enter, exit);
  const translateY = interpolate(enter, [0, 1], [40, 0]);
  const scale = interpolate(enter, [0, 1], [0.96, 1]);

  return { opacity, translateY, scale, frame };
};

const LineText: React.FC<{ text: string; size: number }> = ({ text, size }) => {
  const { durationInFrames } = useVideoConfig();
  const { opacity, translateY, scale } = useEnterExit(durationInFrames);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 160px",
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px) scale(${scale})`,
          color: BRAND,
          fontSize: size,
          fontWeight: 600,
          lineHeight: 1.1,
          textAlign: "center",
          letterSpacing: "-0.02em",
          maxWidth: 1600,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

const EmphasisText: React.FC<{
  text: string;
  size: number;
  underline?: boolean;
}> = ({ text, size, underline }) => {
  const { durationInFrames, fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const { opacity, translateY } = useEnterExit(durationInFrames);

  // Punchy scale-in for emphasis
  const pop = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 180, mass: 0.8 },
    durationInFrames: 22,
  });
  const scale = interpolate(pop, [0, 1], [0.7, 1]);

  // Underline draw
  const underlineProgress = interpolate(
    frame,
    [14, 34],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 120px",
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px) scale(${scale})`,
          color: BRAND,
          fontSize: size,
          fontWeight: 900,
          lineHeight: 1.05,
          textAlign: "center",
          letterSpacing: "-0.03em",
          maxWidth: 1700,
          position: "relative",
          padding: "0 20px 30px 20px",
        }}
      >
        {text}
        {underline && (
          <div
            style={{
              position: "absolute",
              left: 20,
              right: 20,
              bottom: 8,
              height: 10,
              backgroundColor: BRAND,
              borderRadius: 6,
              transform: `scaleX(${underlineProgress})`,
              transformOrigin: "left center",
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};

const StackedText: React.FC<{
  lines: { text: string; emphasis?: boolean; small?: boolean }[];
}> = ({ lines }) => {
  const { durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const { opacity } = useEnterExit(durationInFrames);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 24,
        padding: "0 120px",
      }}
    >
      {lines.map((line, i) => {
        const lineDelay = i * 12;
        const lineProgress = interpolate(
          frame,
          [lineDelay, lineDelay + 18],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        const translateY = interpolate(lineProgress, [0, 1], [50, 0]);
        const lineOpacity = Math.min(opacity, lineProgress);
        const size = line.small ? 80 : line.emphasis ? 200 : 130;

        return (
          <div
            key={i}
            style={{
              opacity: lineOpacity,
              transform: `translateY(${translateY}px)`,
              color: BRAND,
              fontSize: size,
              fontWeight: line.emphasis ? 900 : 600,
              lineHeight: 1.05,
              textAlign: "center",
              letterSpacing: line.emphasis ? "-0.03em" : "-0.02em",
            }}
          >
            {line.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* -------------------------- Specialized components ------------------------ */

const PhoneEmphasis: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const { opacity, translateY } = useEnterExit(durationInFrames);

  const pop = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 160, mass: 0.9 },
    durationInFrames: 28,
  });
  const scale = interpolate(pop, [0, 1], [0.6, 1]);

  // Subtle pulse
  const pulse = 1 + Math.sin(frame * 0.12) * 0.012;

  const underlineProgress = interpolate(frame, [18, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 40,
      }}
    >
      <div
        style={{
          opacity: opacity * 0.85,
          fontSize: 60,
          fontWeight: 500,
          color: MUTED,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
        }}
      >
        Call Now
      </div>
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px) scale(${scale * pulse})`,
          color: BRAND,
          fontSize: 320,
          fontWeight: 900,
          lineHeight: 1,
          textAlign: "center",
          letterSpacing: "-0.04em",
          position: "relative",
          padding: "0 40px 40px 40px",
        }}
      >
        877 CASH NOW
        <div
          style={{
            position: "absolute",
            left: 40,
            right: 40,
            bottom: 10,
            height: 14,
            backgroundColor: BRAND,
            borderRadius: 7,
            transform: `scaleX(${underlineProgress})`,
            transformOrigin: "left center",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const Disclaimer: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exit = interpolate(
    frame,
    [durationInFrames - 14, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const opacity = Math.min(enter, exit);
  const translateY = interpolate(enter, [0, 1], [30, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 220px",
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          color: MUTED,
          fontSize: 44,
          fontWeight: 400,
          lineHeight: 1.4,
          textAlign: "center",
          maxWidth: 1500,
          letterSpacing: "-0.005em",
        }}
      >
        Sales of Structured Settlement Payments are subject to Court Approval
        and other conditions which can take 60–90 days to complete. All
        transactions are at our sole discretion.
      </div>
    </AbsoluteFill>
  );
};

const FinalCTA: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const enter = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 140, mass: 0.8 },
    durationInFrames: 30,
  });

  const tagIn = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const phoneIn = interpolate(frame, [30, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subIn = interpolate(frame, [55, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const exit = interpolate(
    frame,
    [durationInFrames - 18, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const tagScale = interpolate(enter, [0, 1], [0.9, 1]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 40,
        opacity: exit,
      }}
    >
      <div
        style={{
          opacity: tagIn,
          transform: `scale(${tagScale})`,
          color: BRAND_DARK,
          fontSize: 68,
          fontWeight: 500,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
        }}
      >
        Gain Control Today
      </div>

      <div
        style={{
          opacity: phoneIn,
          transform: `scale(${interpolate(phoneIn, [0, 1], [0.85, 1])})`,
          color: BRAND,
          fontSize: 300,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: "-0.04em",
          textAlign: "center",
        }}
      >
        877 CASH NOW
      </div>

      <div
        style={{
          opacity: subIn,
          transform: `translateY(${interpolate(subIn, [0, 1], [20, 0])}px)`,
          color: MUTED,
          fontSize: 54,
          fontWeight: 400,
          letterSpacing: "0.02em",
          marginTop: 10,
        }}
      >
        No obligation · Free consultation
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------- Accents -------------------------------- */

const CornerMarks: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const mark = (
    style: React.CSSProperties,
  ): React.CSSProperties => ({
    position: "absolute",
    width: 80,
    height: 80,
    borderColor: BRAND,
    opacity: opacity * 0.35,
    ...style,
  });

  return (
    <AbsoluteFill>
      <div
        style={mark({
          top: 60,
          left: 60,
          borderTop: `6px solid ${BRAND}`,
          borderLeft: `6px solid ${BRAND}`,
        })}
      />
      <div
        style={mark({
          top: 60,
          right: 60,
          borderTop: `6px solid ${BRAND}`,
          borderRight: `6px solid ${BRAND}`,
        })}
      />
      <div
        style={mark({
          bottom: 60,
          left: 60,
          borderBottom: `6px solid ${BRAND}`,
          borderLeft: `6px solid ${BRAND}`,
        })}
      />
      <div
        style={mark({
          bottom: 60,
          right: 60,
          borderBottom: `6px solid ${BRAND}`,
          borderRight: `6px solid ${BRAND}`,
        })}
      />
    </AbsoluteFill>
  );
};
