import { Composition } from "remotion";
import { PsaVideo, PSA_TOTAL_FRAMES } from "./PsaVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PsaVideo"
        component={PsaVideo}
        durationInFrames={PSA_TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
