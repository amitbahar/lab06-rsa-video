// Full video: scenes in sequence, each with its narration. OWNED BY STEP 0 — do not edit.
import React from 'react';
import {Audio, Series, staticFile} from 'remotion';
import durations from './durations.json';
import {SCENES} from './scenes';

type Durations = Record<string, {seconds: number; frames: number}>;
export const sceneFrames = (id: string) => (durations as Durations)[id].frames;
export const totalFrames = SCENES.reduce((sum, s) => sum + sceneFrames(s.id), 0);

/** One scene + its narration (narration starts 6 frames in, after the fade-in begins). */
export const SceneWithAudio: React.FC<{id: string; component: React.FC}> = ({id, component: C}) => (
  <>
    <C />
    <Series>
      <Series.Sequence durationInFrames={6} layout="none">
        <></>
      </Series.Sequence>
      <Series.Sequence durationInFrames={sceneFrames(id) - 6} layout="none">
        <Audio src={staticFile(`audio/${id}.wav`)} />
      </Series.Sequence>
    </Series>
  </>
);

export const Main: React.FC = () => (
  <Series>
    {SCENES.map((s) => (
      <Series.Sequence key={s.id} durationInFrames={sceneFrames(s.id)}>
        <SceneWithAudio id={s.id} component={s.component} />
      </Series.Sequence>
    ))}
  </Series>
);
