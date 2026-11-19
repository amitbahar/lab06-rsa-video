// OWNED BY STEP 0 — do not edit.
import React from 'react';
import {Composition, Folder} from 'remotion';
import {Main, SceneWithAudio, sceneFrames, totalFrames} from './Main';
import {SCENES} from './scenes';
import {TestClip} from './TestClip';
import {FPS, HEIGHT, WIDTH} from './shared/theme';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="RSA" component={Main} durationInFrames={totalFrames} fps={FPS} width={WIDTH} height={HEIGHT} />
    {/* One composition per scene so each can be previewed/rendered on its own, e.g. `npx remotion still S05 --frame=200` */}
    <Folder name="Scenes">
      {SCENES.map((s) => (
        <Composition
          key={s.id}
          id={s.id}
          component={() => <SceneWithAudio id={s.id} component={s.component} />}
          durationInFrames={sceneFrames(s.id)}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
    </Folder>
    <Composition id="TestClip" component={TestClip} durationInFrames={150} fps={30} width={1920} height={1080} />
  </>
);
